import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";
 
const Transaction = ({ transaction, isOutgoing }) => {
  const { t } = useTranslation();
  const theme = useTheme();
 
  const styles = StyleSheet.create({
    transactionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.colors.primary,
 
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 2,
    },
    icon: {
      marginRight: 18,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionText: {
      fontSize: 16,
      color: theme.colors.onPrimary
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
 
 
 
  return (
    <View style={styles.transactionContainer}>
      <AntDesign
        name={isOutgoing ? 'arrowup' : 'arrowdown'}
        size={30}
        color={isOutgoing ? '#E4080A' : '#59AB01'}
        style={styles.icon}
      />
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionText}>
          {isOutgoing ? t('to') + ': ' + transaction.receiverName : t('from') + ': ' + transaction.senderName}
        </Text>
        <Text style={styles.transactionText}>{t('amount')}: {transaction.amount}</Text>
        <Text style={styles.transactionText}>
          {t('date')}: {new Date(transaction.date.seconds * 1000).toLocaleString()}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isOutgoing ? '#E4080A': '#59AB01'},
        ]}
      >
        {isOutgoing ? `-${transaction.amount}` : `+${transaction.amount}`}
      </Text>
    </View>
  );
};
 
export default Transaction;