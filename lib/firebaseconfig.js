
import AsyncStorage from "@react-native-async-storage/async-storage"
import { initializeApp, getApps } from "firebase/app"
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2W_5qrc6kFcKO6tBWpT_qBMQvTSehdZc",
  authDomain: "tweint-ed77f.firebaseapp.com",
  projectId: "tweint-ed77f",
  storageBucket: "tweint-ed77f.appspot.com",
  messagingSenderId: "265726699324",
  appId: "1:265726699324:web:07ec71a93ab23b40862039",
  measurementId: "G-ML1Y9LKW98"
};
const config = {}

const initialize = () => {
  if (!getApps().length) {
    try {
      config.app = initializeApp(firebaseConfig)
      config.auth = initializeAuth(config.app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    } catch (error) {
      console.log("Error initializing app: " + error)
    }
  } else {
    config.app = getApps()[0]
    config.auth = getAuth(config.app)
  }
}
// Diese Funktion überprüft, ob bereits eine Firebase-App initialisiert wurde. 
// Falls nicht, wird eine neue Firebase - App mit den Konfigurationsdaten aus firebaseConfig initialisiert.

const initializeAuthentication = () => {
  initialize()
  return config.auth
}

const initializeFirestore = () => {
  initialize()
  return getFirestore(config.app)
}

const initializeStorage = () => {
  initialize()
  return getStorage(config.app)
}


export const auth = initializeAuthentication()
export const database = initializeFirestore()
export const storage = initializeStorage()