// api/index.js
require('dotenv').config();

// INITIALISATION PRIORITAIRE : Firebase avant les routes
require("./config/firebase");

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---

// Configuration CORS flexible pour dev, production Vercel et outils de test (Postman/Render)
const allowedOrigins = [
    'http://localhost:3000',
    'https://sama-docteur.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Autorise les requêtes sans origin (comme Postman, cURL, ou requêtes serveur à serveur)
        if (!origin) return callback(null, true);

        // Autorise les domaines officiels ou sous-domaines Vercel de preview
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        return callback(null, true); // Permet la flexibilité pour la phase de recette
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- ROUTES ---

// 1. Route racine de test (Pour Render / Postman)
app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "API Sama Docteur opérationnelle",
        documentation: "/api/health"
    });
});

// 2. Route de santé officielle
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Serveur Sama Docteur opérationnel !",
        hostname: req.headers.host,
        env: process.env.NODE_ENV || "development"
    });
});

// 3. Routes métiers
app.use("/api/auth", authRoutes);

// 4. Gestion 404 globale
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée sur le serveur backend." });
});

// --- LANCEMENT D'ÉCOUTE ---
const PORT = process.env.PORT || 8000;

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 SERVEUR BACKEND LANCÉ : Port ${PORT}`);
    });
}

module.exports = app;