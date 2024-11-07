import { BarCodeScanner } from "expo-barcode-scanner";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  LogBox,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

// Ignore deprecated warning for BarCodeScanner
LogBox.ignoreLogs(["BarCodeScanner has been deprecated"]);

// QRCodeScanner component - handles scanning QR codes and navigating to transfer page
export default function QRCodeScanner() {
  // State management
  const [hasPermission, setHasPermission] = useState(null); // Camera permission status
  const [scanned, setScanned] = useState(false); // Whether a QR code has been scanned
  const [qrData, setQRData] = useState(null); // Data from scanned QR code

  // Hooks initialization
  const { t } = useTranslation();
  const theme = useTheme();

  // Effect hook to request camera permissions when component mounts
  useEffect(() => {
    (async () => {
      // Request permission to use the camera
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Handler for successful QR code scan
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true); // Mark as scanned
    setQRData(data); // Store the QR code data
  };

  // Permission check renders
  if (hasPermission === null) {
    return <Text>Warte auf Berechtigungen...</Text>; // Waiting for permission response
  }
  if (hasPermission === false) {
    return <Text>Keine Berechtigung für Kamerazugriff</Text>; // Permission denied
  }

  // Navigation handler to transfer page with scanned QR data
  const navigateToTransferPage = () => {
    router.push({
      pathname: 'transferPage',
      params: { recipientId: qrData }, // Pass QR data as recipient ID
    });
  };
 
  // Styles for the component
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: theme.colors.secondary,
    },

    // Container for displaying scanned data
    dataContainer: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
      alignSelf: 'center',
      backgroundColor: "white",
      borderRadius: 25,
    },

    // Style for the scanned data text
    dataText: {
      color: 'black',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '900',
      fontSize: 30,
      marginTop: 10,
    },

    // Style for the continue button
    buttonContainer: {
      marginTop: 15,
      borderRadius: 8,
      backgroundColor: theme.colors.mainColor,
    },

    // Style for the button text
    buttonText: {
      color: 'white',
      fontSize: 20,
      fontWeight: '600',
      padding: 6,
      textAlign: 'center',
    },

    // Style for the QR code scanning frame
    qrCode: {
      width: 280,
      height: 280,
      resizeMode: 'contain',
    },

    // Container for the scanning overlay
    overlayContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  // Component render
  return (
    <View style={styles.container}>
      {/* Camera view for QR scanning */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Scanning overlay - shown when not yet scanned */}
      {!scanned && (
        <View style={styles.overlayContainer}>
          <ImageBackground
            style={styles.qrCode}
            source={require("../../../assets/images/QrScannerKamera.png")}
            imageStyle={{ opacity: 0.5 }}
          />
        </View>
      )}

      {/* Results view - shown after successful scan */}
      {scanned && (
        <View style={styles.dataContainer}>
          {/* Display scanned QR code data */}
          <Text style={styles.dataText}>{qrData}</Text>

          {/* Navigation button to transfer page */}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={navigateToTransferPage}
          >
            <Text style={styles.buttonText}>{t("continue-to-transfer")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}