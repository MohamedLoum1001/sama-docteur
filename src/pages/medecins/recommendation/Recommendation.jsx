// src/pages/Recommandations.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import "./Recommendation.css";

const Recommandation = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [recommandations, setRecommandations] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger les patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "patient")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(data);
      } catch (error) {
        console.error("Erreur récupération patients :", error);
      }
    };

    fetchPatients();
  }, []);

  const submitRecommandation = async () => {
    if (!selectedPatient) {
      alert("⚠️ Veuillez sélectionner un patient.");
      return;
    }

    if (recommandations.trim() === "") {
      alert("⚠️ Veuillez saisir une recommandation.");
      return;
    }

    try {
      setLoading(true);

      // Ajout dans la sous-collection recommandations du patient sélectionné
      await addDoc(
        collection(db, "patients", selectedPatient, "recommandations"),
        {
          message: recommandations,
          createdAt: serverTimestamp(),
        }
      );

      alert("✅ Recommandation envoyée avec succès.");
      setRecommandations("");
      setSelectedPatient("");
    } catch (error) {
      console.error("Erreur enregistrement recommandation:", error);
      alert("❌ Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Bouton retour */}
      <div className="row ms-5 py-4">
        <div className="mb-2">
          <Link to="/home-medecin" className="btn btn-custom rounded-pill">
            <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Titre */}
      <div className="container">
        <h4 className="text-center text-primary mb-4">
          📝 Recommandations médicales post-consultation
        </h4>

        {/* Select Patient */}
        <div className="form-group mb-3">
          <label htmlFor="patientSelect" className="form-label text-start w-100">
            Sélectionner un patient :
          </label>
          <select
            id="patientSelect"
            className="form-control"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="">-- Choisir un patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom} ({p.email})
              </option>
            ))}
          </select>
        </div>

        {/* Zone de texte */}
        <div className="form-group mt-3">
          <label htmlFor="recommandation" className="form-label text-start w-100">
            Message pour le patient :
          </label>
          <textarea
            id="recommandation"
            className="form-control"
            rows="4"
            value={recommandations}
            onChange={(e) => setRecommandations(e.target.value)}
            placeholder="Ex: Pensez à bien vous hydrater et à surveiller votre tension."
          ></textarea>
        </div>

        {/* Bouton envoi */}
        <div className="text-center mt-4">
          <button
            className="btn btn-custom shadow-sm w-100"
            onClick={submitRecommandation}
            disabled={loading}
          >
            {loading ? (
              <span>
                <i className="bi bi-hourglass-split"></i> Enregistrement...
              </span>
            ) : (
              <span>
                <i className="bi bi-send"></i> Envoyer la recommandation
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommandation;
