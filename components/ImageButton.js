import React from 'react';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, Text, StyleSheet, Alert } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTranslation } from "react-i18next";

export default function ImageButton({ onChange }) {
    const { t } = useTranslation();
    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            console.log("Selected Image URI: ", imageUri);
            onChange(imageUri);
        } else {
            Alert.alert(t('error'), t('no-image-selected'));
        }
    }

    return (
        <Pressable onPress={pickImageAsync} style={styles.button}>
            <Feather name="image" size={hp(2.7)} color="gray" />
            <Text style={styles.buttonText}>
                {t('select-an-image')}
            </Text>
        </Pressable>
    );
}

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
