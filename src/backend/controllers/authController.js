const bcrypt = require('bcrypt');
const { auth, db, admin } = require("../config/firebase");

/**
 * LOGIQUE D'INSCRIPTION
 */
exports.register = async (req, res) => {
    const {
        email, password, prenom, nom, adresse,
        telephone, dateNaissance, lieuNaissance, role, specialite
    } = req.body;

    try {
        // --- HASHER LE MOT DE PASSE (Sécurité renforcée) ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 1. Création du compte dans Firebase Authentication
        const userRecord = await auth.createUser({
            email: email,
            password: password, // Firebase Auth gère son propre hash interne
            displayName: `${prenom} ${nom}`,
            disabled: false,
        });

        // 2. Préparation de l'objet utilisateur pour Firestore
        const userData = {
            uid: userRecord.uid,
            prenom,
            nom,
            email,
            adresse,
            telephone,
            dateNaissance,
            lieuNaissance,
            role: role || "patient",
            specialite: role === "medecin" ? specialite : "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "active"
            // passwordHash: hashedPassword // Optionnel : si tu veux garder une trace hashée
        };

        // 3. Enregistrement dans la collection "users"
        await db.collection("users").doc(userRecord.uid).set(userData);

        // --- AFFICHAGE DANS LE TERMINAL (DEBUG) ---
        console.log("============================================");
        console.log("🆕 NOUVEL UTILISATEUR INSCRIT (SÉCURISÉ)");
        console.log(`ID unique (UID)   : ${userRecord.uid}`);
        console.log(`Nom complet       : ${prenom} ${nom}`);
        console.log(`Email             : ${email}`);
        console.log(`Téléphone         : ${telephone}`);
        console.log(`Rôle              : ${userData.role}`);
        if (userData.specialite) console.log(`Spécialité        : ${userData.specialite}`);
        console.log(`Adresse           : ${adresse}`);
        console.log("============================================");

        // 4. Réponse au frontend
        res.status(201).json({
            message: "Utilisateur créé avec succès ✅",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'inscription :", error.message);

        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        res.status(500).json({
            error: "Erreur lors de l'inscription.",
            details: error.message
        });
    }
};

/**
 * LOGIQUE DE CONNEXION (LOGIN)
 */
exports.login = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Chercher l'utilisateur dans Firebase Auth
        const userRecord = await auth.getUserByEmail(email);

        // 2. Chercher son rôle et ses infos dans Firestore
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé dans la base de données." });
        }

        const userData = userDoc.data();

        // --- AFFICHAGE TERMINAL ---
        console.log("============================================");
        console.log("🔑 CONNEXION RÉUSSIE");
        console.log(`Utilisateur : ${userData.prenom} ${userData.nom}`);
        console.log(`Rôle        : ${userData.role}`);
        console.log("============================================");

        // Envoyer la réponse au frontend
        res.status(200).json({
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                role: userData.role,
                prenom: userData.prenom,
                nom: userData.nom
            }
        });
    } catch (error) {
        console.error("Erreur de connexion :", error.message);
        res.status(401).json({ error: "Identifiants incorrects ou compte inexistant." });
    }
};