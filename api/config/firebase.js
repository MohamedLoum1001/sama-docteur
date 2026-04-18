// api/config/firebase.js
const admin = require("firebase-admin");
require('dotenv').config();

if (!admin.apps.length) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (privateKey) {
            // ✅ Cette ligne traite tous les formats de sauts de ligne possibles (\n textuel ou réel)
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        // Vérification de sécurité pour le debug sur Vercel
        if (!projectId || !clientEmail || !privateKey) {
            console.error("❌ Variables Firebase Admin manquantes sur Vercel. Vérifiez votre Dashboard.");
            if (!projectId) console.error("-> FIREBASE_PROJECT_ID est indéfini");
            if (!clientEmail) console.error("-> FIREBASE_CLIENT_EMAIL est indéfini");
            if (!privateKey) console.error("-> FIREBASE_PRIVATE_KEY est indéfini");
        } else {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}.firebaseio.com`
            });
            console.log("✅ Firebase Admin initialisé");
        }
    } catch (error) {
        console.error("❌ Erreur d'initialisation Firebase:", error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };