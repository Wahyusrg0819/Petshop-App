// src/components/ProfileBanner.js
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const ProfileBanner = ({ profileImageUri }) => {
  const [gradientColors, setGradientColors] = useState(['#F5F5F5', '#F5F5F5']);

  useEffect(() => {
    if (profileImageUri) {
      extractDominantColors();
    }
  }, [profileImageUri]);

  const extractDominantColors = async () => {
    try {
      // Resize image to smaller size for faster processing
      const manipResult = await manipulateAsync(
        profileImageUri,
        [{ resize: { width: 50 } }],
        { format: SaveFormat.PNG }
      );

      // Read the image data
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create image element to get pixel data
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = [];

        // Sample pixels and collect colors
        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          colors.push(`rgb(${r},${g},${b})`);
        }

        // Get two dominant colors (you might want to implement a more sophisticated algorithm)
        const dominantColors = colors.reduce((acc, color) => {
          if (acc.length < 2) {
            acc.push(color);
          }
          return acc;
        }, []);

        setGradientColors(dominantColors);
      };
    } catch (error) {
      console.error('Error extracting colors:', error);
    }
  };

  return (
    <View style={styles.bannerBackground}>
      <View
        style={[
          styles.bannerPattern,
          {
            backgroundColor: gradientColors[0],
            backgroundImage: `linear-gradient(45deg, ${gradientColors[0]}, ${gradientColors[1]})`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerBackground: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    borderRadius: 15,
  },
  bannerPattern: {
    width: '100%',
    height: '100%',
  },
});

export default ProfileBanner;