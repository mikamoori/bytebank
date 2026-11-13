
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1VASuTKhF3jQ6AyWx85cuLzqTBhcBhaw",
  authDomain: "bytebank-c0e37.firebaseapp.com",
  projectId: "bytebank-c0e37",
  storageBucket: "bytebank-c0e37.firebasestorage.app",
  messagingSenderId: "571565486105",
  appId: "1:571565486105:web:8200874e3ae711dd5bba88",
};

// Verifica se o Firebase já foi inicializado
const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
