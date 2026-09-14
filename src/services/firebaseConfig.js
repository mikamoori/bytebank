import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1VASuTKhf3jQ6AyWx85cuLzqTBhcBhaw",
  authDomain: "bytebank-c0e37.firebaseapp.com",
  projectId: "bytebank-c0e37",
  storageBucket: "bytebank-c0e37.firebasestorage.app",
  messagingSenderId: "571565486105",
  appId: "1:571565486105:web:8200874e3ae711dd5bba88"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);