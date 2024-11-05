import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import { database } from '@/lib/firebaseconfig';
import { useRouter, useFocusEffect } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTranslation } from "react-i18next";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from "react-native-paper";

const cardImages = [
    { id: 1, source: require('@/assets/images/mastercard1.png') },
    { id: 2, source: require('@/assets/images/mastercard2.png') },
    { id: 3, source: require('@/assets/images/mastercard3.png') },
    { id: 4, source: require('@/assets/images/mastercard4.png') },
];

export default function Payment() {
    const router = useRouter();
    const { user, userDetails, setUserDetails } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showInputFields, setShowInputFields] = useState(false);
    const [designId, setDesignId] = useState(1);
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(true);
    const [holder, setHolder] = useState("");
    const [number, setNumber] = useState("");
    const [cvv, setCvv] = useState("");

    const theme = useTheme();

    const onDateChange = (event, selectedDate) => {
        setOpen(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const fetchUserInfo = async () => {
        console.log("Fetching user info...");
        const docRef = doc(database, "User", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserInfo(userData);
            if (userData.card) {
                setHolder(userData.card.holder);
                setNumber(userData.card.number);
                setCvv(userData.card.cvv);
                setDate(new Date(userData.card.expDate));
                setDesignId(userData.card.designId);
                setIsRegistered(true);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Platform.OS === 'android') {
            setOpen(false);
        }
    }, [date]);

    useEffect(() => {
        if (user) {
            fetchUserInfo();
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchUserInfo();
            }
        }, [user])
    );

    useEffect(() => {
        if (userDetails && userDetails.card) {
            setUserDetails((prevDetails) => ({
                ...prevDetails,
                card: {
                    ...prevDetails.card,
                    designId: designId,
                },
            }));
        }
    }, [designId]);

    const navigateToDesign = () => {
        console.log("Navigating to design selection");
        router.push('../payment/designSelection/');
    }

    const handleRegister = async () => {
        if (!holder || !date || !cvv || !number) {
            Alert.alert('Sign Up', "Please fill all the fields!");
            return;
        }

        setLoading(true);
        const paymentData = {
            holder: holder,
            expDate: date.toISOString().split('T')[0],
            cvv: cvv,
            number: number,
            ownerEmail: user.email,
            maxLimit: 1000,
            dayLimit: 500,
            designId: designId,
        };

        await updateDoc(doc(database, "User", user.uid), {
            card: paymentData
        });

        setIsRegistered(true);
        setShowInputFields(false);
        setLoading(false);
        console.log("Data saved!");
    };

    const handleNumberChange = (text) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setNumber(numericText);
    };

    const handleCvvChange = (text) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setCvv(numericText);
    };

    const selectedCardImage = cardImages.find(image => image.id === designId)?.source;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.secondary,
        },
        scrollContainer: {
            padding: wp('5%'),
        },
        section: {
            marginBottom: hp('3%'),
        },
        sectionTitle: {
            fontSize: wp('5%'),
            fontWeight: 'bold',
            color: theme.colors.onPrimary,
            marginBottom: hp('1%'),
        },
        limitsButton: {
            backgroundColor: theme.colors.mainColor,
            borderRadius: 5,
            paddingVertical: hp('1.5%'),
            paddingHorizontal: wp('5%'),
            alignItems: 'center',
            marginTop: hp('2%'),
        },
        limitsButtonText: {
            fontSize: wp('4%'),
            color: '#ffffff',
            fontWeight: 'bold',
        },
        accountDetails: {
            backgroundColor: theme.colors.primary,
            borderRadius: 10,
            paddingVertical: hp('2%'),
            paddingHorizontal: wp('4%'),
            elevation: 5,
        },
        cardImage: {
            width: wp('90%'),
            height: hp('26%'),
            borderRadius: 15,
            marginBottom: hp('1%'),
        },
        cardDetails: {
            alignItems: 'center',
        },
        input: {
            width: wp('80%'),
            height: hp('5%'),
            backgroundColor: '#ffffff',
            borderRadius: 5,
            paddingHorizontal: wp('3%'),
            marginVertical: hp('1%'),
            borderWidth: 1,
            borderColor: '#ccc',
        },
        saveButton: {
            backgroundColor: theme.colors.mainColor,
            borderRadius: 5,
            paddingVertical: hp('1%'),
            paddingHorizontal: wp('5%'),
            marginTop: hp('1%'),
        },
        saveButtonText: {
            fontSize: wp('4%'),
            color: '#ffffff',
            fontWeight: 'bold',
        },
        detailText: {
            fontSize: wp('4%'),
            color: theme.colors.onPrimary,
            marginBottom: hp('0.5%'),
        },
        savedDetails: {
            alignItems: 'center',
        },
        toggleButton: {
            backgroundColor: theme.colors.mainColor,
            borderRadius: 5,
            paddingVertical: hp('1%'),
            paddingHorizontal: wp('5%'),
            marginTop: hp('1%'),
            marginBottom: hp('1%'),
        },
        toggleButtonText: {
            fontSize: wp('4%'),
            color: '#ffffff',
            fontWeight: 'bold',
        },
        dateContainer: {
            backgroundColor: '#ffffff',
            marginTop: hp('1%'),
            justifyContent: 'center',
            width: wp('80%'),
            height: hp('5%'),
            borderRadius: 5,
            paddingHorizontal: wp('3%'),
            marginVertical: hp('1%'),
            borderWidth: 1,
            borderColor: '#ccc',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
        },
        dateTextColor: {
            color: '#808080',
        },
        cardContainer: {

        }
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('card-details')}</Text>
                    <TouchableOpacity
                        style={styles.cardContainer}
                        onPress={navigateToDesign}
                    >
                        <Image source={selectedCardImage} style={styles.cardImage} />
                    </TouchableOpacity>
                    <View style={styles.cardDetails}>
                        {isRegistered && !showInputFields ? (
                            <View style={styles.savedDetails}>
                                <Text style={styles.detailText}>{t('card-holder')}: {holder}</Text>
                                <Text style={styles.detailText}>{t('card-number')}: {number}</Text>
                                <Text style={styles.detailText}>{t('cvv')}: {cvv}</Text>
                                <Text style={styles.detailText}>{t('date')}: {date.toISOString().split('T')[0]}</Text>
                                <TouchableOpacity onPress={() => setShowInputFields(true)} style={styles.toggleButton}>
                                    <Text style={styles.toggleButtonText}>{t('edit')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowInputFields(!showInputFields)} style={styles.toggleButton}>
                                    <Text style={styles.toggleButtonText}>{showInputFields ? t('hide') : t('show')} {t('input-fields')}</Text>
                                </TouchableOpacity >
                                {showInputFields && (
                                    <>
                                        <TextInput
                                            onChangeText={setHolder}
                                            style={styles.input}
                                            placeholder={t("card-holder")}
                                            placeholderTextColor={'gray'}
                                            keyboardType={"ascii-capable"}
                                            value={holder}
                                        />
                                        <TextInput
                                            onChangeText={handleNumberChange}
                                            style={styles.input}
                                            placeholder={t("card-number")}
                                            placeholderTextColor={'gray'}
                                            keyboardType={"number-pad"}
                                            maxLength={16}
                                            value={number}
                                        />
                                        <TextInput
                                            onChangeText={handleCvvChange}
                                            style={styles.input}
                                            placeholder={t("cvv")}
                                            placeholderTextColor={'gray'}
                                            keyboardType={"number-pad"}
                                            maxLength={3}
                                            value={cvv}
                                        />
                                        <View style={styles.dateContainer}>
                                            <Text style={styles.dateTextColor}>{t("date")}</Text>
                                            {open && (
                                                <DateTimePicker
                                                    value={date}
                                                    mode="date"
                                                    display="default"
                                                    onChange={onDateChange}
                                                />
                                            )}
                                        </View>
                                        <TouchableOpacity style={styles.saveButton} onPress={handleRegister}>
                                            <Text style={styles.saveButtonText}>{t('save')}</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('bank-account-overview')}</Text>
                    <View style={styles.accountDetails}>
                        <Text style={styles.detailText}>{t('account-holder')}: {userInfo ? userInfo.username : 'Loading...'}</Text>
                        <Text style={styles.detailText}>{t('account-number')}: {userInfo ? userInfo.id : 'Loading...'}</Text>
                        <Text style={styles.detailText}>{t('bank-name')}: TWEINT Bank</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.limitsButton} onPress={() => { router.push('./limits') }}>
                        <Text style={styles.limitsButtonText}>{t('set-spending-limits')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
