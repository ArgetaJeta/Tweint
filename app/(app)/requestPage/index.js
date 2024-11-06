import { useAuth } from '@/lib/authContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from "react-i18next";
import { useTheme } from 'react-native-paper';

/**
 * RequestPage Component
 * Displays user's identification information and generates a QR code for their ID
 * This can be used by other users to easily scan and initiate transfers
 */
export default function RequestPage() {
  // Get user data from auth context
  const { user, userDetails } = useAuth();

  // Initialize translation and theme hooks
  const { t } = useTranslation();
  const theme = useTheme();

  // Styles for the component
  const styles = StyleSheet.create({
    // Main container style
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.secondary,
    },

    // Generic label style
    label: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
      color: theme.colors.onPrimary,
    },

    // Style for QR code section label
    qrLabel: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
      marginTop: 50,
      color: theme.colors.onPrimary,
    },

    // Style for user ID text
    idText: {
      fontSize: 50,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },

    // Style for user name text
    nameText: {
      fontSize: 45,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },

    // Style for username text
    usernameText: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },

    // Container style for ID and username display
    idContainer: {
      backgroundColor: theme.colors.mainColor,
      height: 80,
      width: 250,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 25,
      borderColor: '#000000',
      borderWidth: 0,
      marginTop: 10,
    },

    // Container style for QR code
    qrCodeContainer: {
      backgroundColor: 'white',
      height: 280,
      width: 280,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 25,
      borderColor: '#000000',
      borderWidth: 0,
    },
  });

  return (
    <View style={styles.container}>
      {/* User identification section */}
      <Text style={styles.qrLabel}>{t('your-name-and-id')}</Text>

      {/* Username display container */}
      <View style={styles.idContainer}>
        <Text style={styles.nameText}>{userDetails?.username}</Text>
      </View>

      {/* User ID display container */}
      <View style={styles.idContainer}>
        <Text style={styles.idText}>{userDetails?.id}</Text>
      </View>

      {/* QR Code section */}
      <Text style={styles.qrLabel}>{t('your-qr-code')}</Text>

      {/* QR Code container */}
      <View style={styles.qrCodeContainer}>
        {userDetails && (
          <QRCode
            size={250} // Size of the QR code
            backgroundColor="white" // Background color
            value={userDetails.id.toString()} // Convert user ID to string for QR code
          />
        )}
      </View>
    </View>
  );
}