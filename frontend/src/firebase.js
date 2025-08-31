import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-auth-b8aa0.firebaseapp.com",
  projectId: "mern-auth-b8aa0",
  storageBucket: "mern-auth-b8aa0.appspot.com",
  messagingSenderId: "1050835060039",
  appId: "1:1050835060039:web:5ed5377b35feb79a28b862",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };