import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Asset } from 'expo-asset';
import FrameConverter from '../native/FrameConverter'; // your native module import

export default function FrameConverterTestScreen() {
  const [base64String, setBase64String] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndConvert() {
      try {
        // 1. Load a local image from the assets folder
        const imageAsset = Asset.fromModule(require('../assets/testImage.jpg'));
        await imageAsset.downloadAsync(); // ensures localUri is populated

        if (!imageAsset.localUri) {
          setErrorMessage('No localUri found for the image asset');
          return;
        }

        // 2. Convert the file at localUri to base64 via FrameConverter
        console.log('Attempting to convert frame at:', imageAsset.localUri);
        const resultBase64 = await FrameConverter.convertFrame(imageAsset.localUri);

        // 3. Store the base64 string in state
        setBase64String(resultBase64);
      } catch (err: any) {
        console.error('Failed to convert frame:', err);
        setErrorMessage(err.message || String(err));
      }
    }

    loadAndConvert();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Frame Converter Test</Text>

      {errorMessage ? (
        <Text style={styles.error}>Error: {errorMessage}</Text>
      ) : base64String ? (
        <>
          <Text style={styles.success}>
            Got Base64 (first 100 chars): {base64String.slice(0, 100)}...
          </Text>

          {/* Display the image from the base64 data */}
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={{ uri: 'data:image/jpeg;base64,' + base64String }}
              resizeMode="contain"
            />
          </View>
        </>
      ) : (
        <Text>Converting image...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    margin: 16,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginVertical: 16,
    textAlign: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});