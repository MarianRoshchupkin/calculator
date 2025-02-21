import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {Camera, useCameraDevices, useFrameProcessor, Frame, VisionCameraProxy } from 'react-native-vision-camera';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas';
import { Worklets } from 'react-native-worklets-core';

const CAPTURE_WIDTH = 1920;
const CAPTURE_HEIGHT = 1080;

const plugin = VisionCameraProxy.initFrameProcessorPlugin('MyFrameProcessorPlugin', {});

export function processFrame(frame: Frame): string {
  'worklet';
  if (!plugin) {
    throw new Error('Frame Processor Plugin "MyFrameProcessorPlugin" not found!');
  }
  return String(plugin.call(frame));
}

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'front');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const frameBuffer = useRef<string[]>([]);
  const bufferMaxSize = 5;
  const canvasRef = useRef<any>(null);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
    ws.current = new WebSocket('wss://rutube.space/ws');
    ws.current.onopen = () => {
      console.log('WebSocket connected!');
    };
    ws.current.onclose = () => {
      console.log('WebSocket closed');
    };
    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAnalysisResult(data);
        console.log('Server data:', data);
      } catch (err) {
        console.error('Error parsing server message:', err);
      }
    };
    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, [hasPermission]);

  useEffect(() => {
    if (!hasPermission) return;
    const interval = setInterval(() => {
      if (
        ws.current &&
        ws.current.readyState === WebSocket.OPEN &&
        frameBuffer.current.length > 0
      ) {
        const frameToSend = frameBuffer.current.shift();
        if (frameToSend) {
          ws.current.send(frameToSend);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasPermission]);

  useEffect(() => {
    if (canvasRef.current && analysisResult) {
      drawPoints(canvasRef.current);
    }
  }, [analysisResult]);

  const handleCanvas = (canvas: any) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;
    console.log('Canvas dimensions:', canvas.width, canvas.height);
    drawPoints(canvas);
  };

  const drawPoints = (canvas: any) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let effectiveWidth = CAPTURE_HEIGHT;
    let effectiveHeight = CAPTURE_WIDTH;

    const scaleX = canvas.width / effectiveWidth;
    const scaleY = canvas.height / effectiveHeight;
    console.log('Effective scale factors:', scaleX, scaleY);

    if (analysisResult && Array.isArray(analysisResult.keypoints)) {
      analysisResult.keypoints.forEach((pt: { x: number; y: number; score: number } | null) => {
        if (pt && pt.score > 0.5) {
          const rotatedX = pt.y;
          const rotatedY = CAPTURE_WIDTH - pt.x;
          let finalX, finalY;

          if (canvas.width < canvas.height) {
            finalX = rotatedX * scaleX;
            finalY = canvas.height - (rotatedY * scaleY);
          } else {
            finalX = canvas.width - (rotatedX * scaleX);
            finalY = rotatedY * scaleY;
          }

          ctx.beginPath();
          ctx.arc(finalX, finalY, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });
    }
  };

  const onFrame = useCallback((base64: string | null) => {
    if (!base64) return;
    if (frameBuffer.current.length < bufferMaxSize) {
      frameBuffer.current.push(base64);
    }
  }, []);

  const onFrameJS = useMemo(() => Worklets.createRunOnJS(onFrame), [onFrame]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const base64 = processFrame(frame);
    if (base64) {
      onFrameJS(base64);
    }
  }, [onFrameJS]);

  if (!hasPermission) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera device...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive frameProcessor={frameProcessor} />
      <Canvas ref={handleCanvas} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  canvas: { position: 'absolute', top: 0, left: 0, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});