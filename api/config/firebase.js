const admin = require("firebase-admin");
require('dotenv').config();

if (!admin.apps.length) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            // Remplace les \n textuels par de vrais retours à la ligne RSA
            privateKey = privateKey.replace(/\\n/g, '\n');

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                })
            });
            console.log("✅ Firebase Admin initialisé !");
        }
    } catch (error) {
        console.error("❌ Erreur Firebase:", error.message);
    }
}

module.exports = { db: admin.firestore(), auth: admin.auth(), admin };