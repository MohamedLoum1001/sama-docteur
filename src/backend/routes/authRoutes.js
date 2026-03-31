// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route pour l'inscription
router.post("/register", authController.register);

// ROUTE MANQUANTE (C'est sûrement ici le problème)
router.post("/login", authController.login);

// Route pour le log de déconnexion
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