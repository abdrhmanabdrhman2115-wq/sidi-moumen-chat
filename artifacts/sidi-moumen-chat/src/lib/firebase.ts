import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZP9Jdov0vSWttmF_vDlT64twJbfXjWog",
  authDomain: "sidi-moumen-74730.firebaseapp.com",
  projectId: "sidi-moumen-74730",
  storageBucket: "sidi-moumen-74730.firebasestorage.app",
  messagingSenderId: "908225254735",
  appId: "1:908225254735:web:fe3983209d53ac6a68a13a",
  measurementId: "G-KS8RC33BJV",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
