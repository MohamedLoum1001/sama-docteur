// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// --- ROUTES AUTHENTIFICATION ---

// Inscription
router.post("/register", authController.register);

// Connexion
router.post("/login", authController.login);

// --- ROUTE PAIEMENT STRIPE ---

// Cette route appelle la fonction createPaymentIntent dans ton contrôleur
router.post("/create-payment-intent", authController.createPaymentIntent);

// --- ROUTE LOG DE DÉCONNEXION ---
router.post("/logout-log", (req, res) => {
    console.log("============================================");
    console.log("👋 DÉCONNEXION DÉTECTÉE");
    console.log(`Utilisateur : ${req.body.name}`);
    console.log(`Statut      : Déconnexion réussie ✅`);
    console.log(`Heure       : ${new Date().toLocaleTimeString()}`);
    console.log("============================================");
    res.status(200).json({ message: "Log de déconnexion reçu" });
});

module.exports = router;