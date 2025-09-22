// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBhZzK6F6C9T_913EyH1cdIv007EYmvZ5k",
    authDomain: "sama-docteur-6fcb6.firebaseapp.com",
    projectId: "sama-docteur-6fcb6",
    storageBucket: "sama-docteur-6fcb6.appspot.com",
    messagingSenderId: "249613998656",
    appId: "1:249613998656:web:988288dd42c8c3caa99da5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
