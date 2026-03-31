const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
// Très important pour autoriser ton application React
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));