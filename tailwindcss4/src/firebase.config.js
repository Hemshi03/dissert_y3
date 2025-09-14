// firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // optional

// Only named exports
export { app, auth, db, storage };

