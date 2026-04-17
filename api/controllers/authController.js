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
            // On ajoute des métadonnées pour les retrouver dans le dashboard Stripe
            metadata: {
                patientName,
                doctorName,
                appointmentDate: date,
                appointmentTime: time
            }
        });

        // --- AFFICHAGE DANS LE TERMINAL (DEBUG PAIEMENT RÉUSSI) ---
        // Note : Dans un flux réel, le succès est confirmé via un webhook ou après la confirmation client
        console.log("============================================");
        console.log("💳 TENTATIVE DE PAIEMENT GÉNÉRÉE");
        console.log(`Patient   : ${patientName}`);
        console.log(`Médecin   : ${doctorName}`);
        console.log(`Rdv       : ${date} à ${time}`);
        console.log(`Montant   : ${amount} €`);
        console.log(`Statut    : ClientSecret généré ✅`);
        console.log("============================================");

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("❌ Erreur Stripe:", error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * LOGIQUE D'INSCRIPTION
 */
exports.register = async (req, res) => {
    const {
        email, password, prenom, nom, adresse,
        telephone, dateNaissance, lieuNaissance, role, specialite
    } = req.body;

    try {
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

        console.log("============================================");
        console.log("🆕 NOUVEL UTILISATEUR INSCRIT");
        console.log(`ID (UID)    : ${userRecord.uid}`);
        console.log(`Nom         : ${prenom} ${nom}`);
        console.log(`Rôle        : ${userData.role}`);
        console.log("============================================");

        res.status(201).json({
            message: "Utilisateur créé avec succès ✅",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("❌ Erreur inscription :", error.message);
        res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
};

/**
 * LOGIQUE DE CONNEXION (LOGIN)
 */
exports.login = async (req, res) => {
    const { email } = req.body;

    try {
        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const userData = userDoc.data();

        console.log("============================================");
        console.log("🔑 CONNEXION RÉUSSIE");
        console.log(`Utilisateur : ${userData.prenom} ${userData.nom}`);
        console.log(`UID         : ${userRecord.uid}`);
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
        console.error("❌ Erreur de connexion :", error.message);
        res.status(401).json({ error: "Identifiants incorrects." });
    }
};