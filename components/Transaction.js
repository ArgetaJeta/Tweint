import { useAuth } from "@/lib/authContext";
import { updateBalance, createTransaction } from "@/lib/database/createTransaction";
import { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, TextInput, View, Text } from "react-native";
import { useTranslation } from "react-i18next";

// Default model for a transaction  
const defaultModel = {
    balance: "",
    date: "",
    receiver: {
        receiverId: ""
    },
    sender: {
        senderId: ""
    },
};

// Translation hook instance
const { t } = useTranslation();

// Validation function for the transaction data
function validateModel(transaction) {
    const errors = {
        balance: "",
        date: "",
        receiver: {
            name: "",
            receiverId: ""
        },
        sender: {
            name: "",
            senderId: ""
        },
    };
    let isValid = true;

    // Check if the balance is empty and set error if true
    if (transaction.balance.trim().length === 0) {
        errors.balance = "balance can't be empty";
        isValid = false;
    }

    // if (transaction.date.trim().length === 0) {
    //     errors.date = "date can't be empty";
    //     isValid = false;
    // }

    return { errors, isValid };
}

// Main TransactionForm component
export default function TransactionForm({ amountToEdit }) {
    const { user } = useAuth() // Retrieve user data from context (e.g., user id)
    const [isLoading, setIsLoading] = useState(false); // Loading state for submission
    const [errors, setErrors] = useState(defaultModel); // State for validation errors
    const [transaction, setTransaction] = useState(defaultModel); // State for the transaction data

    // If an existing amount is passed in (amountToEdit), update the transaction state
    useEffect(() => {
        if (amountToEdit) {
            setTransaction(amountToEdit);
        }
    }, [amountToEdit]);

    // Handle changes in input fields
    const handleChange = (field, value) => {
        setTransaction((prevTransaction) => ({
            ...prevTransaction,
            [field]: value, // Dynamically update specific field of transaction
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsLoading(true); // Set loading state to true when submitting
        setErrors(defaultModel); // Reset any existing errors

        // Validate the transaction data
        const result = validateModel(transaction);

        // If the form is invalid, display errors and stop further execution
        if (!result.isValid) {
            setErrors(result.errors);
            setIsLoading(false);
            return;
        }

        try {
            // Create the transaction by calling createTransaction function
            await createTransaction({
                receiver: {
                    id: parseInt(recipient) // Parse receiverId to integer
                },
                sender: {
                    id: user.id // Get sender's ID from the authenticated user
                },
                amount: parseFloat(amount) // Convert the balance to a float
            })
        } catch (error) {
            // Display error if transaction creation fails
            alert("Could not finish the transaction");
            console.log(error)
        }
        setIsLoading(false); // Reset loading state after submission
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Sender ID:</Text>
            <TextInput
                style={styles.input}
                placeholder="Receiver ID"
                value={transaction.receiver.receiverId}
                onChangeText={(text) => handleChange("receiver", { ...transaction.sender, receiverId: text })}
            />
            {errors.sender.senderId && <Text style={styles.error}>{errors.sender.senderId}</Text>}

            <Text style={styles.label}>{t('amount')}:</Text>
            <TextInput
                style={styles.input}
                placeholder="Amount"
                value={transaction.balance}
                onChangeText={(text) => handleChange("balance", text)}
            />
            {errors.balance && <Text style={styles.error}>{errors.balance}</Text>}

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? "Loading..." : "Submit"}</Text>
            </TouchableOpacity>
        </View>
    );
}

// Styles for the form and its elements
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: "black",
    },
    input: {
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        color: "white",
    },
    error: {
        color: 'red',
        marginBottom: 5,
    },
    label: {
        color: 'white',
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});