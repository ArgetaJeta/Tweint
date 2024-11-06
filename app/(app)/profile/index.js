import { useAuth } from "@/lib/authContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

/**
 * Profile Component
 * Displays user profile information including profile picture, email, and username
 * Provides functionality for logging out and editing profile
 */
export default function Profile() {
  // Initialize hooks for authentication, routing, translation, and theming
  const { user, logout, userDetails } = useAuth(); // Get user auth state and logout function
  const router = useRouter(); // Navigation router
  const [profileImage, setProfileImage] = useState(null); // State for profile image URL
  const { t } = useTranslation(); // Translation function
  const theme = useTheme(); // Theme context

  // Effect hook to check authentication and fetch profile image
  useEffect(() => {
    // Check if user is logged in
    if (!user || !userDetails) {
      Alert.alert("Anmeldung erforderlich", "Bitte logge dich ein.");
      router.replace("/login"); // Redirect to login page
      return;
    }

    /**
     * Fetches user's profile image from Firebase Storage
     * Falls back to placeholder image if user image not found
     */
    const fetchProfileImage = async () => {
      const storage = getStorage();
      // Create references to user's image and placeholder image
      const userRef = ref(storage, `users/${user.email}`);
      const placeholderRef = ref(storage, "users/placeholder.jpg");

      try {
        // Attempt to get user's profile image
        const url = await getDownloadURL(userRef);
        setProfileImage(url);
      } catch (error) {
        // If user image not found, try to get placeholder image
        if (error.code === "storage/object-not-found") {
          try {
            const placeholderUrl = await getDownloadURL(placeholderRef);
            setProfileImage(placeholderUrl);
          } catch (placeholderError) {
            // Silently fail if placeholder also not found
          }
        }
      }
    };

    fetchProfileImage();
  }, [user, userDetails]);

  // Navigation handler for profile editor
  const navigateProfileEditor = () => {
    router.push("/profileEditor");
  };

  /**
   * Handles user logout
   * Attempts to logout and redirects to login page
   * Shows error alert if logout fails
   */
  const logoutUser = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // Styles definition
  const styles = StyleSheet.create({
    // Main container styles
    container: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
    },

    // Content wrapper styles
    content: {
      width: "100%",
      padding: 20,
      alignItems: "center",
      borderRadius: 8,
    },

    // Title text styles
    title: {
      fontSize: 40,
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },

    // Separator line styles
    line: {
      width: "90%",
      height: 2,
      backgroundColor: theme.colors.onPrimary,
      marginVertical: 10,
    },

    // Welcome message styles
    welcome: {
      fontSize: 25,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.colors.onPrimary,
    },

    // Profile image styles
    image: {
      width: 140,
      height: 140,
      borderRadius: 70,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: "black",
    },

    // Label text styles
    label: {
      fontSize: 18,
      fontWeight: "600",
      color: "#555",
    },

    // General text styles
    text: {
      marginLeft: 10,
      fontSize: 18,
      color: theme.colors.onPrimary,
      width: "85%",
    },

    // Button styles
    button: {
      backgroundColor: "#007BFF",
      padding: 15,
      borderRadius: 25,
      marginTop: 20,
      width: "60%",
      alignItems: "center",
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 18,
      fontWeight: "600",
    },

    // User info container styles
    infoContainer: {
      marginTop: 20,
      width: "80%",
      alignItems: "center",
    },

    // Icon row styles
    icons: {
      flexDirection: "row",
      marginBottom: 15,
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
    },

    // Title container styles
    titleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      position: "relative",
    },

    // Edit image button container styles
    editImageContainer: {
      position: "absolute",
      right: 0,
    },

    // Edit image icon styles
    editImage: {
      borderRadius: 20,
    },
  });

  // Render profile only if user is authenticated
  return user && userDetails ? (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* Title section with edit button */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("profile")}</Text>
          <TouchableOpacity
            onPress={navigateProfileEditor}
            style={styles.editImageContainer}
          >
            <Feather
              name="edit-3"
              size={55}
              color="#007BFF"
              style={styles.editImage}
            />
          </TouchableOpacity>
        </View>

        {/* Separator line */}
        <View style={styles.line}></View>

        {/* Welcome message */}
        <Text style={styles.welcome}>
          {t("welcome-user")}, {userDetails.username}!
        </Text>

        {/* Profile image */}
        <Image
          source={{ uri: profileImage }}
          style={styles.image}
          onError={(error) => console.log("Image load error:", error)}
        />

        {/* User information section */}
        <View style={styles.infoContainer}>
          <View style={styles.icons}>
            <MaterialIcons name="email" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.text}>{user.email}</Text>
          </View>

          {/* Username display */}
          <View style={styles.icons}>
            <AntDesign name="user" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.text}>{userDetails.username}</Text>
          </View>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.button} onPress={logoutUser}>
          <Text style={styles.buttonText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null; // Return null if user is not authenticated
}