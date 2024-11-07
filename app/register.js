import CustomKeyboardView from '@/components/CustomKeyboardView';
import ImageButton from '@/components/ImageButton';
import ImageViewer from '@/components/ImageViewer';
import { useAuth } from '@/lib/authContext';
import { storage } from '@/lib/firebaseconfig';
import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ref, uploadBytes } from 'firebase/storage';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Loading from '../components/Loading';
import { useTranslation } from "react-i18next";

// Main function for the register component
export default function register() {
    const router = useRouter(); // Enables navigation between screens
    const { register } = useAuth(); // Custom authentication hook for registering
    const [loading, setLoading] = useState(false); // Loading state for async operations
    const [selectedImage, setSelectedImage] = useState(null); // State for user profile image
    const { t } = useTranslation(); // Translation hook for multi-language support

    // References for form input fields
    const usernameRef = useRef("");
    const passwordRef = useRef("");
    const emailRef = useRef("");
    const profileRef = useRef("");

     // Function to handle registration process
    const handleRegister = async () => {
        // Validate required fields
        if (!usernameRef.current || !passwordRef.current || !emailRef.current) {
            Alert.alert(t('error'), t('please-fill-all-the-fields'));
            return;
        }

        setLoading(true); // Set loading to true during registration
        await uploadImage(); // Call image upload function
        let response = await register(emailRef.current, passwordRef.current, usernameRef.current)
        setLoading(false); // Stop loading once registration completes

        // Display appropriate response based on registration success/failure
        if (!response.success) {
            Alert.alert(t('error'), response.msg)
        } else {
            router.push('/login') // Redirect to login screen on success
        }
    }

    // Function to convert URI to Blob for image uploading
    const getBlobFroUri = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response); // Resolve with blob response on load
            };
            xhr.onerror = function (e) {
                reject(new TypeError("Network request failed")); // Reject on error
            };
            xhr.responseType = "blob"; // Set response type to blob
            xhr.open("GET", uri, true); // Open GET request with URI
            xhr.send(null);
        });
        return blob;
    };

    // Async function to handle image upload to Firebase storage
    async function uploadImage() {
        if (!selectedImage) {
            return; // Return if no image selected
        }

        const storageRef = ref(storage, `users/${emailRef.current}`); // Create storage reference with user email
        const blob = await getBlobFroUri(selectedImage); // Get blob from selected image URI
        await uploadBytes(storageRef, blob).then((snapshot) => {
            console.log('Uploaded a blob or file!'); // Log success message
        });
    };

    // Render UI
    return (
        <CustomKeyboardView>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('sign-up')}</Text>
                    <View style={styles.divider}></View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Octicons name="person" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => usernameRef.current = value}
                                style={styles.input}
                                placeholder={t('username-input')}
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Octicons name="lock" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => passwordRef.current = value}
                                style={styles.input}
                                placeholder={t('password-input')}
                                secureTextEntry
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Octicons name="mail" size={hp(2.7)} color="gray" />
                            <TextInput
                                onChangeText={value => emailRef.current = value}
                                style={styles.input}
                                placeholder={t('email-adress-input')}
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <Text style={styles.infoText}>{t('you-cannot-change-email-later')}</Text>
                        <ImageButton onChange={value => {
                            profileRef.current = value;
                            setSelectedImage(value);
                        }} />
                        <View>
                            <ImageViewer selectedImage={selectedImage} />
                        </View>

                        <View>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <Loading size={hp(8)} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleRegister} style={styles.button}>
                                    <Text style={styles.buttonText}>{t('sign-up')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('already-have-an-account')}</Text>
                            <Pressable onPress={() => router.push('login')}>
                                <Text style={styles.footerLink}>{t('sign-in')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}

// Styles for register component
const styles = StyleSheet.create({
    container: {
        paddingTop: hp(7),
        paddingHorizontal: wp(5),
        flex: 1,
        gap: hp(12),
    },
    header: {
        gap: hp(5),
    },
    title: {
        fontSize: hp(4),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#374151',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#525252',
        marginTop: 2,
    },
    inputContainer: {
        gap: hp(4),
    },
    inputWrapper: {
        height: hp(7),
        flexDirection: 'row',
        gap: wp(4),
        paddingHorizontal: wp(4),
        backgroundColor: '#e6e6e6',
        alignItems: 'center',
        borderRadius: hp(2.5),
    },
    input: {
        fontSize: hp(2),
        flex: 1,
        fontWeight: '600',
        color: '#404040',
    },
    infoText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        textAlign: 'center',
        color: '#888',
    },
    underline: {
        textDecorationLine: 'underline',
    },
    button: {
        height: hp(6.5),
        backgroundColor: '#525252',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: hp(2.7),
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    footerText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: '#888',
    },
    footerLink: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: '#374151',
        marginLeft: 5,
        marginBottom: 15,
    },
});