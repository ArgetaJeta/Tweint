import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import CustomKeyboardView from '@/components/CustomKeyboardView';
import Loading from '@/components/Loading';
import { useAuth } from '@/lib/authContext';
import { StyleSheet } from 'react-native';
import { useTranslation } from "react-i18next";

export default function login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useTranslation();

    //const emailRef = useRef("ivan8@test.ch");
    //const passwordRef = useRef("123456");

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert(t('error'), t('please-fill-all-the-fields'));
            return;
        }

        setLoading(true);
        try {
            await login(emailRef.current, passwordRef.current);
            router.replace("/home")
        } catch (e) {
            Alert.alert('Sign In', e.msg);
        }
        setLoading(false);
    }

    return (
        <CustomKeyboardView>
            <View style={{ flex: 1 }}>
                <StatusBar style="dark" />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('sign-in')}</Text>
                        <View style={styles.divider}></View>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Octicons name="person" size={hp(2.7)} color="gray" />
                                <TextInput
                                    onChangeText={value => emailRef.current = value}
                                    style={styles.input}
                                    placeholder={t('email-adress-input')}
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <View style={{ gap: hp(3) }}>
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
                                <Text style={styles.forgotText}>{t('i-forgot')}</Text>
                            </View>
                            <View>
                                {loading ? (
                                    <View style={styles.row}>
                                        <Loading size={hp(8)} />
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={handleLogin} style={styles.button}>
                                            <Text style={styles.buttonText}>{t('sign-in')}</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.signUpText}>{t('you-dont-have-an-account')}</Text>
                                <Pressable onPress={() => router.push('register')}>
                                    <Text style={styles.signUpLink}>{t('sign-up')}</Text>
                                </Pressable>
                            </View>
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
    forgotText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        textAlign: 'right',
        color: '#888',
    },
    button: {
        height: hp(6.5),
        backgroundColor: '#374151',
        borderRadius: hp(2.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: hp(2.7),
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: '#888',
    },
    signUpLink: {
        fontSize: hp(1.8),
        fontWeight: 'bold',
        color: '#374151',
        marginLeft: 5,
    },
});


