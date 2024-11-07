import {
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    orderBy,
    query,
    where,
    runTransaction,
} from "firebase/firestore"
import { database } from "@/lib/firebaseconfig"
import { fetchUserDetailsById } from "@/lib/database/users"

// Function to create a transaction in the Firestore database
export async function createTransaction(transactionData) {
    try {
        // Using Firestore's `runTransaction` to ensure all operations are atomic (either all succeed or none)
        await runTransaction(database, async (transaction) => {
            console.log(transactionData) // Log the transaction data for debugging

            // 1. Fetch the sender and receiver details using their IDs (fetching user details)
            const sender = await fetchUserDetailsById({ id: transactionData.sender.id })
            const receiver = await fetchUserDetailsById({ id: transactionData.receiver.id })

            // Get references to the sender's and receiver's documents in the Firestore database
            const senderDocRef = doc(database, "User", sender.uid)
            const receiverDocRef = doc(database, "User", receiver.uid)

            // 2. Fetch the sender's document to check if it exists
            const senderDoc = await transaction.get(senderDocRef)
            if (!senderDoc.exists()) {
                throw new Error("Sender account does not exist!") // If sender account doesn't exist, throw error
            }

            // Get sender's data from the document
            const senderData = senderDoc.data();
            const amount = transactionData.amount // Get the amount from the transaction data

            // 3. Check if the sender has enough balance to make the transaction
            if (senderData.balance < amount) {
                throw new Error("Sender does not have enough balance!") // Throw error if not enough balance
            }

            // 4. Fetch the receiver's document to check if it exists
            const receiverDoc = await transaction.get(receiverDocRef)
            if (!receiverDoc.exists()) {
                throw new Error("Receiver account does not exist!") // If receiver account doesn't exist, throw error
            }

            // Get receiver's data from the document
            const receiverData = receiverDoc.data();

            // 5. Calculate the new balances for both the sender and the receiver
            const newSenderBalance = senderData.balance - amount // Subtract the amount from sender's balance
            const newReceiverBalance = receiverData.balance + amount // Add the amount to receiver's balance

            // 6. Update the sender's and receiver's balances in the Firestore database
            transaction.update(senderDocRef, { balance: newSenderBalance }) // Update sender's balance
            transaction.update(receiverDocRef, { balance: newReceiverBalance }) // Update receiver's balance

            // 7. Create a new document in the 'transactions' collection to record this transaction
            const transactionDocRef = doc(database, "transactions", parseInt(Math.random() * 10000).toString())
            const transactionToSave = { ...transactionData } // Copy the transaction data
            transaction.set(transactionDocRef, transactionToSave) // Save the transaction data to Firestore
        });
        
        console.log("Transaction successfully committed!"); // Log success message if the transaction commits
    } catch (e) {
        console.log("Transaction failed: ", e); // Log the error if the transaction fails
    }
}