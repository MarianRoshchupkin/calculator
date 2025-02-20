import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import Canvas from 'react-native-canvas';
// Import the worklets‑core helper:
import { Worklets } from 'react-native-worklets-core';

export default function OneMoreCameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices?.find((d) => d.position === 'front');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const isSocketOpen = useRef(false);
  const canvasRef = useRef<any>(null);
  const { width, height } = Dimensions.get('window');

  // We'll use a simple buffer to hold the data we send.
  const frameBuffer = useRef<string[]>([]);
  const bufferMaxSize = 5;

  // Request camera permission on mount.
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Set up the websocket connection.
  useEffect(() => {
    if (hasPermission) {
      isSocketOpen.current = false;
      ws.current = new WebSocket('wss://rutube.space/ws');
      ws.current.onopen = () => {
        console.log('WebSocket connected!');
        isSocketOpen.current = true;
      };
      ws.current.onmessage = (event) => {
        try {
          const resultData = JSON.parse(event.data);
          console.log('Got server data:', resultData);
          setAnalysisResult(resultData);
        } catch (err) {
          console.error('Error parsing result:', err);
        }
      };
      ws.current.onclose = () => {
        console.log('WebSocket closed');
        isSocketOpen.current = false;
      };
      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        isSocketOpen.current = false;
      };
      return () => {
        ws.current?.close();
        ws.current = null;
      };
    }
  }, [hasPermission]);

  // Every 200ms, if the socket is open and we have a frame in our buffer, send it.
  useEffect(() => {
    if (!hasPermission) return;
    const interval = setInterval(() => {
      if (
        ws.current &&
        isSocketOpen.current &&
        ws.current.readyState === WebSocket.OPEN &&
        frameBuffer.current.length > 0
      ) {
        const dataToSend = frameBuffer.current.shift();
        if (dataToSend) {
          ws.current.send(dataToSend);
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [hasPermission]);

  // When the analysisResult (from your server) updates, update the overlay.
  useEffect(() => {
    if (canvasRef.current && analysisResult) {
      drawPoints(canvasRef.current);
    }
  }, [analysisResult]);

  // Set up the canvas overlay.
  const handleCanvas = (canvas: any) => {
    if (canvas) {
      canvasRef.current = canvas;
      canvas.width = width;
      canvas.height = height;
      drawPoints(canvas);
    }
  };

  // Example drawing function: draw red circles for each keypoint.
  const drawPoints = (canvas: any) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (analysisResult && Array.isArray(analysisResult.keypoints)) {
      analysisResult.keypoints.forEach((pt: { x: number; y: number; score: number } | null) => {
        if (pt && pt.score > 0.5) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });
    }
  };

  // This JS function will receive the frame processor’s result.
  const processFrameResult = (result: string) => {
    if (frameBuffer.current.length < bufferMaxSize) {
      frameBuffer.current.push(result);
    }
  };

  // Create a JS-bound function using worklets‑core.
  const processFrameResultJS = Worklets.createRunOnJS(processFrameResult);

  // The frame processor worklet runs on every camera frame.
  // Here, instead of calling a native plugin, we simulate image conversion by returning a dummy,
  // valid base64‑encoded JPEG string. (For example purposes, we use "dGVzdA==" which is base64 for "test".)
  // In a real implementation you would perform the necessary conversion (likely natively).
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Perform a dummy heavy calculation using the frame timestamp.
    const ts = frame.timestamp;
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
      sum += Math.sin(ts + i);
    }
    // Here we simulate a valid base64 string. We prepend the data URL header
    // to satisfy server requirements. ("dGVzdA==" is "test" in base64.)
    const dummyBase64Image = "data:image/jpeg;base64,dGVzdA==";
    // Call our JS function via the worklets‑core helper.
    processFrameResultJS(dummyBase64Image);
  }, [processFrameResultJS]);

  if (!hasPermission) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <Canvas ref={handleCanvas} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
