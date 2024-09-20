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

export default function register() {
    const router = useRouter();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const { t } = useTranslation();

    const usernameRef = useRef("");
    const passwordRef = useRef("");
    const emailRef = useRef("");
    const profileRef = useRef("");

    const handleRegister = async () => {
        if (!usernameRef.current || !passwordRef.current || !emailRef.current) {
            Alert.alert(t('error'), t('please-fill-all-the-fields'));
            return;
        }

        setLoading(true);
        await uploadImage();
        let response = await register(emailRef.current, passwordRef.current, usernameRef.current)
        setLoading(false);

        if (!response.success) {
            Alert.alert(t('error'), response.msg)
        } else {
            router.push('/login')
        }
    }

    const getBlobFroUri = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });
        return blob;
    };

    async function uploadImage() {
        if (!selectedImage) {
            return;
        }

        const storageRef = ref(storage, `users/${emailRef.current}`);
        const blob = await getBlobFroUri(selectedImage);
        await uploadBytes(storageRef, blob).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
    };

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