import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "./firebaseconfig";

import Login from "@/app/login";

export const AuthContext = createContext(); // Create a new context for authentication

// The AuthContextProvider component wraps around the app and provides auth state and functions
export const AuthContextProvider = ({ children }) => {
    // States to manage loading, user data, and user details
    const [isLoading, setIsLoading] = useState(true); // Tracks loading state during auth operations
    const [user, setUser] = useState(null); // Stores current user object
    const [userDetails, setUserDetails] = useState(null); // Stores detailed user data fetched from Firestore

    // useEffect hook to listen for auth state changes and update the user state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user); // User is authenticated, store user data
            } else {
                setUser(null); // User is not authenticated, reset user state
                setUserDetails(null); // Clear user details
            }
            setIsLoading(false); // Stop loading when auth state is determined
        });
        return () => unsub(); // Cleanup the listener when component unmounts
    }, []);

    // Login function using email and password
    const login = async (email, password) => {
        setIsLoading(true); // Set loading to true while processing login
        try {
            const { user } = await signInWithEmailAndPassword(auth, email.toLowerCase(), password); // Sign in user
            setUser(user); // Set user state after successful login
            return { success: true, user }; // Return success message and user data
        } catch (e) {
            console.error("login", e); // Log any errors    
            let msg = e.message; // Default error message
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid E-mail address'; // Custom error message for invalid email
            if (msg.includes('(auth/invalid-credential)')) msg = 'Wrong Password'; // Custom error message for incorrect password
            return { success: false, msg }; // Return failure message
        } finally {
            setIsLoading(false); // Set loading to false after login attempt
        }
    };

    // Logout function to sign out the user
    const logout = async () => {
        try {
            await signOut(auth); // Sign out the user from Firebase Auth
            setUser(null); // Reset user state
            setUserDetails(null); // Reset user details state
            return { success: true }; // Return success message
        } catch (e) {
            console.error(e); // Log any errors during logout
            return { success: false, msg: e.message, error: e }; // Return error message if logout fails
        }
    };

    // Register function for creating a new user
    const register = async (email, password, username) => {
        setIsLoading(true); // Set loading to true while registering the user
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password); // Create new user in Firebase Auth   
            const newDocRef = doc(database, "User", user.uid); // Reference to the new user's document in Firestore
            const data = {
                email: email.toLowerCase(), // Normalize email to lowercase
                username: username, // Store username
                balance: 0, // Initial balance set to 0
                id: Math.floor(1000 + Math.random() * 9000), // Random ID for the user
                settings: { // Default user settings
                    darkMode: false,
                    language: "en",
                    notification: false
                },
                card: { // Default card data
                    cvv: "",
                    expDate: "2024-01-01",
                    designId: 1,
                    number: ""
                }
            };
            await setDoc(newDocRef, data); // Store user data in Firestore
            setUser(user); // Set the authenticated user in state
            setUserDetails(data); // Set user details in state
            return { success: true, user: data }; // Return success and user data
        } catch (e) {
            let msg = e.message; // Default error message
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email'; // Custom error message for invalid email
            if (msg.includes('(auth/email-already-in-use)')) msg = 'This email already in use'; // Error if email is already taken
            return { success: false, msg }; // Return failure message
        } finally {
            setIsLoading(false); // Set loading to false after registration attempt
        }
    };

    // Update account details function
    const updateAccount = async (newData) => {
        if (!user) throw new Error('User is not authenticated'); // Check if user is authenticated
        setIsLoading(true); // Set loading to true while updating user data
        try {
            const userDocRef = doc(database, 'User', user.uid); // Reference to user's document in Firestore
            await updateDoc(userDocRef, newData); // Update the user's document with new data
            setUserDetails(prevDetails => ({
                ...prevDetails, // Spread the previous details
                ...newData, // Update with new data
            }));
            return { success: true }; // Return success if update is successful 
        } catch (error) {
            console.error('Error updating account:', error); // Log any errors
            return { success: false, error: error.message }; // Return failure with error message
        } finally {
            setIsLoading(false); // Set loading to false after update attempt
        }
    };

    // Return the AuthContext.Provider which makes the auth data available to the children components
    return (
        <AuthContext.Provider value={{ user, userDetails, setUserDetails, isLoading, login, register, logout, updateAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access auth context and throw error if used outside the provider
export const useAuth = () => {
    const value = useContext(AuthContext); // Use context to access authentication data

    if (!value) { 
        throw new Error('useAuth must be wrapped inside AuthContextProvider'); // Throw error if useAuth is used outside AuthContextProvider
    }
    return value; // Return the context value
};