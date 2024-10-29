import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "./firebaseconfig";

import Login from "@/app/login";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
                setUserDetails(null);
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);


    

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
            setUser(user);
            return { success: true, user };
        } catch (e) {
            console.error("login", e);
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid E-mail address';
            if (msg.includes('(auth/invalid-credential)')) msg = 'Wrong Password';
            return { success: false, msg };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserDetails(null);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, msg: e.message, error: e };
        }
    };

    const register = async (email, password, username) => {
        setIsLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const newDocRef = doc(database, "User", user.uid);
            const data = {
                email: email.toLowerCase(),
                username: username,
                balance: 0,
                id: Math.floor(1000 + Math.random() * 9000),
                settings: {
                    darkMode: false,
                    language: "en",
                    notification: false
                },
                card: {
                    cvv: "",
                    expDate: "2024-01-01",
                    designId: 1,
                    number: ""
                }
            };
            await setDoc(newDocRef, data);
            setUser(user);
            setUserDetails(data);
            return { success: true, user: data };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/email-already-in-use)')) msg = 'This email already in use';
            return { success: false, msg };
        } finally {
            setIsLoading(false);
        }
    };

    const updateAccount = async (newData) => {
        if (!user) throw new Error('User is not authenticated');
        setIsLoading(true);
        try {
            const userDocRef = doc(database, 'User', user.uid);
            await updateDoc(userDocRef, newData);
            setUserDetails(prevDetails => ({
                ...prevDetails,
                ...newData,
            }));
            return { success: true };
        } catch (error) {
            console.error('Error updating account:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userDetails, setUserDetails, isLoading, login, register, logout, updateAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);

    


    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
};
