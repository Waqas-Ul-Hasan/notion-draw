// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // Add Realtime Database SDK

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5XfjZh319W4Di5hR1H3TibVSxvvRBexw",
  authDomain: "notiondrawcloud.firebaseapp.com",
  databaseURL: "https://notiondrawcloud-default-rtdb.firebaseio.com",
  projectId: "notiondrawcloud",
  storageBucket: "notiondrawcloud.firebasestorage.app",
  messagingSenderId: "440247312831",
  appId: "1:440247312831:web:78d9bdfdc10db4493ac10a",
  measurementId: "G-Y0SMBGHG0K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app); // Export the database instance