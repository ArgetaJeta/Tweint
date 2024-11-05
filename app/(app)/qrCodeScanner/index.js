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

LogBox.ignoreLogs(["BarCodeScanner has been deprecated"]);

export default function QRCodeScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQRData] = useState(null);
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setQRData(data);
  };

  if (hasPermission === null) {
    return <Text>Warte auf Berechtigungen...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Keine Berechtigung für Kamerazugriff</Text>;
  }

  const navigateToTransferPage = () => {
    router.push({
      pathname: 'transferPage',
      params: { recipientId: qrData },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: theme.colors.secondary,
    },
    dataContainer: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
      alignSelf: 'center',
      backgroundColor: "white",
      borderRadius: 25,
    },
    dataText: {
      color: 'black',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '900',
      fontSize: 30,
      marginTop: 10,
    },
    buttonContainer: {
      marginTop: 15,
      borderRadius: 8,
      backgroundColor: theme.colors.mainColor,
    },
    buttonText: {
      color: 'white',
      fontSize: 20,
      fontWeight: '600',
      padding: 6,
      textAlign: 'center',
    },
    qrCode: {
      width: 280,
      height: 280,
      resizeMode: 'contain',
    },
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

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {!scanned && (
        <View style={styles.overlayContainer}>
          <ImageBackground
            style={styles.qrCode}
            source={require("../../../assets/images/QrScannerKamera.png")}
            imageStyle={{ opacity: 0.5 }}
          />
        </View>
      )}
      {scanned && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>{qrData}</Text>
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
