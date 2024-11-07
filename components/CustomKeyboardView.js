import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

// Check if the platform is iOS
const ios = Platform.OS == 'ios';

// CustomKeyboardView component to handle keyboard behavior
export default function CustomKeyboardView({ children, contentOffset }) {
    // KeyboardAvoidingView adjusts the position of the screen when the keyboard is shown
    return (
        <KeyboardAvoidingView
            behavior={ios ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {
                    children
                }
            </ScrollView>
        </KeyboardAvoidingView>
    )
}