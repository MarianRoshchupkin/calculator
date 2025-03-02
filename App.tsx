import * as React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import store from "./src/store/store";
import {Provider} from 'react-redux';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaView style={styles.container}>
        <CameraScreen />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});