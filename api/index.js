// api/index.js
require('dotenv').config(); // ⚠️ INDISPENSABLE pour lire les variables .env (Stripe, Port, etc.)

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---
// Autorise ton application React à communiquer avec ce serveur
app.use(cors());

// Permet au serveur de lire le format JSON envoyé dans les requêtes (body)
app.use(express.json());

// --- ROUTES ---
// Toutes tes routes d'authentification et de paiement Stripe passeront par ici
app.use("/api/auth", authRoutes);

// --- LANCEMENT DU SERVEUR (ADAPTATION VERCEL) ---

// Sur Vercel, on ne doit pas appeler app.listen() en production.
// On garde le listen uniquement pour ton développement local.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log("============================================");
        console.log(`🚀 SERVEUR SAMA DOCTEUR LANCÉ EN LOCAL`);
        console.log(`📡 URL : http://localhost:${PORT}`);
        console.log(`🔐 Mode : Développement`);
        console.log("============================================");
    });
}

// 🚀 CETTE LIGNE EST LA PLUS IMPORTANTE POUR VERCEL
// Elle permet à Vercel de transformer ton app Express en Serverless Function
module.exports = app;