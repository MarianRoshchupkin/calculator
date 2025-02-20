import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {Camera, useCameraDevices, useFrameProcessor, Frame, VisionCameraProxy} from 'react-native-vision-camera';
import {View, Text, StyleSheet, ActivityIndicator, Dimensions} from 'react-native';
import {Worklets} from 'react-native-worklets-core';
import Canvas from 'react-native-canvas';

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
  const device = devices.find((d) => d.position === 'front');
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
      console.log('WebSocket error:', err);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAnalysisResult(data);
        console.log(data);
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
      if (ws.current && ws.current.readyState === WebSocket.OPEN && frameBuffer.current.length > 0) {
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
    drawPoints(canvas);
  };

  const drawPoints = (canvas: any) => {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (analysisResult && Array.isArray(analysisResult.keypoints)) {
      analysisResult.keypoints.forEach((pt: { x: number; y: number; score: number }) => {
        if (pt && pt.score > 0.5) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
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
  canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
});