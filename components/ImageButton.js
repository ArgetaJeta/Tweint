import React from 'react';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, Text, StyleSheet, Alert } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTranslation } from "react-i18next";

// Define the ImageButton component
export default function ImageButton({ onChange }) {
    // Hook to handle translation, `t` provides access to translation strings
    const { t } = useTranslation();
    // Function to handle picking an image from the user's device
    const pickImageAsync = async () => {
        // Launch the image picker with editing allowed and the highest quality setting
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, // Allow the user to crop the image if desired
            quality: 1, // Set the quality to maximum (1)
        });

        // Check if the user has selected an image (if not canceled)
        if (!result.canceled) {
            const imageUri = result.assets[0].uri; // Get the URI of the selected image 
            console.log("Selected Image URI: ", imageUri); // Log the URI for debugging purposes
            onChange(imageUri); // Call the parent function (`onChange`) and pass the image URI to update the state
        } else {
            // If no image was selected, show an alert with an error message
            Alert.alert(t('error'), t('no-image-selected'));
        }
    }

    // Return the component's JSX, which includes a button to trigger the image picker
    return (
        <Pressable onPress={pickImageAsync} style={styles.button}>
            <Feather name="image" size={hp(2.7)} color="gray" />
            <Text style={styles.buttonText}>
                {t('select-an-image')}
            </Text>
        </Pressable>
    );
}

// Define the styles for the component using React Native's StyleSheet
const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 16,
        backgroundColor: '#e5e5e5',
        borderRadius: 20,
        height: 56,
    },
    buttonText: {
        flex: 1,
        fontWeight: 'bold',
        color: '#737373',
    },
});