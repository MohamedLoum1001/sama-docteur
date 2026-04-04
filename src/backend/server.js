// server.js ou app.js
require('dotenv').config(); // ⚠️ INDISPENSABLE pour lire les variables .env (Stripe, Port, etc.)

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---
// Autorise ton application React (localhost:3000) à communiquer avec ce serveur
app.use(cors());

// Permet au serveur de lire le format JSON envoyé dans les requêtes (body)
app.use(express.json());

// --- ROUTES ---
// Toutes tes routes d'authentification et de paiement Stripe passeront par ici
app.use("/api/auth", authRoutes);

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("============================================");
    console.log(`🚀 SERVEUR SAMA DOCTEUR LANCÉ`);
    console.log(`📡 URL : http://localhost:${PORT}`);
    console.log(`🔐 Mode : ${process.env.NODE_ENV || 'Développement'}`);
    console.log("============================================");
});