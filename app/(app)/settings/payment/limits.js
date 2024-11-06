import { useAuth } from '@/lib/authContext';
import { database } from '@/lib/firebaseconfig';
import { useRouter } from 'expo-router';
import { DocumentReference, addDoc, collection, doc, documentId, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

/**
 * Limits Component - Allows users to set and manage payment limits
 * This component handles the user interface and logic for setting maximum payment limits
 */
export default function Limits() {
    // Hook initialization
    const { user, userDetails } = useAuth(); // Get authenticated user information
    const router = useRouter(); // Navigation hook
    const { t } = useTranslation(); // Internationalization hook
    const theme = useTheme(); // Theme hook for styling

    // State management
    const [userInfo, setUserInfo] = useState(null); // Stores user information
    const [loading, setLoading] = useState(true);  // Loading state indicator
    const [isRegistered, setIsRegistered] = useState(false); // User registration status
    const [paymentmethodDocId, setPaymentMethodDocId] = useState(""); // Payment method document ID
    const [maxLimit, setMaxLimit] = useState(""); // Maximum payment limit value

    // Effect hook to fetch user information and payment method when component mounts
    useEffect(() => {
        // Fetch user information from Firestore
        const fetchUserInfo = async () => {
            const docRef = doc(database, "User", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserInfo({ uid: docSnap.id, ...docSnap.data() });
                if (docSnap.data()) {
                    setIsRegistered(true);
                    console.log('fetch');
                }
            }
            setLoading(false);
        };

        // Fetch or create payment method document
        const fetchPaymentMethod = async () => {
            const paymentmethodRef = collection(database, "paymentmethod");
            // Query payment method by user email
            const q = query(paymentmethodRef, where("ownerEmail", "==", user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // If payment method exists, store its ID
                const doc = querySnapshot.docs[0];
                setPaymentMethodDocId(doc.id);
            } else {
                // If no payment method exists, create a new one
                const newDocRef = await addDoc(paymentmethodRef, { ownerEmail: user.email });
                setPaymentMethodDocId(newDocRef.id);
            }
        };

        fetchPaymentMethod();
        fetchUserInfo();
    }, [user]);

    /**
     * Handle saving the payment limits to Firestore
     * Validates input and updates the payment method document
     */
    const handleSaveLimits = async () => {
        // Input validation
        if (!maxLimit) {
            Alert.alert("Please fill all the fields!");
            return;
        }
        if (!paymentmethodDocId) {
            Alert.alert("Payment method document ID is missing!");
            return;
        }

        console.log("Data saved1!");
        setLoading(true);

        try {
            const documentPath = `paymentmethod/${paymentmethodDocId}`;
            const paymentMethodDocRef = doc(database, documentPath);

            // Get existing document to preserve email
            const paymentMethodDocSnap = await getDoc(paymentMethodDocRef);
            let dataToSave = { maxLimit: parseFloat(maxLimit) };

            if (paymentMethodDocSnap.exists()) {
                // Merge new data with existing document data
                dataToSave = { ...paymentMethodDocSnap.data(), ...dataToSave };
            } else {
                // Add owner email for new documents
                dataToSave.ownerEmail = user.email;
            }

            // Save data to Firestore
            await setDoc(paymentMethodDocRef, dataToSave);
            setIsRegistered(true);
            console.log("Data saved!");
            Alert.alert('Limits changed');
            router.push('/');
        } catch (error) {
            console.error("Error saving document: ", error);
            Alert.alert("Error saving document");
        } finally {
            setLoading(false);
        }
    };

    // Styles using responsive sizing (wp for width percentage, hp for height percentage)
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
            fontSize: wp('6%'),
            fontWeight: 'bold',
            color: theme.colors.onPrimary,
            marginBottom: hp('2%'),
            textAlign: 'center',
        },
        limitContainer: {
            backgroundColor: theme.colors.primary,
            borderRadius: 10,
            paddingVertical: hp('2%'),
            paddingHorizontal: wp('4%'),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 5,
        },
        label: {
            fontSize: wp('5%'),
            color: theme.colors.onPrimary,
            marginBottom: hp('1%'),
            marginTop: hp('1%'),
        },
        input: {
            width: '100%',
            height: hp('5%'),
            backgroundColor: '#ffffff',
            borderRadius: 5,
            paddingHorizontal: wp('3%'),
            marginBottom: hp('1%'),
            borderWidth: 1,
            borderColor: '#ccc',
        },
        saveButton: {
            backgroundColor: theme.colors.mainColor,
            borderRadius: 5,
            paddingVertical: hp('1%'),
            paddingHorizontal: wp('5%'),
            marginTop: hp('2%'),
            alignItems: 'center',
        },
        saveButtonText: {
            fontSize: wp('4%'),
            color: theme.colors.onSecondary,
            fontWeight: 'bold',
        },
    });

    // Component render
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.section}>

                    {/* Section title with translation */}
                    <Text style={styles.sectionTitle}>{t('set-limits')}</Text>
                    <View style={styles.limitContainer}>

                        {/* Input field for maximum limit */}
                        <Text style={styles.label}>{t('Maxlimit')}</Text>
                        <TextInput
                            value={maxLimit}
                            onChangeText={value => setMaxLimit(value)}
                            style={styles.input}
                            placeholder={t('enter-max-limit')}
                            placeholderTextColor={'gray'}
                            keyboardType='numeric'
                        />

                        {/* Save button */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveLimits}>
                            <Text style={styles.saveButtonText}>{t('save-limits')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}