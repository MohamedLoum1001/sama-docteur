// api/index.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---

// 1. ✅ Configuration CORS mise à jour pour Azure
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://4.233.208.186',                // Ton Frontend Azure (IP publique)
        'https://sama-docteur.vercel.app'      // Gardé au cas où
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- ROUTES ---

// Route de santé pour vérifier que l'API répond
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Serveur Sama Docteur opérationnel sur Azure !",
        env: process.env.NODE_ENV
    });
});

app.use("/api/auth", authRoutes);

// Gestion 404 propre
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée sur le serveur." });
});

// --- LANCEMENT ---
// ✅ Correction : On lance le serveur sur le port 8000 pour Docker/Azure
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVEUR LANCÉ : Port ${PORT}`);
});

// Export pour compatibilité éventuelle
module.exports = app;