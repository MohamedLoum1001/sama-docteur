// api/index.js
require('dotenv').config();

// ✅ INITIALISATION PRIORITAIRE : Firebase avant les routes
require("./config/firebase");

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---

// ✅ CORS ULTRA-STRICT : Uniquement ton React local (3000) et ton plan Vercel
app.use(cors({
    origin: [
        'http://localhost:3000',          // Ton application React standard
        'https://sama-docteur.vercel.app' // Ton éventuel déploiement frontend Vercel
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- ROUTES ---

// Route de santé locale
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Serveur Sama Docteur opérationnel en local !",
        hostname: req.headers.host,
        env: process.env.NODE_ENV || "development"
    });
});

app.use("/api/auth", authRoutes);

// Gestion 404
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée sur le serveur backend." });
});

// --- LANCEMENT LOCAL ---
const PORT = process.env.PORT || 8000;

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 SERVEUR BACKEND LOCAL LANCÉ : Port ${PORT}`);
    });
}

module.exports = app;