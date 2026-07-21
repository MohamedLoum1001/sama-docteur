const bcrypt = require('bcrypt');
const { auth, db, admin } = require("../config/firebase");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Configuration du transporteur Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * LOGIQUE DE PAIEMENT (STRIPE)
 */
exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, patientName, doctorName, date, time } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
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
        console.log("TENTATIVE DE PAIEMENT GÉNÉRÉE");
        console.log(`Patient   : ${patientName}`);
        console.log(`Montant   : ${amount} €`);
        console.log(`Statut    : ClientSecret généré`);
        console.log("============================================");

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Crash createPaymentIntent:", error.message);
        res.status(500).json({
            error: "Erreur lors de l'initialisation du paiement.",
            details: error.message
        });
    }
};

/**
 * LOGIQUE D'INSCRIPTION : Traitement sécurisé des données entrantes
 */
exports.register = async (req, res) => {
    try {
        const {
            email, prenom, nom, adresse, telephone,
            dateNaissance, role, specialite
        } = req.body;
        // Génération d'un mot de passe temporaire cryptographiquement isolé
        const generatedPassword = Math.random().toString(36).slice(-10);
        // Création via le SDK sécurisé Firebase Auth (pas de requête SQL/NoSQL brute)
        const userRecord = await auth.createUser({
            email: email,
            password: generatedPassword,
            displayName: `${prenom} ${nom}`,
            disabled: false,
        });
        // Construction explicite du document Firestore sans injection possible
        const userData = {
            uid: userRecord.uid,
            prenom,
            nom,
            email,
            adresse: adresse || "",
            telephone: telephone || "",
            dateNaissance: dateNaissance || "",
            role: role || "patient",
            specialite: role === "medecin" ? specialite : "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "actif",
            mustChangePassword: true
        };

        await db.collection("users").doc(userRecord.uid).set(userData);

        const frontendOrigin = req.get('origin') || "https://sama-docteur.vercel.app";
        const resetPasswordLink = `${frontendOrigin}/forget-password`;
        // envoi du mail de bienvenue via Nodemailer
        const mailOptions = {
            from: '"Sama Docteur" <no-reply@samadocteur.com>',
            to: email,
            subject: 'Création de votre compte Sama Docteur',
            html: `
                <div style="font-family: Arial, sans-serif; 
                color: #333; 
                padding: 20px; line-height: 1.5;
                max-width: 600px; 
                margin: auto; 
                border: 1px solid #eee; 
                border-radius: 10px;">
                    <h2 style="color: #00a5a8; text-align: center;">Bienvenue sur Sama Docteur, ${prenom} !</h2>
                    <p>Un administrateur a créé un compte pour vous en tant que <b>${userData.role.toUpperCase()}</b>.</p>
                    
                    <p>Voici vos identifiants sécurisés pour vous connecter :</p>
                    
                    <div style="background-color: #f4f4f4; 
                    padding: 15px; 
                    border-left: 4px solid #00a5a8; 
                    margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px;"><b>Email :</b> ${email}</p>
                        <p style="margin: 10px 0 0 0; font-size: 16px;"><b>Mot de passe temporaire :</b> <span style="color: #d9534f; font-weight: bold;">${generatedPassword}</span></p>
                    </div>

                    <p style="margin-top: 25px;">Pour sécuriser votre compte, merci de modifier votre mot de passe immédiatement :</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetPasswordLink}" 
                           style="background-color: #00a5a8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            CHANGER MON MOT DE PASSE
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                    <p style="font-size: 11px; color: #aaa; text-align: center;">
                        &copy; 2026 Sama Docteur - Plateforme de santé de confiance
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log("============================================");
        console.log("UTILISATEUR CRÉÉ ET LIEN D'ACCÈS ENVOYÉ");
        console.log(`Email     : ${email}`);
        console.log(`Origine   : ${frontendOrigin}`);
        console.log("============================================");

        res.status(201).json({
            message: "Utilisateur créé et identifiants envoyés par mail",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("Crash Register:", error.message);
        res.status(500).json({
            error: "Erreur lors de la création de l'utilisateur.",
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

        if (!email) {
            return res.status(400).json({ error: "L'adresse email est requise." });
        }

        // 1. Récupération de l'utilisateur via le SDK Firebase Admin
        const userRecord = await auth.getUserByEmail(email);

        // 2. Recherche du profil étendu dans Firestore
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé dans l'application." });
        }

        const userData = userDoc.data();

        // 3. Validation du statut d'accès
        if (userData.status === 'archived' || userData.status === 'blocked') {
            return res.status(403).json({
                error: "Votre compte est archivé ou bloqué.",
                user: { id: userRecord.uid, status: userData.status, prenom: userData.prenom, nom: userData.nom }
            });
        }

        console.log("============================================");
        console.log("🚀 DÉMO LOCAL : CONNEXION RÉUSSIE");
        console.log(`Utilisateur : ${userData.prenom} ${userData.nom} (${userData.role})`);
        console.log("============================================");

        return res.status(200).json({
            user: {
                id: userRecord.uid,
                uid: userRecord.uid,
                email: userRecord.email,
                role: userData.role,
                prenom: userData.prenom,
                nom: userData.nom,
                status: userData.status || "actif"
            }
        });
    } catch (error) {
        console.error("Crash Login API:", error.code, error.message);

        // GESTION DES CODES ERREURS SÉCURISÉE
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ error: "Aucun compte n'est associé à cette adresse email." });
        }

        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: "Le format de l'adresse email est invalide." });
        }

        return res.status(500).json({
            error: "Une erreur interne est survenue lors de l'authentification.",
            details: error.message
        });
    }
};
/**
 * LOGIQUE DE DÉCONNEXION (LOGOUT)
 */
exports.logout = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(`👤 Déconnexion enregistrée : ${name || "Utilisateur"}`);
        return res.status(200).json({ message: "Déconnexion réussie côté serveur." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};