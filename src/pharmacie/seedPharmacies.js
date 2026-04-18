import { db } from "./firebase"; // Vérifie bien le chemin vers ton fichier firebase.js
import { collection, addDoc, GeoPoint } from "firebase/firestore";

const pharmaciesData = [
    { nom: "Pharmacie de la Nation", adresse: "Place de l'Indépendance", lat: 14.6677, lng: -17.4331 },
    { nom: "Pharmacie Keur Gorgui", adresse: "Sacré Cœur 3", lat: 14.7111, lng: -17.4722 },
    { nom: "Pharmacie de la Corniche", adresse: "Fann Résidence", lat: 14.6944, lng: -17.4750 },
    { nom: "Pharmacie Serigne Fallou", adresse: "Touba Sandaga", lat: 14.6722, lng: -17.4389 },
    // ... Imagine ici 50 entrées avec des coordonnées variées
];

const medicamentsTest = [
    { nom: "Paracétamol", prix: 1200 },
    { nom: "Efferalgan", prix: 1550 },
    { nom: "Amoxicilline", prix: 2400 },
    { nom: "Doliprane", prix: 1100 },
    { nom: "Ibuprofène", prix: 1800 }
];

export const seedPharmacies = async () => {
    console.log("🚀 Début de l'injection nationale...");

    for (let i = 1; i <= 50; i++) {
        // On génère des coordonnées légèrement aléatoires autour de Dakar pour simuler un réseau
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;

        const pharma = {
            nom: `Pharmacie Nationale n°${i}`,
            adresse: `${Math.floor(Math.random() * 100)} Rue du Commerce, Dakar`,
            coordonnees: new GeoPoint(14.6922 + latOffset, -17.4483 + lngOffset),
            // On donne à chaque pharmacie 3 médicaments aléatoires parmi notre liste
            stock: medicamentsTest.sort(() => 0.5 - Math.random()).slice(0, 3)
        };

        try {
            await addDoc(collection(db, "pharmacies"), pharma);
            console.log(`✅ ${pharma.nom} ajoutée !`);
        } catch (e) {
            console.error("Erreur : ", e);
        }
    }
    console.log("✨ Injection terminée. Ton système national est prêt !");
};