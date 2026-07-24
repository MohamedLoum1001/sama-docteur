const admin = require("firebase-admin");
require('dotenv').config();

if (!admin.apps.length) {
    try {
        // Option 1 : Variables individuelles (Recommandé pour Render & Vercel)
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            // Traitement rigoureux des sauts de ligne de la clé RSA
            privateKey = privateKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}.firebaseio.com`
            });
            console.log("✅ Firebase Admin initialisé via les variables individuelles (Render/Vercel) !");
        }
        // Option 2 : Fallback sur la variable JSON globale FIREBASE_SERVICE_ACCOUNT si présente
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            let serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
                ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
                : process.env.FIREBASE_SERVICE_ACCOUNT;

            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
            console.log("✅ Firebase Admin initialisé via FIREBASE_SERVICE_ACCOUNT !");
        }
        // Option 3 : Mode secours local / CI-CD
        else {
            console.warn("⚠️ Aucune variable Firebase valide détectée. Initialisation par défaut.");
            admin.initializeApp({
                projectId: "sama-docteur-placeholder"
            });
        }
    } catch (error) {
        console.error("❌ Erreur critique d'initialisation Firebase:", error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };