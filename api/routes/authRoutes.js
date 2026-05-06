// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// --- ROUTES AUTHENTIFICATION ---
router.post("/register", authController.register);
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
        console.error("❌ Erreur log déconnexion:", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- ✅ NOUVELLE ROUTE : LOG DE MODÉRATION (Archive, Blocage, Suppression) ---
router.post("/admin-log", (req, res) => {
    try {
        const { adminName, userName, action } = req.body;

        // Définition de l'émojis selon l'action pour un terminal plus lisible
        const icons = {
            archived: "📦 ARCHIVAGE",
            blocked: "🚫 BLOCAGE",
            deleted: "🗑️ SUPPRESSION",
            actif: "✅ RÉACTIVATION"
        };

        console.log("============================================");
        console.log(`${icons[action] || "⚖️ MODÉRATION"} DÉTECTÉE`);
        console.log(`Admin       : ${adminName || "Admin"}`);
        console.log(`Cible       : ${userName || "Inconnu"}`);
        console.log(`Action      : ${action.toUpperCase()}`);
        console.log(`Heure       : ${new Date().toLocaleTimeString()}`);
        console.log("============================================");

        res.status(200).json({ message: "Log admin reçu" });
    } catch (error) {
        console.error("❌ Erreur log admin:", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;