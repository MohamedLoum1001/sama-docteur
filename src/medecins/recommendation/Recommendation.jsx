// src/pages/Recommandations.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Recommendation.css";

const Recommandation = () => {
  const [recommandations, setRecommandations] = useState("");

  const submitRecommandation = () => {
    if (recommandations.trim() !== "") {
      // Ici tu pourrais envoyer au backend via fetch ou axios
      alert("Recommandation enregistrée avec succès.");
      setRecommandations(""); // reset champ
    } else {
      alert("Veuillez saisir une recommandation.");
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
          >
            <i className="bi bi-send"></i> Envoyer la recommandation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommandation;
