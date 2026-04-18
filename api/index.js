// api/index.js
require('dotenv').config(); // ⚠️ INDISPENSABLE pour lire les variables .env

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---

// 1. ✅ Configuration CORS en PREMIER (Très important pour éviter ERR_FAILED)
app.use(cors({
    origin: function (origin, callback) {
        // Liste des domaines autorisés
        const allowedOrigins = [
            'http://localhost:3000',
            'https://sama-docteur.vercel.app'
        ];
        // Autoriser si l'origine est dans la liste ou si c'est une requête sans origine (ex: mobile/Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Erreur CORS : Origine non autorisée par la politique du serveur.'));
        }
    },
    credentials: true, // Autorise l'envoi de cookies/headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. ✅ Options de pré-vol (Preflight) pour toutes les routes
app.options('*', cors());

// Permet au serveur de lire le format JSON
app.use(express.json());

// --- ROUTES ---

// ✅ ROUTE DE TEST (À tester : https://sama-docteur.vercel.app/api/health)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Serveur Sama Docteur en ligne !" });
});

// ✅ ROUTES AUTHENTIFICATION
app.use("/api/auth", authRoutes);

// ✅ GESTION DES ERREURS 404
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} non trouvée sur le serveur.` });
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