import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import TestCameraScreen from "./src/screens/TestCameraScreen";
import FrameConverterTestScreen from "./src/screens/FrameConverterTestScreen";
import OneMoreCameraScreen from "./src/screens/OneMoreCameraScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CameraScreen />
      {/*{<TestCameraScreen />}*/}
      {/*<FrameConverterTestScreen />*/}
      {/*<OneMoreCameraScreen />*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});