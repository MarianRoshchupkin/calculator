import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<Camera>(null);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    ws.current = new WebSocket('ws://localhost:3000');

    ws.current.onmessage = (event) => {
      console.log("Received result:", event.data);
      const resultData = JSON.parse(event.data as string);
      setAnalysisResult(resultData);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

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

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePictureAndAnalyze}>
            <Text style={styles.buttonText}>Capture &amp; Analyze</Text>
          </TouchableOpacity>
        </View>
      </Camera>
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
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
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