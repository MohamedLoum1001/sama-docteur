const bcrypt = require('bcrypt');
const { auth, db, admin } = require("../config/firebase");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// ✅ Configuration du transporteur Nodemailer (Gmail)
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
 * LOGIQUE D'INSCRIPTION (AVEC GÉNÉRATION DE MDP ET ENVOI DE MAIL COMPATIBLE OUTLOOK)
 */
exports.register = async (req, res) => {
    try {
        const {
            email, prenom, nom, adresse, telephone,
            dateNaissance, role, specialite
        } = req.body;

        // ✅ 1. Génération d'un mot de passe aléatoire de 10 caractères
        const generatedPassword = Math.random().toString(36).slice(-10);

        // ✅ 2. Création du compte dans Firebase Auth
        const userRecord = await auth.createUser({
            email: email,
            password: generatedPassword,
            displayName: `${prenom} ${nom}`,
            disabled: false,
        });

        // ✅ 3. Préparation des données pour Firestore
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
            mustChangePassword: true // Pour forcer le changement au premier login
        };

        await db.collection("users").doc(userRecord.uid).set(userData);

        // ✅ 4. Configuration du mail COMPATIBLE OUTLOOK
        const resetPasswordLink = "https://sama-docteur.vercel.app/forget-password";

        const mailOptions = {
            from: '"Sama Docteur" <no-reply@samadocteur.com>',
            to: email,
            subject: 'Création de votre compte Sama Docteur',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.5; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #00a5a8; text-align: center;">Bienvenue sur Sama Docteur, ${prenom} !</h2>
                    <p>Un administrateur a créé un compte pour vous en tant que <b>${userData.role.toUpperCase()}</b>.</p>
                    
                    <p>Voici vos identifiants sécurisés pour vous connecter :</p>
                    
                    <div style="background-color: #f4f4f4; padding: 15px; border-left: 4px solid #00a5a8; margin: 20px 0;">
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

                    <p style="font-size: 12px; color: #888; text-align: center;">
                        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                        ${resetPasswordLink}
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                    <p style="font-size: 11px; color: #aaa; text-align: center;">
                        &copy; 2026 Sama Docteur - Plateforme de santé
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log("============================================");
        console.log("🆕 UTILISATEUR CRÉÉ PAR ADMIN");
        console.log(`Email     : ${email}`);
        console.log(`Rôle      : ${userData.role}`);
        console.log(`Statut    : Mail compatible Outlook envoyé ✅`);
        console.log("============================================");

        res.status(201).json({
            message: "Utilisateur créé et identifiants envoyés par mail ✅",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("❌ Crash Register:", error.message);
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

        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const userData = userDoc.data();

        if (userData.status === 'archived' || userData.status === 'blocked') {
            console.log("============================================");
            console.log("🚫 ACCÈS REFUSÉ");
            console.log(`Utilisateur : ${userData.prenom} ${userData.nom}`);
            console.log("============================================");

            return res.status(403).json({
                error: "Votre compte est archivé ou bloqué.",
                user: { id: userRecord.uid, status: userData.status, prenom: userData.prenom, nom: userData.nom }
            });
        }

        console.log("============================================");
        console.log("🔑 CONNEXION RÉUSSIE");
        console.log(`Prénom    : ${userData.prenom}`);
        console.log("============================================");

        res.status(200).json({
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
        console.error("❌ Crash Login:", error.message);
        res.status(401).json({
            error: "Erreur de connexion.",
            details: error.message
        });
    }
};