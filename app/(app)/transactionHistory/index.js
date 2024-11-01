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

export default function TransactionHistoryPage() {
  const { userDetails } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { t } = useTranslation();

  const fetchTransactions = useCallback(async () => {
    try {
      const fetchedTransactions = await getTransactions(userDetails.id);
      console.log('Fetched transactions:', fetchedTransactions);

      const querySnapshot = await getDocs(collection(database, "User"));
      const users = querySnapshot.docs.map(u => ({ ...u.data() }))


      console.log("Use1rs", users);
      for (const transaction of fetchedTransactions) {
        const sender = users.find(u => u.id === transaction.sender.id)
        const receiver = users.find(u => u.id === transaction.receiver.id)

        transaction.senderName = sender?.username || "Unknown";
        transaction.receiverName = receiver?.username || "Unknown";
      }

      console.log('Mapped transactions:');

      const sortedTransactions = orderBy(fetchedTransactions, 'date.seconds', 'desc');
      setTransactions(sortedTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setError("Failed to fetch transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userDetails.id]);


  const getUserName = async (userId) => {

    const docRef = doc(database, "User", `${userId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().username;
    } else {
      return 'Unknown';
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t('loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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
