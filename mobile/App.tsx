
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CameraScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});