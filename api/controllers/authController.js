const bcrypt = require('bcrypt');
const { auth, db, admin } = require("../config/firebase");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * LOGIQUE DE PAIEMENT (STRIPE)
 */
exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, patientName, doctorName, date, time } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Conversion en centimes
            currency: 'eur',
            payment_method_types: ['card'],
            metadata: {
                patientName,
                doctorName,
                appointmentDate: date,
                appointmentTime: time
            }
        });

        console.log("============================================");
        console.log("💳 TENTATIVE DE PAIEMENT GÉNÉRÉE");
        console.log(`Patient   : ${patientName}`);
        console.log(`Montant   : ${amount} €`);
        console.log(`Statut    : ClientSecret généré ✅`);
        console.log("============================================");

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("❌ Crash createPaymentIntent:", error.message);
        res.status(500).json({
            error: "Erreur lors de l'initialisation du paiement.",
            details: error.message
        });
    }
};

/**
 * LOGIQUE D'INSCRIPTION
 */
exports.register = async (req, res) => {
    try {
        const {
            email, password, prenom, nom, adresse,
            telephone, dateNaissance, lieuNaissance, role, specialite
        } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: `${prenom} ${nom}`,
            disabled: false,
        });

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
        };

        await db.collection("users").doc(userRecord.uid).set(userData);

        // ✅ LOGS DÉTAILLÉS DANS LE TERMINAL
        console.log("============================================");
        console.log("🆕 NOUVEL UTILISATEUR INSCRIT");
        console.log(`Prénom    : ${prenom}`);
        console.log(`Nom       : ${nom}`);
        console.log(`Rôle      : ${userData.role}`);
        console.log(`ID (UID)  : ${userRecord.uid}`);
        console.log("============================================");

        res.status(201).json({
            message: "Utilisateur créé avec succès ✅",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("❌ Crash Register:", error.message);
        res.status(500).json({
            error: "Erreur interne du serveur lors de l'inscription.",
            details: error.message
        });
    }
};

/**
 * LOGIQUE DE CONNEXION (LOGIN)
 */
exports.login = async (req, res) => {
    try {
        const { email } = req.body;

        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé dans la base de données." });
        }

        const userData = userDoc.data();

        // ✅ LOGS DÉTAILLÉS DANS LE TERMINAL
        console.log("============================================");
        console.log("🔑 CONNEXION RÉUSSIE");
        console.log(`Prénom    : ${userData.prenom}`);
        console.log(`Nom       : ${userData.nom}`);
        console.log(`Rôle      : ${userData.role}`);
        console.log(`ID (UID)  : ${userRecord.uid}`);
        console.log("============================================");

        res.status(200).json({
            user: {
                id: userRecord.uid,
                uid: userRecord.uid,
                email: userRecord.email,
                role: userData.role,
                prenom: userData.prenom,
                nom: userData.nom
            }
        });
    } catch (error) {
        console.error("❌ Crash Login:", error.message);
        const status = error.code === 'auth/user-not-found' ? 404 : 401;
        res.status(status).json({
            error: "Erreur de connexion : Identifiants incorrects ou problème serveur.",
            details: error.message
        });
    }
};