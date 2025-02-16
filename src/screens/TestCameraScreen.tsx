import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import FrameConverter from '../native/FrameConverter';

export default function RefinedTestCameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [convertedFrame, setConvertedFrame] = useState<string | null>(null);
  const devices = useCameraDevices() ?? [];
  const device = devices.find((d) => d.position === 'back');
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const result = await Camera.requestCameraPermission();
      console.log('Camera permission result:', result);
      setHasPermission(result === 'granted');
    })();
  }, []);

  // Capture a photo and convert it using the FrameConverter module
  const captureAndConvertFrame = async () => {
    if (cameraRef.current) {
      try {
        // Capture a photo; adjust options if needed
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'balanced'
        } as any);
        console.log('Photo captured at:', photo.path);
        // Convert the captured frame to a Base64 string
        const base64Data = await FrameConverter.convertFrame(photo.path);
        console.log('Frame converted:', base64Data);
        setConvertedFrame(base64Data);
      } catch (error) {
        console.error('Error capturing or converting frame:', error);
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Waiting for camera permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No camera device found!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Camera Preview */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      {/* Controls for testing further modules */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={captureAndConvertFrame}>
          <Text style={styles.buttonText}>Capture Frame</Text>
        </TouchableOpacity>
        {convertedFrame && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Converted Frame (Base64):</Text>
            <Text numberOfLines={1} style={styles.resultText}>
              {convertedFrame}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  buttonText: { color: '#fff', fontSize: 16 },
  resultContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8
  },
  resultLabel: { color: '#fff', fontWeight: 'bold' },
  resultText: { color: '#fff', fontSize: 12 }
});