const admin = require("firebase-admin");

if (!admin.apps.length) {
    try {
        // ✅ Utilisation des variables d'environnement (Sécurisé pour Vercel)
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // ✅ Correction cruciale : remplace les sauts de ligne pour la clé privée
                privateKey: process.env.FIREBASE_PRIVATE_KEY
                    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                    : undefined,
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log("Firebase Admin Initialized ✅");
    } catch (error) {
        console.error("Firebase Admin Error ❌:", error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

// ✅ Export cohérent avec ton utilisation dans les controllers
module.exports = { db, auth, admin };