import { collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../firebaseconfig";
 
// Function to get transactions for a specific user by their user ID
export async function getTransactions(userId) {
  try {
    // Reference to the "transactions" collection in Firestore
    const transactionsRef = collection(database, "transactions");

    // Query to fetch transactions where the user is the sender
    const sentQuery = query(transactionsRef, where("sender.id", "==", userId));
    // Query to fetch transactions where the user is the receiver
    const receivedQuery = query(
      transactionsRef,
      where("receiver.id", "==", userId)
    );
 
    // Run both queries in parallel using Promise.all
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery), // Get documents for the sent transactions
      getDocs(receivedQuery), // Get documents for the received transactions
    ]);
 
    // Map over the returned documents from the "sent" query and extract the data
    const sentTransactions = sentSnapshot.docs.map((doc) => ({
      id: doc.id, // Document ID
      ...doc.data(), // Document data
    }));
 
    // Map over the returned documents from the "received" query and extract the data
    const receivedTransactions = receivedSnapshot.docs.map((doc) => ({
      id: doc.id, // Document ID
      ...doc.data(), // Document data
    }));
 
    // Combine both sent and received transactions and return them as a single array
    return [...sentTransactions, ...receivedTransactions];
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error fetching transactions:", error);
    throw error; // Rethrow the error so it can be handled by the caller
  }
}