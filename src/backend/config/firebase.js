const admin = require("firebase-admin");

// Assure-toi que le chemin correspond à l'endroit où tu as mis le fichier
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };