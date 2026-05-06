import { db } from "../firebase";
import { collection, addDoc, GeoPoint } from "firebase/firestore";

const medicamentsTest = [
    { nom: "Paracétamol", prix: 1000 },
    { nom: "Efferalgan", prix: 1500 },
    { nom: "Amoxicilline", prix: 2500 },
    { nom: "Doliprane", prix: 1200 },
    { nom: "Ibuprofène", prix: 1800 },
    { nom: "Spasfon", prix: 2100 },
    { nom: "Gaviscon", prix: 3000 }
];

const quartiers = ["Plateau", "Médina", "Ouakam", "Almadies", "Yoff", "Grand Yoff", "Pikine", "Guédiawaye", "Parcelles Assainies"];

export const injectNationalData = async () => {
    console.log("⏳ Initialisation du réseau national...");
    const pharmaRef = collection(db, "pharmacies");

    for (let i = 1; i <= 50; i++) {
        // Génère des coordonnées aléatoires dans un rayon de ~15km autour de Dakar
        const lat = 14.6927 + (Math.random() - 0.5) * 0.15;
        const lng = -17.4467 + (Math.random() - 0.5) * 0.15;

        const pharma = {
            nom: `Pharmacie Nationale - ${quartiers[Math.floor(Math.random() * quartiers.length)]} n°${i}`,
            adresse: `${Math.floor(Math.random() * 500)} Boulevard de la République`,
            coordonnees: new GeoPoint(lat, lng),
            // On sélectionne 4 médicaments aléatoires pour chaque pharmacie
            stock: medicamentsTest.sort(() => 0.5 - Math.random()).slice(0, 4)
        };

        try {
            await addDoc(pharmaRef, pharma);
            console.log(`✅ [${i}/50] ${pharma.nom} ajoutée au système.`);
        } catch (error) {
            console.error(`❌ Erreur pour ${pharma.nom}:`, error);
        }
    }
    alert("🚀 Système National Injecté avec succès ! 50 pharmacies sont en ligne.");
};