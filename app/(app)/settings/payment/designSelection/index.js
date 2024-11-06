/**
 * DesignSelection Component
 * A React Native component that allows users to select card designs based on their subscription level.
 * Different subscription tiers (basic, premium, elite) unlock different card designs.
 */

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
    // Initialize hooks and state
    const router = useRouter();
    const { user, userDetails, setUserDetails } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);

    // Define available card designs with their respective images
    const cardDesigns = [
        { id: 1, source: require('@/assets/images/mastercard1.png') }, // Basic tier design
        { id: 2, source: require('@/assets/images/mastercard2.png') }, // Unused design
        { id: 3, source: require('@/assets/images/mastercard3.png') }, // Premium tier design
        { id: 4, source: require('@/assets/images/mastercard4.png') }, // Elite tier design
    ]; 

    const { t } = useTranslation();
    const theme = useTheme();

    // Fetch user's subscription status and set default card design on component mount
    useEffect(() => {
        const fetchSubscription = async () => {
            const docRef = doc(database, "User", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // If user exists, get their subscription and current design
                const userSubscription = docSnap.data().subscription;
                const currentDesignId = docSnap.data().card?.designId;
                setSubscription(userSubscription || 'basic');
                setDefaultCardDesign(userSubscription, currentDesignId);
            } else {
                // If new user, create document with basic subscription and default design
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


    /**
     * Sets the default card design based on user's subscription level
     * basic -> design 1
     * premium -> design 3
     * elite -> design 4
     */
    const setDefaultCardDesign = async (subscription, currentDesignId) => {
        let defaultDesignId = 1;
        if (subscription === 'premium') {
            defaultDesignId = 3;
        } else if (subscription === 'elite') {
            defaultDesignId = 4;
        }

        // Update design if it doesn't match subscription level
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

    /**
     * Updates the user's card design in Firestore
     */
    const updateUserCard = async ({ id, data }) => {
        const userRef = doc(database, "User", id);
        await updateDoc(userRef, { card: data });
    };

    /**
     * Handles the selection of a new card design
     * Updates both Firestore and local state, then navigates back
     */
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

    /**
     * Determines if a design is selectable based on subscription level
     * Each subscription tier only has access to one specific design
     */
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

    // Styles defined using responsive sizing
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

    // Show loading indicator while fetching data
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    // Render card design selection interface
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