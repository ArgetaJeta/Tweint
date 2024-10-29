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

export default function Profile() {
  const { user, logout, userDetails } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    // Prüfen, ob Benutzer eingeloggt ist
    if (!user || !userDetails) {
      Alert.alert("Anmeldung erforderlich", "Bitte logge dich ein.");
      router.replace("/login"); // Weiterleitung zur Login-Seite
      return;
    }

    const fetchProfileImage = async () => {
      const storage = getStorage();
      const userRef = ref(storage, `users/${user.email}`);
      const placeholderRef = ref(storage, "users/placeholder.jpg");

      try {
        const url = await getDownloadURL(userRef);
        setProfileImage(url);
      } catch (error) {
        if (error.code === "storage/object-not-found") {
          try {
            const placeholderUrl = await getDownloadURL(placeholderRef);
            setProfileImage(placeholderUrl);
          } catch (placeholderError) {}
        }
      }
    };

    fetchProfileImage();
  }, [user, userDetails]);

  const navigateProfileEditor = () => {
    router.push("/profileEditor");
  };

  const logoutUser = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      backgroundColor: theme.colors.secondary,
    },
    content: {
      width: "100%",
      padding: 20,
      alignItems: "center",
      borderRadius: 8,
    },
    title: {
      fontSize: 40,
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },
    line: {
      width: "90%",
      height: 2,
      backgroundColor: theme.colors.onPrimary,
      marginVertical: 10,
    },
    welcome: {
      fontSize: 25,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.colors.onPrimary,
    },
    image: {
      width: 140,
      height: 140,
      borderRadius: 70,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: "black",
    },
    label: {
      fontSize: 18,
      fontWeight: "600",
      color: "#555",
    },
    text: {
      marginLeft: 10,
      fontSize: 18,
      color: theme.colors.onPrimary,
      width: "85%",
    },
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
    infoContainer: {
      marginTop: 20,
      width: "80%",
      alignItems: "center",
    },
    icons: {
      flexDirection: "row",
      marginBottom: 15,
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      position: "relative",
    },
    editImageContainer: {
      position: "absolute",
      right: 0,
    },
    editImage: {
      borderRadius: 20,
    },
  });

  // Anzeigen der Profilinformationen, wenn eingeloggt
  return user && userDetails ? (
    <View style={styles.container}>
      <View style={styles.content}>
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
        <View style={styles.line}></View>
        <Text style={styles.welcome}>
          {t("welcome-user")}, {userDetails.username}!
        </Text>
        <Image
          source={{ uri: profileImage }}
          style={styles.image}
          onError={(error) => console.log("Image load error:", error)}
        />
        <View style={styles.infoContainer}>
          <View style={styles.icons}>
            <MaterialIcons name="email" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.text}>{user.email}</Text>
          </View>
          <View style={styles.icons}>
            <AntDesign name="user" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.text}>{userDetails.username}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={logoutUser}>
          <Text style={styles.buttonText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null; // Wenn nicht eingeloggt, wird nichts angezeigt
}
