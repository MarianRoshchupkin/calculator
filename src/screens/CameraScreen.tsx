import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {Camera, useCameraDevices, useFrameProcessor, Frame, VisionCameraProxy} from 'react-native-vision-camera';
import {View, Text, StyleSheet, ActivityIndicator, Dimensions} from 'react-native';
import {Worklets} from 'react-native-worklets-core';
import Canvas from 'react-native-canvas';

const CAPTURE_WIDTH = 1920;
const CAPTURE_HEIGHT = 1080;

const keypointNames = [
  "Nose",
  "Left Eye",
  "Right Eye",
  "Left Ear",
  "Right Ear",
  "Left Shoulder",
  "Right Shoulder",
  "Left Elbow",
  "Right Elbow",
  "Left Wrist",
  "Right Wrist",
  "Left Hip",
  "Right Hip",
  "Left Knee",
  "Right Knee",
  "Left Ankle",
  "Right Ankle"
];

const skeletonConnections = [
  [0, 1], [0, 2],
  [1, 3], [2, 4],
  [0, 5], [0, 6],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [5, 6],
  [5, 11], [6, 12],
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16]
];

function getKeypointColor(index: number): string {
  if (index >= 0 && index <= 4) {
    return "red";
  } else if (index >= 5 && index <= 10) {
    return "blue";
  } else if (index >= 11 && index <= 16) {
    return "green";
  }
  return "white";
}

const plugin = VisionCameraProxy.initFrameProcessorPlugin('MyFrameProcessorPlugin', {});

export function processFrame(frame: Frame): string {
  'worklet';
  if (!plugin) {
    throw new Error('Frame Processor Plugin "MyFrameProcessorPlugin" not found!');
  }
  return String(plugin.call(frame));
}

export default function CameraScreen() {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'front');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const { width, height } = Dimensions.get('window');
  const ws = useRef<WebSocket | null>(null);
  const frameBuffer = useRef<string[]>([]);
  const canvasRef = useRef<any>(null);
  const isPortrait = width < height;
  const bufferMaxSize = 5;

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    ws.current = new WebSocket('wss://rutube.space/ws');
    ws.current.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        setAnalysisResult(data);
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
    }, 200);

    return () => clearInterval(interval);
  }, [hasPermission]);

  const drawPoints = (canvas: any) => {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const transformPoint = (pt: { x: number; y: number }) => {
      let x, y;

      if (isPortrait) {
        const scaleX = canvas.width / CAPTURE_HEIGHT;
        const scaleY = canvas.height / CAPTURE_WIDTH;

        x = pt.x * scaleX;
        y = pt.y * scaleY;
      } else {
        const scaleX = canvas.width / CAPTURE_WIDTH;
        const scaleY = canvas.height / CAPTURE_HEIGHT;

        x = canvas.width - (pt.y * scaleX);
        y = (CAPTURE_WIDTH - pt.x) * scaleY;
      }

      return { x, y };
    };

    if (analysisResult && Array.isArray(analysisResult.keypoints)) {
      skeletonConnections.forEach(connection => {
        const kp1 = analysisResult.keypoints[connection[0]];
        const kp2 = analysisResult.keypoints[connection[1]];

        if (kp1 && kp1.score > 0.5 && kp2 && kp2.score > 0.5) {
          const pt1 = transformPoint({ x: kp1.x, y: kp1.y });
          const pt2 = transformPoint({ x: kp2.x, y: kp2.y });

          ctx.beginPath();
          ctx.moveTo(Math.round(pt1.x), Math.round(pt1.y));
          ctx.lineTo(Math.round(pt2.x), Math.round(pt2.y));
          ctx.lineWidth = 2;

          const color1 = getKeypointColor(connection[0]);
          const color2 = getKeypointColor(connection[1]);

          ctx.strokeStyle = (color1 === color2) ? color1 : 'lime';
          ctx.stroke();
        }
      });

      analysisResult.keypoints.forEach((kp: { x: number; y: number; score: number } | null, index: number) => {
        if (kp && kp.score > 0.5) {
          const { x, y } = transformPoint({ x: kp.x, y: kp.y });
          const pointColor = getKeypointColor(index);

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = pointColor;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "white";
          ctx.stroke();

          if (keypointNames[index] !== undefined) {
            ctx.font = "12px Arial";
            ctx.fillStyle = "yellow";
            ctx.fillText(keypointNames[index], x + 6, y - 6);
          }
        }
      });
    }

    ctx.restore();
  };

  const handleCanvas = (canvas: any) => {
    if (!canvas) return;

    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;

    drawPoints(canvas);
  };

  const onFrame = useCallback((base64: string | null) => {
    if (!base64) return;
    if (frameBuffer.current.length < bufferMaxSize) frameBuffer.current.push(base64);
  }, []);

  const onFrameJS = useMemo(() => Worklets.createRunOnJS(onFrame), [onFrame]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const base64 = processFrame(frame);
    if (base64) {
      onFrameJS(base64);
    }
  }, [onFrameJS]);

  useEffect(() => {
    if (canvasRef.current && analysisResult) {
      drawPoints(canvasRef.current);
    }
  }, [analysisResult]);

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