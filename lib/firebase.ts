import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlTNBTsDwplBVXket4TPUTMVlanb2HHxk",
  authDomain: "auth-e820e.firebaseapp.com",
  projectId: "auth-e820e",
  storageBucket: "auth-e820e.firebasestorage.app",
  messagingSenderId: "561674401648",
  appId: "1:561674401648:web:16015b3688c702e0f041b5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();