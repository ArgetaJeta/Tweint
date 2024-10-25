import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where,
    updateDoc
} from "firebase/firestore"


import { database } from "../firebaseconfig"

const userCollection = collection(database, "User")

export async function fetchUserDetails({ id }) {
    const docRef = doc(database, "User", id)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() }
    } else {
        throw new Error(`Could not fetch user details for id ${id}`)
    }
}

export async function fetchUserDetailsByUsername({ username }) {
    const end = username.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));

    const q = query(
        userCollection,
        where('username', '>=', username),
        where('username', '<', end)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
}

export async function fetchUserDetailsById({ id }) {
    const q = query(
        userCollection,
        where("id", "==", id),
        limit(1)
    )

    const snapshot = await getDocs(q)

    if (snapshot.docs.length === 0) {
        throw new Error(`Could not fetch user details for id ${id}`)
    } else {
        const doc = snapshot.docs[0]
        return { uid: doc.id, ...doc.data() }
    }
}


export async function updateUserSettings({ id, data }) {
    const docRef = doc(database, "User", id)
    await updateDoc(docRef, { 
        settings: data
    })
}

export async function updateUserCard({ id, data }) {
    const docRef = doc(database, "User", id)
    await updateDoc(docRef, { 
        card: data
    })
}

export const buySubscription = async ({ userId, planId }) => {
    try {
        const userRef = doc(database, 'User', userId);
        await updateDoc(userRef, {
            subscription: planId
        });
    } catch (error) {
        console.error("Error buying subscription:", error);
        throw new Error('Subscription purchase failed');
    }
};