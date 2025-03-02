import {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {Camera, useCameraDevices, useFrameProcessor, Frame, VisionCameraProxy} from 'react-native-vision-camera';
import {View, Text, StyleSheet, ActivityIndicator, Dimensions} from 'react-native';
import {useGetLiveUpdatesQuery, wsInstance} from '../api/websocketsApiSlice';
import {Worklets} from "react-native-worklets-core";
import {debounce, drawSkeleton} from "../lib/utils";
import Canvas from 'react-native-canvas';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('MyFrameProcessorPlugin', {});

function processFrame(frame: Frame): string {
  'worklet';
  if (!plugin) {
    throw new Error('Frame Processor Plugin "MyFrameProcessorPlugin" not found!');
  }
  return String(plugin.call(frame));
}

const CameraScreen = () => {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'front');
  const [hasPermission, setHasPermission] = useState(false);
  const { data: analysisResult } = useGetLiveUpdatesQuery();
  const { width, height } = Dimensions.get('window');
  const canvasRef = useRef<any>(null);
  const isPortrait = width < height;

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCanvas = useCallback((canvas: any) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  const debouncedDraw = useMemo(() =>
    debounce(() => {
      if (canvasRef.current && analysisResult && Array.isArray(analysisResult)) {
        const canvas = canvasRef.current;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const latestData = analysisResult[analysisResult.length - 1];

        if (latestData && latestData.keypoints) {
          drawSkeleton(ctx, latestData, isPortrait, width, height);
        }
      } else {
        console.log("Canvas or analysisResult not ready:", {
          canvas: canvasRef.current,
          analysisResult,
        });
      }
    }, 100), [analysisResult, width, height, isPortrait]
  );

  useEffect(() => {
    debouncedDraw();
  }, [analysisResult, debouncedDraw]);

  const sendFrame = useCallback((encodedFrame: string) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(encodedFrame);
    } else {
      console.log("WebSocket is not ready:", wsInstance);
    }
  }, []);

  const onFrame = useCallback((encodedFrame: string) => {
    sendFrame(encodedFrame);
  }, [sendFrame]);

  const onFrameJS = useMemo(() => Worklets.createRunOnJS(onFrame), [onFrame]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const encodedFrame = processFrame(frame);
    if (encodedFrame) {
      onFrameJS(encodedFrame);
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
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  canvas: { position: 'absolute', top: 0, left: 0, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});

export default CameraScreen;