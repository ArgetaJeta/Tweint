import { collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../firebaseconfig";
 
export async function getTransactions(userId) {
  try {
    const transactionsRef = collection(database, "transactions");
    const sentQuery = query(transactionsRef, where("sender.id", "==", userId));
    const receivedQuery = query(
      transactionsRef,
      where("receiver.id", "==", userId)
    );
 
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);
 
    const sentTransactions = sentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
 
    const receivedTransactions = receivedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
 
    return [...sentTransactions, ...receivedTransactions];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}