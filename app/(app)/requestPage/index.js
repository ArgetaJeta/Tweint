import { useAuth } from '@/lib/authContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from "react-i18next";
import { useTheme } from 'react-native-paper';

export default function RequestPage() {
  const { user, userDetails } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.secondary,
    },
    label: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
      color: theme.colors.onPrimary,
    },
    qrLabel: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
      marginTop: 50,
      color: theme.colors.onPrimary,
    },
    idText: {
      fontSize: 50,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    nameText: {
      fontSize: 45,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    usernameText: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
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
      <Text style={styles.qrLabel}>{t('your-name-and-id')}</Text>
      <View style={styles.idContainer}>
        <Text style={styles.nameText}>{userDetails?.username}</Text>
      </View>
      <View style={styles.idContainer}>
        <Text style={styles.idText}>{userDetails?.id}</Text>
      </View>
      <Text style={styles.qrLabel}>{t('your-qr-code')}</Text>
      <View style={styles.qrCodeContainer}>
        {userDetails && (
          <QRCode
            size={250}
            backgroundColor="white"
            value={userDetails.id.toString()}
          />
        )}
      </View>
    </View>
  );
}
