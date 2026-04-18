// api/index.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

// --- MIDDLEWARES ---

// 1. ✅ Configuration CORS (Gère déjà les requêtes OPTIONS par défaut)
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://sama-docteur.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. ❌ ON SUPPRIME app.options('/*', ...) qui fait crash Vercel
// Le middleware au-dessus s'occupe déjà de répondre aux navigateurs.

app.use(express.json());

// --- ROUTES ---

// Route de santé pour vérifier que l'API répond
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Serveur Sama Docteur opérationnel !" });
});

app.use("/api/auth", authRoutes);

// Gestion 404 propre
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée sur le serveur." });
});

// --- LANCEMENT (Local uniquement) ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 SERVEUR LANCÉ : http://localhost:${PORT}`);
    });
}

// 🚀 EXPORT POUR VERCEL
module.exports = app;