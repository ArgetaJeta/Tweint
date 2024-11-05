import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '@/lib/authContext';
import { useTranslation } from "react-i18next";
import { database } from '@/lib/firebaseconfig';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { useTheme } from "react-native-paper";

export default function DesignSelection() {
    const router = useRouter();
    const { user, userDetails, setUserDetails } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const cardDesigns = [
        { id: 1, source: require('@/assets/images/mastercard1.png') },
        { id: 2, source: require('@/assets/images/mastercard2.png') },
        { id: 3, source: require('@/assets/images/mastercard3.png') },
        { id: 4, source: require('@/assets/images/mastercard4.png') },
    ];
    const { t } = useTranslation();
    const theme = useTheme();

    useEffect(() => {
        const fetchSubscription = async () => {
            const docRef = doc(database, "User", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userSubscription = docSnap.data().subscription;
                const currentDesignId = docSnap.data().card?.designId;
                setSubscription(userSubscription || 'basic'); // Setze auf 'basic', wenn keine Subscription vorhanden ist
                setDefaultCardDesign(userSubscription, currentDesignId);
            } else {
                // User-Dokument existiert nicht, neuen Benutzer anlegen und Standarddesign auf 1 setzen
                const newUserDetails = {
                    subscription: 'basic',
                    card: {
                        designId: 1,
                    },
                };
                await updateUserCard({ id: user.uid, data: newUserDetails.card });
                setSubscription('basic');
                setUserDetails(newUserDetails);
            }
            setLoading(false);
        };
        fetchSubscription();
    }, [user.uid]);

    const setDefaultCardDesign = async (subscription, currentDesignId) => {
        let defaultDesignId = 1;
        if (subscription === 'premium') {
            defaultDesignId = 3;
        } else if (subscription === 'elite') {
            defaultDesignId = 4;
        }

        if (currentDesignId !== defaultDesignId) {
            await updateUserCard({ id: user.uid, data: { ...userDetails.card, designId: defaultDesignId } });
            setUserDetails(prevDetails => ({
                ...prevDetails,
                card: {
                    ...prevDetails.card,
                    designId: defaultDesignId,
                }
            }));
        }
    };

    const updateUserCard = async ({ id, data }) => {
        const userRef = doc(database, "User", id);
        await updateDoc(userRef, { card: data });
    };

    const handleDesignSelect = async (designId) => {
        console.log('Selected design:', designId);
        setLoading(true);

        await updateUserCard({ id: user.uid, data: { ...userDetails.card, designId: designId } });
        console.log("Card updated for user " + user.uid);

        setUserDetails(prevDetails => ({
            ...prevDetails,
            card: {
                ...prevDetails.card,
                designId: designId,
            }
        }));

        setLoading(false);
        router.push('../');
    };

    const isDesignSelectable = (designId) => {
        if (!subscription && designId !== 1) {
            return false;
        }
        if (subscription === 'basic' && designId !== 1) {
            return false;
        }
        if (subscription === 'premium' && designId !== 3) {
            return false;
        }
        if (subscription === 'elite' && designId !== 4) {
            return false;
        }
        return true;
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.secondary,
        },
        scrollContainer: {
            padding: wp('5%'),
            alignItems: 'center',
        },
        title: {
            fontSize: wp('6%'),
            fontWeight: 'bold',
            color: theme.colors.onSecondary,
            marginBottom: hp('3%'),
        },
        cardContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        cardWrapper: {
            width: wp('45%'),
            marginBottom: hp('3%'),
        },
        cardImage: {
            width: wp('90%'),
            height: hp('26%'),
            marginBottom: hp('1%'),
            borderRadius: 15,
        },
        cardImageDisabled: {
            opacity: 0.5,
        },
        cardDetails: {
            alignItems: 'center',
        },
    });

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>{t('select-a-card-design')}</Text>
                <View style={styles.cardContainer}>
                    {cardDesigns.map(design => (
                        <TouchableOpacity
                            key={design.id}
                            style={styles.cardWrapper}
                            onPress={() => isDesignSelectable(design.id) && handleDesignSelect(design.id)}
                            disabled={!isDesignSelectable(design.id)}
                        >
                            <Image
                                source={design.source}
                                style={[
                                    styles.cardImage,
                                    !isDesignSelectable(design.id) && styles.cardImageDisabled
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
