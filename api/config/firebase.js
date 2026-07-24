const admin = require("firebase-admin");
require('dotenv').config();

if (!admin.apps.length) {
    try {
        const fs = require('fs');
        const path = require('path');

        // FORCE le chemin absolu du conteneur Docker en priorité, sinon prend le chemin local relatif
        const containerKeyPath = '/app/serviceAccountKey.json';
        const localKeyPath = path.join(__dirname, '../serviceAccountKey.json');

        let finalKeyPath = null;

        if (fs.existsSync(containerKeyPath) && !fs.lstatSync(containerKeyPath).isDirectory()) {
            finalKeyPath = containerKeyPath;
        } else if (fs.existsSync(localKeyPath) && !fs.lstatSync(localKeyPath).isDirectory()) {
            finalKeyPath = localKeyPath;
        }

        // Cas A : Si on a trouvé un vrai FICHIER clé json (Local / Docker)
        if (finalKeyPath) {
            admin.initializeApp({
                credential: admin.credential.cert(finalKeyPath),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
            console.log(`Firebase Admin initialisé via le fichier : ${finalKeyPath}`);
        }
        // Cas B : Mode Vercel / Variables d'environnement
        else {
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            if (privateKey) {
                privateKey = privateKey.replace(/\\n/g, '\n');
            }

            if (!projectId || !clientEmail || !privateKey) {
                // SÉCURITÉ GITHUB ACTIONS : Si aucun identifiant n'est présent, on initialise à blanc pour éviter le crash du build
                console.warn("Mode CI/CD détecté (ou configuration absente). Initialisation par défaut pour éviter le crash.");
                admin.initializeApp({
                     // Permet au SDK de créer l'instance db sans crasher au build
                    projectId: "sama-docteur-placeholder"
                });
            } else {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}.firebaseio.com`
                });
                console.log("Firebase Admin initialisé via les variables d'environnement (Vercel)");
            }
        }
    } catch (error) {
        console.error("Erreur critique d'initialisation Firebase:", error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };