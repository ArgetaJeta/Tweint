import { useAuth } from '@/lib/authContext';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from "react-i18next";
import { useTheme } from 'react-native-paper';
import { buySubscription } from '@/lib/database/users';
import { updateDoc, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { database } from '@/lib/firebaseconfig';

// Constant for subscription duration (30 days in milliseconds)
const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * SubscriptionPage Component
 * Handles the display and management of subscription plans
 */
export default function SubscriptionPage() {
    // Hook initialization
    const { user, userDetails, updateAccount } = useAuth(); // Authentication context
    const [selectedPlan, setSelectedPlan] = useState(null); // Selected subscription plan
    const { t } = useTranslation(); // Translation hook
    const theme = useTheme(); // Translation hook
    const router = useRouter(); // Navigation hook
    const [expirationAlertScheduled, setExpirationAlertScheduled] = useState(false);
 
    // Subscription plans configuration
    const plans = [
        { id: 'basic', name: t("basic"), price: 0, benefits: ['basic-text-1', 'basic-text-2', 'basic-text-3'] },
        { id: 'premium', name: t("premium"), price: 40, benefits: ['premium-text-1', 'premium-text-2', 'premium-text-3', 'premium-text-4'] },
        { id: 'elite', name: t("elite"), price: 80, benefits: ['elite-text-1', 'elite-text-2', 'elite-text-3', 'elite-text-4'] },
    ];

    // Reset selected plan and check subscription status when user changes
    useEffect(() => {
        if (user) {
            setSelectedPlan(null);
            checkSubscriptionExpiration();
        }
    }, [user]);

    // Schedule expiration alert when flag is set
    useEffect(() => {
        if (expirationAlertScheduled) {
            scheduleExpirationAlert();
        }
    }, [expirationAlertScheduled]);

    /**
     * Check if user's subscription has expired
     * Shows alert if expired, schedules alert if approaching expiration
     */
    const checkSubscriptionExpiration = async () => {
        if (!user) return;

        const userDocRef = doc(database, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.subscriptionPurchaseDate) {
                const purchaseDate = new Date(userData.subscriptionPurchaseDate);
                const expirationDate = new Date(purchaseDate.getTime() + ONE_MONTH_IN_MS);

                if (expirationDate <= new Date()) {
                    Alert.alert(t("alert"), t("subscription-expired"));
                } else {
                    const timeUntilExpiration = expirationDate - new Date();
                    scheduleExpirationAlert(timeUntilExpiration);
                }
            }
        }
    };

    /**
     * Schedule an alert for when the subscription expires
     * @param {number} delay - Time until expiration in milliseconds
     */
    const scheduleExpirationAlert = (delay = ONE_MONTH_IN_MS) => {
        setTimeout(() => {
            Alert.alert(t("alert"), t("subscription-expired"));
        }, delay);
    };

    /**
     * Handle plan selection
     * @param {string} planId - ID of the selected plan
     */
    const handleSelectPlan = (planId) => {
        setSelectedPlan(planId);
    };

    /**
     * Handle the purchase of a subscription plan
     * Performs various checks and updates user data in Firestore
     */
    const handlePurchase = async () => {
        // Check if user is logged in
        if (!user) {
            Alert.alert(t("error"), t("sign-in-to-buy-abo"));
            return;
        }

        // Check if user already has an active subscription
        if (userDetails.subscriptionPlan) {
            const userDocRef = doc(database, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData.subscriptionPurchaseDate) {
                    const purchaseDate = new Date(userData.subscriptionPurchaseDate);
                    const expirationDate = new Date(purchaseDate.getTime() + ONE_MONTH_IN_MS);

                    if (expirationDate > new Date()) {
                        Alert.alert(t("error"), t("already-subscribed"));
                        return;
                    }
                }
            }
        }

        // Validate plan selection and details
        if (selectedPlan === null) {
            Alert.alert(t("error"), t("select-plan-first"));
            return;
        }

        const plan = plans.find(plan => plan.id === selectedPlan);
        if (!plan) {
            Alert.alert(t("error"), t("invalid-plan"));
            return;
        }

        // Check if user has sufficient balance
        if (userDetails.balance < plan.price) {
            Alert.alert(t("error"), t("insufficient-funds"));
            return;
        }

        try {
            // Process subscription purchase
            await buySubscription({ userId: user.uid, planId: selectedPlan });

            const newBalance = userDetails.balance - plan.price;

            const userDocRef = doc(database, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            // Update or create user document with new subscription details
            if (docSnap.exists()) {
                console.log('Updating existing user document');
                await updateDoc(userDocRef, { balance: newBalance, subscriptionPlan: selectedPlan, subscriptionPurchaseDate: new Date().toISOString() });
            } else {
                console.log('Creating new user document');
                await setDoc(userDocRef, { balance: newBalance, subscriptionPlan: selectedPlan, subscriptionPurchaseDate: new Date().toISOString() });
            }

            // Update local account state
            updateAccount({ ...userDetails, balance: newBalance, subscriptionPlan: selectedPlan });

            // Record subscription in subscriptions collection
            const subscriptionsCollectionRef = collection(database, 'subscriptions');
            await addDoc(subscriptionsCollectionRef, {
                userId: user.uid,
                planId: selectedPlan,
                purchaseDate: new Date().toISOString(),
            });

            router.push('/');

            Alert.alert(t("success"), t("purchase-successfully"));

            setExpirationAlertScheduled(true);
        } catch (error) {
            console.error('Error purchasing subscription:', error);
            Alert.alert(t("error"), t("purchase-failed"));
        }
    };

    // Styles definition using theme colors
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: theme.colors.secondary,
            justifyContent: 'flex-start',
            paddingTop: 40,
        },
        planContainer: {
            marginBottom: 20,
            padding: 15,
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        planName: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.colors.onPrimary,
        },
        planPrice: {
            fontSize: 18,
            color: theme.colors.onPrimary,
            marginVertical: 5,
        },
        planBenefits: {
            fontSize: 16,
            color: theme.colors.onPrimary,
            marginVertical: 5,
        },
        selectButton: {
            backgroundColor: theme.colors.mainColor,
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        selectButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        purchaseButtonContainer: {
            alignItems: 'center',
            marginTop: 30,
        },
        purchaseButton: {
            width: '80%',
            backgroundColor: theme.colors.mainColor,
            padding: 15,
            borderRadius: 25,
            alignItems: 'center',
        },
        purchaseButtonText: {
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
        },
    });

    // Component render
    return (
        <ScrollView>
            <View style={styles.container}>

                {/* Render subscription plans */}
                {plans.map((plan) => (
                    <View key={plan.id} style={styles.planContainer}>
                        <Text style={styles.planName}>{t(plan.name)}</Text>
                        <Text style={styles.planPrice}>{`${plan.price}` + t('chf/month')}</Text>

                        {/* Render plan benefits */}
                        {plan.benefits.map((benefit, index) => (
                            <Text key={index} style={styles.planBenefits}>{t(benefit)}</Text>
                        ))}
                        <TouchableOpacity style={styles.selectButton} onPress={() => handleSelectPlan(plan.id)}>
                            <Text style={styles.selectButtonText}>{selectedPlan === plan.id ? t('selected') : t('choose')}</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Show purchase button only when a plan is selected */}
                {selectedPlan && (
                    <View style={styles.purchaseButtonContainer}>
                        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
                            <Text style={styles.purchaseButtonText}>{t('buy')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}