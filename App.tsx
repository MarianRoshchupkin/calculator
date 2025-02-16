import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import TestCameraScreen from "./src/screens/TestCameraScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CameraScreen />
      {/*{<TestCameraScreen />}*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});