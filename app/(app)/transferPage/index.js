import { useAuth } from '@/lib/authContext';
import { createTransaction } from '@/lib/database/createTransaction';
import { fetchUserDetailsByUsername } from '@/lib/database/users';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { useTranslation } from "react-i18next";
import { database } from '@/lib/firebaseconfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTheme } from 'react-native-paper';

// Main component for the Transfer page
export default function TransferPage() {
    const { user, userDetails } = useAuth(); // Get user and user details from authentication context
    const [recipient, setRecipient] = useState(''); // State for recipient input
    const [amount, setAmount] = useState(0); // State for transfer amount input
    const [error, setError] = useState(null); // Error state to display errors if needed
    const [filteredRecipients, setFilteredRecipients] = useState([]); // Filtered recipient options for autocomplete
    const [selectedRecipient, setSelectedRecipient] = useState(null); // State for selected recipient in autocomplete
    const [limits, setLimits] = useState(); // State for user's transfer limits
    const router = useRouter(); // Router for navigation
    const params = useLocalSearchParams(); // Hook to get local route parameters
    const { t } = useTranslation(); // Translation hook
    const theme = useTheme(); // Theme hook for dynamic styling
    const maxLimit = useRef(""); // Reference to max transfer limit

    // Set recipient if there's a recipient ID in the route parameters
    useEffect(() => {
        if (params.recipientId) {
            setRecipient(params.recipientId);
        }
    }, [params.recipientId]);

    // Fetch user's transfer limits from Firestore
    useEffect(() => {
        const fetchLimits = async () => {
            console.log("FETCHING LIMITS")
            const paymentmethodRef = collection(database, "paymentmethod");
            const q = query(paymentmethodRef, where("ownerEmail", "==", user.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log("DATA:");
                console.log(doc.id);
                console.log(data);
                const newLimits = { maxLimit: data.maxLimit }
                setLimits(newLimits); // Set fetched limits to state
            });
        };

        fetchLimits();
    }, []);

    // Handle the transfer process
    const handleTransfer = async () => {
        console.log(limits)
        if (!user) { // Check if user is logged in
            setError('User not logged in');
            return;
        }

        const transactionAmount = parseFloat(amount); // Parse amount as float

        if (!transactionAmount) {
            Alert.alert('Invalid amount', 'Please enter a valid amount to transfer.');
            return;
        }

        if (transactionAmount > userDetails.balance) { // Check if user has sufficient funds
            Alert.alert('Insufficient funds', 'You do not have enough funds to complete this transfer.');
            return;
        }

        if (transactionAmount > limits.maxLimit) { // Check if amount exceeds max limit
            Alert.alert('Exceeds max limit', `The amount exceeds your max limit of ${limits.maxLimit}.`);
            return;
        }

        try {
            // Fetch recipient details by username
            const recipients = await fetchUserDetailsByUsername({ username: selectedRecipient });

            if (recipients.length === 0) { // Check if recipient exists
                setError('Recipient not found');
                return;
            }

            const recipientUser = recipients[0];

            if (recipientUser.id === userDetails.id) { // Prevent transferring to oneself
                Alert.alert('Invalid recipient', 'You cannot send money to yourself.');
                return;
            }

            // Create a new transaction with the given details
            await createTransaction({
                receiver: {
                    id: parseInt(recipientUser.id)
                },
                sender: {
                    id: userDetails.id
                },
                amount: transactionAmount,
                date: new Date()
            });

            // Reset form and navigate back to the home page
            setRecipient('');
            setAmount(0);
            setError(null);
            router.push('/');
        } catch (error) {
            console.error('Error transferring money:', error);
            setError('Transfer failed. Please try again.'); // Set error message if transfer fails
        }
    };

    // Handle search for recipients in the autocomplete dropdown
    const handleSearch = useCallback(async (query) => {
        if (query.length > 0) {
            try {
                // Fetch users matching the query
                const recipients = await fetchUserDetailsByUsername({ username: query });
                const formattedRecipients = recipients.map(recipient => ({
                    id: recipient.id.toString(),
                    title: recipient.username
                }));
                setFilteredRecipients(formattedRecipients); // Set formatted recipients to state
            } catch (error) {
                console.error('Error fetching user details:', error);
                setFilteredRecipients([]); // Clear recipients if error occurs
            }
        } else {
            setFilteredRecipients([]); // Clear recipients if query is empty
        }
    }, []);

    // Define component styles
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: theme.colors.secondary,
            justifyContent: 'flex-start',
            paddingTop: 40, 
        },
        label: {
            fontSize: 18,
            marginBottom: 8,
            color: theme.colors.onPrimary,
            fontWeight: '600',
        },
        input: {
            height: 50,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 12, 
            backgroundColor: '#fff',
        },
        autocompleteInputContainer: {
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingHorizontal: 15,
            borderColor: '#ccc',
            borderWidth: 1,
            height: 50,
        },
        autocompleteSuggestionsContainer: {
            backgroundColor: '#fff',
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
        },
        autocompleteContainer: {
            marginBottom: 12, 
        },
        error: {
            color: 'red',
            marginBottom: 16,
            fontSize: 14,
            textAlign: 'center',
        },
        sendButtonContainer: {
            alignItems: 'center',
            marginTop: 16,
        },
        sendButton: {
            width: '80%',
            height: 50,
            borderRadius: 25,
            backgroundColor: theme.colors.mainColor,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        sendText: {
            fontSize: 18,
            color: theme.colors.onPrimary,
            fontWeight: '600',
        },
    });

    // Render the Transfer page UI
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('search-bar')}</Text>
            <AutocompleteDropdown
                dataSet={filteredRecipients}
                onChangeText={handleSearch}
                onSelectItem={(item) => {
                    if (item) {
                        setSelectedRecipient(item.title);
                    }
                    setRecipient(item?.id || '');
                }}
                onClear={() => setFilteredRecipients([])}
                inputContainerStyle={styles.autocompleteInputContainer}
                suggestionsListContainerStyle={styles.autocompleteSuggestionsContainer}
                containerStyle={styles.autocompleteContainer}
                inputHeight={50}
                closeOnBlur={true}
            />

            <Text style={styles.label}>{t('recipient-id')}</Text>
            <TextInput
                style={styles.input}
                value={recipient}
                onChangeText={setRecipient}
                keyboardType="numeric"
            />
            <Text style={styles.label}>{t('amount')}</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={text => setAmount(parseFloat(text))}
                keyboardType="numeric"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.sendButtonContainer}>
                <TouchableOpacity style={styles.sendButton} onPress={handleTransfer}>
                    <Text style={styles.sendText}>{t('send')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}