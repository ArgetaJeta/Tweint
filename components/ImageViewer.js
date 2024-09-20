import React from 'react';
import { Image, Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

export default function ImageViewer({ selectedImage }) {
    console.log("ImageViewer received selectedImage: ", selectedImage);
    const { t } = useTranslation();

    if (!selectedImage) {
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>{t('no-image-selected')}</Text>
            </View>
        );
    } 

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
