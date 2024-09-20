import { useAuth } from "@/lib/authContext";
import { updateBalance, createTransaction } from "@/lib/database/createTransaction";
import { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, TextInput, View, Text } from "react-native";
import { useTranslation } from "react-i18next";

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

const { t } = useTranslation();

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

export default function TransactionForm({ amountToEdit }) {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState(defaultModel);
    const [transaction, setTransaction] = useState(defaultModel);

    useEffect(() => {
        if (amountToEdit) {
            setTransaction(amountToEdit);
        }
    }, [amountToEdit]);

    const handleChange = (field, value) => {
        setTransaction((prevTransaction) => ({
            ...prevTransaction,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrors(defaultModel);

        const result = validateModel(transaction);

        if (!result.isValid) {
            setErrors(result.errors);
            setIsLoading(false);
            return;
        }

        try {
            await createTransaction({
                receiver: {
                    id: parseInt(recipient)
                },
                sender: {
                    id: user.id
                },
                amount: parseFloat(amount)
            })
        } catch (error) {
            alert("Could not finish the transaction");
            console.log(error)
        }
        setIsLoading(false);
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