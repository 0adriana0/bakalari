// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPDEfU32XQo24uNd_3sgzephjXXEun0Ak",
  authDomain: "bakalari-d3f7e.firebaseapp.com",
  projectId: "bakalari-d3f7e",
  storageBucket: "bakalari-d3f7e.firebasestorage.app",
  messagingSenderId: "555892503275",
  appId: "1:555892503275:web:96cfeb12ab2409067cc4ae",
  measurementId: "G-6EJGTW2Y59"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);