import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
    } else {
      ws.current = new WebSocket('ws://localhost:3000');

      ws.current.onmessage = (event) => {
        console.log("Received result:", event.data);
        try {
          const resultData = JSON.parse(event.data as string);
          setAnalysisResult(resultData);
        } catch (err) {
          console.error("Error parsing result:", err);
        }
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [permission]);

  const takePictureAndAnalyze = async () => {
    if (cameraRef.current && ws.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
        const frameData = photo.base64;

        ws.current.send(frameData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!permission) {
    return <ActivityIndicator size="large" color="#fff" />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePictureAndAnalyze}>
            <Text style={styles.buttonText}>Capture &amp; Analyze</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {loading && <ActivityIndicator size="large" color="#fff" />}
      {analysisResult && (
        <View style={styles.resultContainer}>
          <Text>Right Elbow Angle: {analysisResult.right_elbow_angle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
  resultContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});
