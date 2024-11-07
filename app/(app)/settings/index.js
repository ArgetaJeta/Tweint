import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  LogBox,
} from "react-native";
import { useRouter } from "expo-router";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import i18next, { languageResources } from "@/components/i18next";
import languagesList from "@/components/i18n/languagesList.json";
import { useTheme } from "react-native-paper";
import { useAuth } from "@/lib/authContext";
import { updateUserSettings } from "@/lib/database/users";
import { useSettings } from "@/lib/useSettings";

// Suppress a specific warning in React Native
LogBox.ignoreLogs([
  "Warning: Cannot update a component (`Settings`) while rendering a different component (`App`). To locate the bad setState() call inside `App`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render",
]);

// Main component function
export default function Settings() { 
  const { user, userDetails } = useAuth(); // Get user and user details from authentication context
  const router = useRouter(); // Initialize router for navigation
  const [visible, setVisible] = useState(false); // State for controlling language selection modal visibility
  const { darkmode, setDarkmode } = useSettings(); // Get and set dark mode settings from context
  const { t } = useTranslation(); // Translation hook
  const theme = useTheme(); // Theme hook for dynamic styling

  // Function to change language and update user settings in the database
  const changeLng = async (lng) => {
    i18next.changeLanguage(lng);
    console.log(`Gewählte Sprache: ${lng}`);

    await updateUserSettings({
      id: user.uid,
      data: { ...userDetails.settings, language: lng },
    });
    console.log("Einstellungen für Benutzer " + user.uid + " aktualisiert");
    setVisible(false);
  };

  // Toggle dark mode and update user settings in the database
  const toggleDarkmode = async (value) => {
    setDarkmode(value);
    await updateUserSettings({
      id: user.uid,
      data: { ...userDetails.settings, darkmode: value },
    });
    console.log(
      "Dunkelmodus " +
        (value ? "aktiviert" : "deaktiviert") +
        " für Benutzer " +
        user.uid
    );
  };

  // Navigation functions for payment and subscription settings
  const navigateToPaymentsSettings = () => router.push("settings/payment");
  const navigateToAbonements = () => router.push("settings/abos");
 
  // Styles for the component
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
    },
    scrollContainer: {
      padding: wp("5%"),
    },
    section: {
      marginBottom: hp("3%"),
    },
    sectionTitle: {
      fontSize: wp("5%"),
      fontWeight: "bold",
      marginBottom: hp("1%"),
      color: theme.colors.onPrimary,
    },
    optionButton: {
      borderRadius: 10,
      paddingVertical: hp("1.5%"),
      paddingHorizontal: wp("4%"),
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: wp("4%"),
      color: theme.colors.onPrimary,
    },
    optionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 10,
      paddingVertical: hp("1.5%"),
      paddingHorizontal: wp("4%"),
      backgroundColor: theme.colors.primary,
    },
    logoutButton: {
      borderRadius: 10,
      paddingVertical: hp("1.5%"),
      paddingHorizontal: wp("4%"),
      alignItems: "center",
    },
    logoutButtonText: {
      fontSize: wp("4%"),
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },
    modalContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.colors.onPrimary,
    },
    languageOption: {
      padding: 15,
      marginVertical: 10,
      width: "80%",
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      alignItems: "center",
    },
    languageText: {
      fontSize: 18,
      color: theme.colors.onPrimary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Language selection modal */}
      <Modal visible={visible}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{t("choose-your-language")}</Text>
          {Object.keys(languageResources).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => changeLng(item)}
              style={styles.languageOption}
            >
              <Text style={styles.languageText}>
                {languagesList[item].nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Main settings options */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("language")}</Text>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>{t("change-language")}</Text>
          </TouchableOpacity>
        </View>

        {/* Payment methods section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("payment-methods")}</Text>
          <TouchableOpacity
            onPress={navigateToPaymentsSettings}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>{t("payment-settings")}</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("abos")}</Text>
          <TouchableOpacity
            onPress={navigateToAbonements}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>{t("abos")}</Text>
          </TouchableOpacity>
        </View>
 
        {/* Theme (dark mode) toggle section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("theme")}</Text>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>{t("dark-mode")}</Text>
            <Switch onValueChange={toggleDarkmode} value={darkmode} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}