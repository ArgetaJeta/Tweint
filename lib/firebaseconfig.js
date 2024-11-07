
import AsyncStorage from "@react-native-async-storage/async-storage"
import { initializeApp, getApps } from "firebase/app"
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";


// Firebase configuration object containing API keys and project details
const firebaseConfig = {
  apiKey: "AIzaSyA2W_5qrc6kFcKO6tBWpT_qBMQvTSehdZc",
  authDomain: "tweint-ed77f.firebaseapp.com",
  projectId: "tweint-ed77f",
  storageBucket: "tweint-ed77f.appspot.com",
  messagingSenderId: "265726699324",
  appId: "1:265726699324:web:07ec71a93ab23b40862039",
  measurementId: "G-ML1Y9LKW98"
};

// Config object to store initialized Firebase services
const config = {}

// Function to initialize Firebase app and services if not already initialized
const initialize = () => {
  // Check if any Firebase apps are already initialized
  if (!getApps().length) {
    try {
      // Initialize Firebase app and authentication with persistence to AsyncStorage
      config.app = initializeApp(firebaseConfig)
      config.auth = initializeAuth(config.app, {
        persistence: getReactNativePersistence(AsyncStorage), // Use AsyncStorage to persist the authentication state
      })
    } catch (error) {
      console.log("Error initializing app: " + error) // Catch and log any initialization errors
    }
  } else {
    // If Firebase app is already initialized, use the first app
    config.app = getApps()[0]
    config.auth = getAuth(config.app) // Retrieve the existing auth instance
  }
}

// Function to initialize Firebase authentication and return the auth instance
const initializeAuthentication = () => {
  initialize() // Call the initialize function to ensure Firebase is set up
  return config.auth // Return the authentication instance
}

// Function to initialize Firestore and return the Firestore instance
const initializeFirestore = () => {
  initialize() // Call the initialize function to ensure Firebase is set up
  return getFirestore(config.app) // Return the Firestore instance
}

// Function to initialize Firebase Storage and return the storage instance
const initializeStorage = () => {
  initialize() // Call the initialize function to ensure Firebase is set up
  return getStorage(config.app) // Return the Storage instance
}

// Export the initialized Firebase services so they can be used elsewhere in the app
export const auth = initializeAuthentication() // Export initialized auth instance
export const database = initializeFirestore() // Export initialized Firestore instance
export const storage = initializeStorage() // Export initialized Storage instance