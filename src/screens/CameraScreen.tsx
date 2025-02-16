import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Dimensions} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import FrameConverter from '../native/FrameConverter';
import Canvas from 'react-native-canvas';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices?.find((d) => d.position === 'front');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<any>(null);
  const cameraRef = useRef<Camera>(null);
  const { width, height } = Dimensions.get('window');

  const frameBuffer = useRef<string[]>([]);
  const bufferMaxSize = 5;

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission((status as string) === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      ws.current = new WebSocket('wss://rutube.space/ws');
      ws.current.onmessage = (event) => {
        try {
          const resultData = JSON.parse(event.data);
          setAnalysisResult(resultData);
        } catch (err) {
          console.error('Error parsing result:', err);
        }
      };

      return () => ws.current?.close();
    }
  }, [hasPermission]);

  useEffect(() => {
    if (hasPermission) {
      const captureInterval = setInterval(async () => {
        if (cameraRef.current) {
          try {
            const photo = await cameraRef.current.takePhoto({ qualityPrioritization: 'balanced' } as any);
            const framePath = photo.path;
            const base64Data = await FrameConverter.convertFrame(framePath);

            if (frameBuffer.current.length < bufferMaxSize) {
              frameBuffer.current.push(base64Data);
            }
          } catch (error) {
            console.error('Error capturing frame:', error);
          }
        }
      }, 1000);

      return () => clearInterval(captureInterval);
    }
  }, [hasPermission]);

  useEffect(() => {
    if (hasPermission) {
      const sendInterval = setInterval(() => {
        if (ws.current && frameBuffer.current.length > 0) {
          const frameToSend = frameBuffer.current.shift();

          if (frameToSend) {
            ws.current.send(frameToSend);
          }
        }
      }, 1000);

      return () => clearInterval(sendInterval);
    }
  }, [hasPermission]);

  useEffect(() => {
    if (canvasRef.current && analysisResult) {
      drawPoints(canvasRef.current);
    }
  }, [analysisResult]);

  const handleCanvas = (canvas: any) => {
    if (canvas) {
      canvasRef.current = canvas;
      canvas.width = width;
      canvas.height = height;
      drawPoints(canvas);
    }
  };

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
      <Camera style={StyleSheet.absoluteFill} ref={cameraRef} device={device} isActive={true} photo={true} />
      <Canvas ref={handleCanvas} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  loading: { position: 'absolute', top: 50, alignSelf: 'center' },
});