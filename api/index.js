// api/index.js
require('dotenv').config(); // ⚠️ INDISPENSABLE pour lire les variables .env

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---

// 1. ✅ Configuration CORS (Simplifiée pour éviter les erreurs de compilation)
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://sama-docteur.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ On supprime app.options('(.*)') car cors() gère déjà les requêtes OPTIONS par défaut
// Cela corrige l'erreur "Missing parameter name" que tu avais dans le terminal.

app.use(express.json());

// --- ROUTES ---

// ✅ Route de test (À tester : https://sama-docteur.vercel.app/api/health)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Serveur Sama Docteur en ligne !" });
});

// ✅ ROUTES AUTHENTIFICATION
// Note : authRoutes est un middleware de routage, on l'utilise directement
app.use("/api/auth", authRoutes);

// ✅ GESTION DES ERREURS 404 (Syntaxe propre sans caractères spéciaux)
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée sur le serveur." });
});

// --- LANCEMENT DU SERVEUR (LOCAL UNIQUEMENT) ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log("============================================");
        console.log(`🚀 SERVEUR SAMA DOCTEUR LANCÉ EN LOCAL`);
        console.log(`📡 URL : http://localhost:${PORT}`);
        console.log("============================================");
    });
}

// 🚀 EXPORT POUR VERCEL
module.exports = app;