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
        const allowedOrigins = [
            'http://localhost:3000',
            'https://sama-docteur.vercel.app'
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Erreur CORS : Origine non autorisée par la politique du serveur.'));
        }
    },
    credentials: true,
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

// ✅ ROUTES AUTHENTIFICATION (Avec gestion d'erreur Try/Catch)
app.use("/api/auth", (req, res, next) => {
    try {
        // On passe la requête aux routes définies dans authRoutes
        authRoutes(req, res, next);
    } catch (error) {
        console.error("ERREUR ROUTE AUTH:", error);
        res.status(500).json({
            error: "Le serveur a rencontré une erreur interne.",
            details: error.message
        });
    }
});

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