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

export async function createTransaction(transactionData) {
    try {
        await runTransaction(database, async (transaction) => {
            console.log(transactionData)
            // 1. Konten laden
            const sender = await fetchUserDetailsById({ id: transactionData.sender.id })
            const receiver = await fetchUserDetailsById({ id: transactionData.receiver.id })

            const senderDocRef = doc(database, "User", sender.uid)
            const receiverDocRef = doc(database, "User", receiver.uid)

            const senderDoc = await transaction.get(senderDocRef)
            if (!senderDoc.exists()) {
                throw new Error("Sender account does not exist!")
            }

            const senderData = senderDoc.data();
            const amount = transactionData.amount
            // 2. Hat Sender Guthaben > amount
            if (senderData.balance < amount) {
                throw new Error("Sender does not have enough balance!")
            }

            // 3. Wenn ja, => docRef2 = getAccountDocRef(userId) userId == receiver
            const receiverDoc = await transaction.get(receiverDocRef)
            if (!receiverDoc.exists()) {
                throw new Error("Receiver account does not exist!")
            }

            const receiverData = receiverDoc.data();

            // Berechne die neuen Guthaben
            const newSenderBalance = senderData.balance - amount
            const newReceiverBalance = receiverData.balance + amount

            // 4. Aktualisieren Sie die Guthaben des Senders und des Empfängers
            transaction.update(senderDocRef, { balance: newSenderBalance })
            transaction.update(receiverDocRef, { balance: newReceiverBalance })

            // 5. Fügen Sie die Transaktion zur transactions-Sammlung hinzu
            const transactionDocRef = doc(database, "transactions", parseInt(Math.random() * 10000).toString())
            const transactionToSave = { ...transactionData }
            transaction.set(transactionDocRef, transactionToSave)
        });
        
        console.log("Transaction successfully committed!");
    } catch (e) {
        console.log("Transaction failed: ", e);
    }
}