import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../lib/authContext";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";
import { useState, useEffect } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { database } from '@/lib/firebaseconfig';
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Require cycle:",
]);

export default function Home() {
  const { user, userDetails } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [savings, setSavings] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const MAX_DEPOSIT_AMOUNT = 10000; 

  const navigateToTransfer = () => {
    router.push("/transferPage");
  };
  const navigateToRequest = () => {
    router.push("/requestPage");
  };
  const navigateToQrCodeScanner = () => {
    router.push("/qrCodeScanner");
  };

  const navigateToTransactionHistory = () => {
    router.push("/transactionHistory");
  };

  const navigateToAccountOverview = () => {
    router.push("../accountOverview/");
  };

  useEffect(() => {
    const fetchAccounts = async () => {
        const dummyAccounts = [
            { id: 1, name: 'Savings Account', balance: savings },
        ];
        setAccounts(dummyAccounts);
    };

    const fetchSavings = async (uid) => {
        try {
            const docRef = doc(database, 'savings', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const { card } = docSnap.data();
                setSavings(card.savings || 0);
            } else {
                setSavings(0);
            }
        } catch (error) {
            console.error('Error fetching savings:', error);
        }
    };

    if (user) {
        fetchSavings(user.uid);
    }

    fetchAccounts();
}, [user, savings]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
      padding: 20,
      ...Platform.select({
        android: {
          paddingTop: 50,
          position: "relative",
        },
      }),
    },
    balanceContainer: {
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
      ...Platform.select({
        ios: {
          paddingLeft: 10,
          paddingRight: 10,
          width: "100%",
        },
      }),
    },
    balanceText: {
      fontSize: 20,
      marginBottom: 10,
      color: theme.colors.onPrimary,
    },
    balanceAmount: {
      fontSize: 40,
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },
    transactionHistoryContainer: {
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
      alignContent: "center",
      marginBottom: 20,
    },
    transactionHistoryButton: {
      backgroundColor: theme.colors.primary,
      paddingBottom: 5,
      paddingTop: 5,
      borderRadius: 10,
      textAlign: "center",
      width: "100%",
      ...Platform.select({}),
    },
    historyText: {
      fontSize: 18,
      marginBottom: 10,
      color: theme.colors.onPrimary,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "107%",
      marginBottom: 20,
      marginTop: 220,
      ...Platform.select({
        android: {
          position: "absolute",
          bottom: 90,
        },
      }),
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 10,
    },
    actionText: {
      fontSize: 18,
      marginTop: 0,
      color: theme.colors.onPrimary,
    },
    iconSend: {
      color: theme.colors.mainColor,
    },
    iconRequest: {
      color: theme.colors.mainColor,
    },
    payButton: {
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "102%",
      flexDirection: "row",
      justifyContent: "center",
      ...Platform.select({
        android: {
          position: "absolute",
          bottom: 20,
        },
      }),
    },
    payText: {
      fontSize: 18,
      marginLeft: 10,
      color: theme.colors.onPrimary,
    },
    icon: {
      marginRight: 20,
      color: theme.colors.mainColor,
    },
    iconCart: {
      color: theme.colors.mainColor,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <TouchableOpacity onPress={navigateToAccountOverview}>
          <Text style={styles.balanceText}>{t("balance-in-chf")}</Text>
          <View style={styles.header2}>
            <Text style={styles.balanceAmount}>
              {userDetails !== null
                ? userDetails.balance.toFixed(2)
                : t("loading")}
            </Text>
            <Text style={styles.balanceText}>{t("savings")}: {savings.toFixed(2)} CHF</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.transactionHistoryContainer}>
        <TouchableOpacity
          style={styles.transactionHistoryButton}
          onPress={navigateToTransactionHistory}
        >
          <Ionicons
            name="cart-outline"
            size={30}
            style={styles.iconCart}
          ></Ionicons>
          <Text style={styles.actionText}>{t("transaction-history")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToTransfer}
        >
          <Ionicons name="arrow-up-outline" size={35} style={styles.iconSend} />
          <Text style={styles.actionText}>{t("send")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToRequest}
        >
          <Ionicons
            name="arrow-down-outline"
            size={35}
            style={styles.iconRequest}
          />
          <Text style={styles.actionText}>{t("request")}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.payButton}
        onPress={navigateToQrCodeScanner}
      >
        <Ionicons name="qr-code-outline" size={35} style={styles.icon} />
        <Text style={styles.payText}>{t("pay")}</Text>
      </TouchableOpacity>
    </View>
  );
}
