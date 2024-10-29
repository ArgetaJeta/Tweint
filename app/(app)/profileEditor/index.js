import { useAuth } from "@/lib/authContext";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState, useRef } from "react";
import { Image, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, BackHandler } from "react-native";
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { getAuth, signInWithEmailAndPassword, updatePassword, EmailAuthProvider } from "firebase/auth";
import { getDocs, collection, query, where, getFirestore } from "firebase/firestore";
import CustomKeyboardView from "@/components/CustomKeyboardView";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

export default function ProfileEditor() {
  const { t } = useTranslation();
  const { user, userDetails, updateAccount } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState(userDetails.username);
  const usernameInputRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchProfileImage = async () => {
      const storage = getStorage();
      const userRef = ref(storage, `users/${user.email}`);
      const placeholderRef = ref(storage, 'users/placeholder.jpg');

      try {
        const url = await getDownloadURL(userRef);
        setProfileImage(url);
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          try {
            const placeholderUrl = await getDownloadURL(placeholderRef);
            setProfileImage(placeholderUrl);
          } catch (placeholderError) {
            console.error('Error fetching placeholder image:', placeholderError);
          }
        } else {
          console.error('Error fetching profile image:', error);
        }
      }
    };
    fetchProfileImage();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancelChanges();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const changePassword = async (currentPassword, newPassword) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      try {
        await signInWithEmailAndPassword(auth, user.email, currentPassword);
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password has been changed successfully.');
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          Alert.alert('Error', 'Current password is incorrect.');
        } else {
          Alert.alert('Error', error.message || 'Something went wrong.');
        }
      }
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleChangeProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.email}`);

      try {
        const response = await fetch(uri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);
        const newUrl = await getDownloadURL(storageRef);
        setProfileImage(newUrl);
      } catch (error) {
        console.error('Error uploading profile image:', error);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const usernameAvailable = await checkUsernameAvailability(username);
      if (!usernameAvailable) {
        Alert.alert('Error', 'Username is already taken.');
        return;
      }

      await updateAccount({ username });

      if (currentPassword && newPassword && confirmNewPassword) {
        await changePassword(currentPassword, newPassword);
      }
      router.replace("/profile");
    } catch (error) {
      Alert.alert('Error', error.message || "Please try again.");
    }
  };


  const checkUsernameAvailability = async (username) => {
    const firestore = getFirestore();
    const usersRef = collection(firestore, 'User');
    const q = query(usersRef, where("username", "==", username));

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };


  function showConfirmationAlert() {
    Alert.alert(
      'Bist du dir sicher?',
      'Somit werden deine Änderungen gelöscht.',
      [
        {
          text: 'Nein',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            router.replace("/profile");
          },
        },
      ],
      { cancelable: false }
    );
  }

  const handleCancelChanges = async () => {
    try {
      showConfirmationAlert();
    } catch (error) {
      Alert.alert('Error', error, "versuche es nochmals");
    }
  };

  const handleEditUsername = () => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      height: 835,
      backgroundColor: theme.colors.secondary,
    },
    content: {
      width: '100%',
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 40,
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },
    line: {
      width: '90%',
      height: 2,
      backgroundColor: '#ccc',
      marginVertical: 10,
    },
    image: {
      width: 140,
      height: 140,
      borderRadius: 70,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: "black",
    },
    editImage: {
      position: 'absolute',
      right: -10,
      bottom: -5,
      borderRadius: 20,
    },
    infoContainer: {
      marginTop: 20,
      width: "80%",
      alignItems: "center",
    },
    inputContainerName: {
      flexDirection: "row",
      marginBottom: 15,
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: '100%',
    },
    textInput: {
      marginLeft: 10,
      fontSize: 18,
      color: theme.colors.onPrimary,
      width: '80%',
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
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
    },
    buttonCancel: {
      backgroundColor: "#FF0000",
      padding: 15,
      borderRadius: 25,
      marginTop: 20,
      width: "60%",
      alignItems: "center",
    },
    editText: {
      position: 'absolute',
      right: 5,
      bottom: -20,
      borderRadius: 20,
      color: theme.colors.onPrimary,
    },
    inputContainer: {
      flexDirection: "row",
      marginBottom: 15,
      backgroundColor: theme.colors.primary,
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: '100%',
    },
    togglePasswordButton: {
      backgroundColor: "#007BFF",
      padding: 15,
      borderRadius: 25,
      marginTop: 20,
      marginBottom: 20,
      width: "95%",
      alignItems: "center",
    },
    togglePasswordButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
    },
  });


  return (
    <CustomKeyboardView>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('edit-profile')}</Text>
          </View>
          <View style={styles.line}></View>
          <TouchableOpacity onPress={handleChangeProfileImage}>
            <Image
              source={{ uri: profileImage }}
              style={styles.image}
              onError={(error) => console.log('Image load error:', error)}
            />
            <Feather name="edit-3" size={55} color="#007BFF" style={styles.editImage} />
          </TouchableOpacity>
          <View style={styles.infoContainer}>
            <View style={styles.inputContainerName}>
              <AntDesign name="user" size={24} color={theme.colors.onPrimary} />
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder={t('username')}
                ref={usernameInputRef}
              />
              <TouchableOpacity onPress={handleEditUsername}>
                <Feather name="edit-3" size={35} color="#000" style={styles.editText} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.togglePasswordButton}
              onPress={() => setShowPasswordFields(!showPasswordFields)}
            >
              <Text style={styles.togglePasswordButtonText}>
                {showPasswordFields ? "Hide Password Change" : t('change-password')}
              </Text>
            </TouchableOpacity>
            {showPasswordFields && (
              <>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock" size={24} color="black" />
                  <TextInput
                    style={styles.textInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current Password"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Ionicons name={showCurrentPassword ? "eye-off" : "eye"} size={24} color="black" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock-outline" size={24} color="black" />
                  <TextInput
                    style={styles.textInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="black" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock-outline" size={24} color="black" />
                  <TextInput
                    style={styles.textInput}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    placeholder="Confirm New Password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
            <Text style={styles.buttonText}>{t('save-changes')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonCancel} onPress={handleCancelChanges}>
            <Text style={styles.buttonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomKeyboardView>
  );
}