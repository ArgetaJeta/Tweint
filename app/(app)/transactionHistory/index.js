import { useAuth } from '@/lib/authContext';
import Transaction from '@/lib/database/Transaction';
import { getTransactions } from '@/lib/database/getTransaction';
import { database } from '@/lib/firebaseconfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { orderBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from "react-i18next";

// Main component function
export default function TransactionHistoryPage() {
  const { userDetails } = useAuth(); // Get user details from authentication context
  const [transactions, setTransactions] = useState([]); // State to store transactions
  const [loading, setLoading] = useState(true); // Loading state to show spinner
  const [error, setError] = useState(null); // Error state to show error message if needed
  const theme = useTheme(); // Theme hook for dynamic styling
  const { t } = useTranslation(); // Translation hook for multilingual support

  // Function to fetch and process transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const fetchedTransactions = await getTransactions(userDetails.id); // Fetch transactions for the logged-in user
      console.log('Fetched transactions:', fetchedTransactions);

      // Get all user documents from "User" collection
      const querySnapshot = await getDocs(collection(database, "User"));
      const users = querySnapshot.docs.map(u => ({ ...u.data() }))

      console.log("Use1rs", users);

      // Map sender and receiver names to each transaction
      for (const transaction of fetchedTransactions) {
        const sender = users.find(u => u.id === transaction.sender.id)
        const receiver = users.find(u => u.id === transaction.receiver.id)

        transaction.senderName = sender?.username || "Unknown";
        transaction.receiverName = receiver?.username || "Unknown";
      }

      console.log('Mapped transactions:');

      // Sort transactions by date in descending order
      const sortedTransactions = orderBy(fetchedTransactions, 'date.seconds', 'desc');
      setTransactions(sortedTransactions); // Set sorted transactions to state
    } catch (err) {
      console.error("Failed to fetch transactions", err); // Log any errors
      setError("Failed to fetch transactions. Please try again later."); // Set error state
    } finally {
      setLoading(false); // Set loading state to false after fetching completes
    }
  }, [userDetails.id]); // Dependency on userDetails.id to refetch if it changes

  // Function to fetch a username by userId
  const getUserName = async (userId) => {

    const docRef = doc(database, "User", `${userId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().username; // Return username if document exists
    } else {
      return 'Unknown'; // Return 'Unknown' if no document is found
    }
  };

  // useEffect to call fetchTransactions when the component mounts
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Styles for the component
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.secondary,
    },
    header: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: "center",
      color: theme.colors.onPrimary,
    },
    errorText: {
      color: "red",
      fontSize: 16,
    },
    transaction: {
      color: theme.colors.primary,
    }
    
  });

  // Show loading spinner if transactions are still loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t('loading')}</Text>
      </View>
    );
  }

  // Show error message if there was an error fetching transactions
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render the list of transactions
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('transaction-history')}</Text>
      <FlatList
        styles={styles.flatList}
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Transaction
            style={styles.transaction}
            transaction={item}
            isOutgoing={item.sender.id === userDetails.id}
          />
        )}
      />
    </View>
  );
}