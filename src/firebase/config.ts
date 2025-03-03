// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyARVKmVp2t-oy6UfijYbts1hHB_unF5E",
  authDomain: "invo-app-792b9.firebaseapp.com",
  projectId: "invo-app-792b9",
  storageBucket: "invo-app-792b9.firebasestorage.app",
  messagingSenderId: "671360232733",
  appId: "1:671360232733:web:fca927092dbf4e519205f4",
  measurementId: "G-CMFY0DCEQ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;