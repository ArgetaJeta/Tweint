import { Redirect, Stack, useRouter } from "expo-router";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/lib/authContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

export default function StackLayout() {
  // Get the user's authentication status and loading state from the auth context
  const { user, isLoading } = useAuth();
  // Router allows for navigation between different pages
  const router = useRouter();
  // Translation hook for localization
  const { t } = useTranslation();
  // Theme hook to apply styling from the theme context
  const theme = useTheme();

  // Show a loading indicator if the user information is still loading
  if (isLoading) {
    return <ActivityIndicator />;
  }

  // If the user is not authenticated, redirect to the login page
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerRight: () => {
          if (
            route.name === "profile/index" ||
            route.name === "profileEditor/index"
          ) {
            return null;
          }
          return (
            <View style={{ flexDirection: "row", marginRight: 20 }}>
              <TouchableOpacity onPress={() => router.navigate("/settings")}>
                <AntDesign name="setting" size={24} color={theme.colors.onPrimary} />
              </TouchableOpacity>
              <View style={{ marginLeft: 20 }}>
                <TouchableOpacity onPress={() => router.navigate("/profile")}>
                  <AntDesign name="user" size={24} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        },
      })}
    >

      <Stack.Screen
        name="accountOverview/Deposit"
        options={{ title: t("deposit") }}
      />
      <Stack.Screen
        name="settings/payment/index"
        options={{ title: t("payment") }}
      />
      <Stack.Screen
        name="settings/payment/designSelection/index"
        options={{ title: t("card-design") }}
      />
      <Stack.Screen
        name="settings/payment/limits"
        options={{ title: t("limits") }}
      />
      <Stack.Screen
        name="settings/abos"
        options={{ title: t("abos") }}
      />
      <Stack.Screen
        name="settings/index"
        options={{ title: t("settings") }}
      />
      <Stack.Screen
        name="profile/index"
        options={{ title: t("profile") }}
      />
      <Stack.Screen
        name="home/index"
        options={{ title: t("home") }}
      />
      <Stack.Screen
        name="accountOverview/index"
        options={{ title: t("account-overview") }}
      />
      <Stack.Screen
        name="transferPage/index"
        options={{ title: t("transfer") }}
      />
      <Stack.Screen
        name="requestPage/index"
        options={{ title: t("request") }}
      />
      <Stack.Screen
        name="qrCodeScanner/index"
        options={{ title: t("qr-code-scanner") }}
      />
      <Stack.Screen
        name="transactionHistory/index"
        options={{ title: t("transaction-history") }}
      />
      <Stack.Screen
        name="profileEditor/index"
        options={{ title: t("profile-editor") }}
      />
    </Stack>
  );
}