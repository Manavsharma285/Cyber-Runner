import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUPqCcBVFIwqQqhgbc0sB3oi89uvg-q5o",
  authDomain: "cyber-runner-3e6c0.firebaseapp.com",
  projectId: "cyber-runner-3e6c0",
  storageBucket: "cyber-runner-3e6c0.firebasestorage.app",
  messagingSenderId: "662614144746",
  appId: "1:662614144746:web:bed8018d88f994ae958993",
  measurementId: "G-NMKJS45955"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
