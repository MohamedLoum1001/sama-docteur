// src/pages/Recommandations.jsx
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./Recommendation.css";

const Recommandation = () => {
  const { id } = useParams(); // ID du patient
  const [recommandations, setRecommandations] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRecommandation = async () => {
    if (recommandations.trim() === "") {
      alert("Veuillez saisir une recommandation.");
      return;
    }

    try {
      setLoading(true);

      // Ajout dans la sous-collection recommandations du patient
      await addDoc(collection(db, "patients", id, "recommandations"), {
        message: recommandations,
        createdAt: serverTimestamp(),
      });

      alert("✅ Recommandation enregistrée avec succès.");
      setRecommandations(""); // reset champ
    } catch (error) {
      console.error("Erreur enregistrement recommandation:", error);
      alert("❌ Erreur lors de l'enregistrement. Réessayez.");
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

        {/* Zone de texte */}
        <div className="form-group mt-3">
          <label htmlFor="recommandation" className="form-label">
            Message pour le patient :
          </label>
          <textarea
            id="recommandation"
            className="form-control form-control-lg"
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
