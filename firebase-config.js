/**
 * Firebase Configuration for HackHub
 * Handles Firebase initialization and re-exports auth and db
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== FIREBASE CONFIG =====
// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAimixac4ssRm_InowTJTGKtBlSrdhtny4",
  authDomain: "hackathonapp-3cd50.firebaseapp.com",
  projectId: "hackathonapp-3cd50",
  storageBucket: "hackathonapp-3cd50.firebasestorage.app",
  messagingSenderId: "223597238977",
  appId: "1:223597238977:web:d24b6c556ac500de2b1240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Configure Firebase Auth settings
auth.languageCode = 'en';