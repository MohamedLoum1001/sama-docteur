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
router.post("/create-payment-intent", authController.createPaymentIntent);

// --- ROUTE LOG DE DÉCONNEXION ---
router.post("/logout-log", (req, res) => {
    try {
        const { name } = req.body;

        console.log("============================================");
        console.log("👋 DÉCONNEXION DÉTECTÉE");
        console.log(`Utilisateur : ${name || "Inconnu"}`);
        console.log(`Statut      : Déconnexion réussie ✅`);
        console.log(`Heure       : ${new Date().toLocaleTimeString()}`);
        console.log("============================================");

        res.status(200).json({ message: "Log de déconnexion reçu" });
    } catch (error) {
        // En cas d'erreur, on log côté serveur et on renvoie du JSON pour éviter de bloquer le client
        console.error("❌ Erreur log déconnexion:", error.message);
        res.status(500).json({
            error: "Erreur serveur lors du log de déconnexion",
            details: error.message
        });
    }
});

module.exports = router;