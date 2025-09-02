// firebase.config.js (or firebase.js)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; // optional if you use storage

// Replace the placeholders below with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyA75A0qdPT1qVMY7cQnjXBtXHr5kTjal1o",
  authDomain: "kodedge-auth.firebaseapp.com",
  projectId: "kodedge-auth",
  storageBucket: "kodedge-auth.firebasestorage.app",
  messagingSenderId: "829435078963",
  appId: "1:829435078963:web:c993a04ebda7f1150a3646",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to use elsewhere
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // optional

export default app;
