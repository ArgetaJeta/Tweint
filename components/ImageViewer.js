import React from 'react';
import { Image, Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

// The ImageViewer component displays either a placeholder or the selected image
export default function ImageViewer({ selectedImage }) {
    // Logging the received selectedImage prop for debugging purposes
    console.log("ImageViewer received selectedImage: ", selectedImage);
    // Destructuring `t` from `useTranslation` to access translation functions
    const { t } = useTranslation();

    // If no image is selected, show a placeholder with a message
    if (!selectedImage) {
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>{t('no-image-selected')}</Text>
            </View>
        );
    } 

    // If an image is selected, display the image
    return (
        
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: selectedImage} }
                style={styles.image}
                resizeMode="contain"
                onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
            />
        </View>
    );
}

// Define the styles for the component using StyleSheet
const styles = StyleSheet.create({
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 192,
        width: '100%',
        backgroundColor: '#e2e2e2', 
        borderRadius: 12,
    },
    placeholderText: {
        color: '#737373',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 192,
        width: '100%',
        backgroundColor: '#e2e2e2',
        borderRadius: 12,
    },
    image: {
        height: '100%',
        aspectRatio: 1
    },
});