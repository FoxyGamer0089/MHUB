/**
 * firebase.js
 * Central Firebase Configuration
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBoocvF7ZiwqECv5utgY79Q7cnWMjtvEuk",
    authDomain: "dropship-app-ab369.firebaseapp.com",
    projectId: "dropship-app-ab369",
    storageBucket: "dropship-app-ab369.firebasestorage.app",
    messagingSenderId: "633788165308",
    appId: "1:633788165308:web:138f291d99481a7b87f4b9",
    measurementId: "G-BDWNN0Q79S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Export db for use in storage.js
export { db };
