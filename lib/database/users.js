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

const userCollection = collection(database, "User") // Reference to the "User" collection in Firestore

// Function to fetch user details based on the user's id
export async function fetchUserDetails({ id }) {
    const docRef = doc(database, "User", id) // Reference to the document using user ID
    const snapshot = await getDoc(docRef) // Fetch the document from Firestore

    if (snapshot.exists()) { // Check if the document exists
        return { id: snapshot.id, ...snapshot.data() } // Return user data with the document id
    } else {
        throw new Error(`Could not fetch user details for id ${id}`) // Error if document does not exist
    }
}

// Function to fetch user details based on username using a range query
export async function fetchUserDetailsByUsername({ username }) {
    // Generate a range for the query to get all users with the specified prefix for the username
    const end = username.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));

    const q = query(
        userCollection,
        where('username', '>=', username), // Query for usernames greater than or equal to 'username'
        where('username', '<', end) // Query for usernames less than 'end' (ensuring the range is accurate)
    )

    const snapshot = await getDocs(q) // Fetch documents based on the query
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() })) // Return an array of users with their data
}

// Function to fetch user details by user ID, querying for the 'id' field
export async function fetchUserDetailsById({ id }) {
    const q = query(
        userCollection,
        where("id", "==", id), // Query for users whose 'id' matches the provided 'id'
        limit(1) // Limit the query to return only one user document
    )

    const snapshot = await getDocs(q) // Fetch the query results

    if (snapshot.docs.length === 0) { // Check if no documents were found
        throw new Error(`Could not fetch user details for id ${id}`) // Error if no matching user found
    } else {
        const doc = snapshot.docs[0] // Get the first document from the result
        return { uid: doc.id, ...doc.data() } // Return the user data along with the document id
    }
}

// Function to update a user's settings field
export async function updateUserSettings({ id, data }) {
    const docRef = doc(database, "User", id) // Reference to the user's document using their id
    await updateDoc(docRef, { 
        settings: data // Update the 'settings' field with the provided data
    })
}

// Function to update a user's card information
export async function updateUserCard({ id, data }) {
    const docRef = doc(database, "User", id) // Reference to the user's document
    await updateDoc(docRef, { 
        card: data // Update the 'card' field with the provided data
    })
}

// Function to allow a user to buy a subscription by updating the 'subscription' field
export const buySubscription = async ({ userId, planId }) => {
    try {
        const userRef = doc(database, 'User', userId); // Reference to the user's document using their id
        await updateDoc(userRef, {
            subscription: planId // Update the 'subscription' field with the new plan ID
        });
    } catch (error) {
        console.error("Error buying subscription:", error); // Log any errors during the process
        throw new Error('Subscription purchase failed'); // Throw error if subscription purchase fails
    }
};