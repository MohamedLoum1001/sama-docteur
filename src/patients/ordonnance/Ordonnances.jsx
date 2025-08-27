import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Ordonnance.css'

const Ordonnances = () => {
  const navigate = useNavigate();

  const [ordonnances] = useState([
    { id: 1, nom: "Ordonnance pour consultation", fichier: "ordonnance1.pdf" },
    { id: 2, nom: "Ordonnance pour examens", fichier: "ordonnance2.pdf" },
  ]);

  // Navigation vers la page d'accueil
  const homePatient = () => {
    navigate("/home-patient");
  };

  // Téléchargement du fichier
  const downloadOrdonnance = (fichier) => {
    const link = document.createElement("a");
    link.href = `/assets/ordonnances/${fichier}`; // Dossier public/assets
    link.download = fichier;
    link.click();
  };

  return (
    <div className="container mt-4 py-3">
      {/* Bouton retour */}
      <div className="mb-3">
        <button
          className="btn custom-btn mb-4 d-flex align-items-center rounded-pill"
          onClick={homePatient}
        >
          <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
        </button>
      </div>

      <h2 className="text-center mb-4">🧾 Mes Ordonnances</h2>

      {/* Message si aucune ordonnance */}
      {ordonnances.length === 0 ? (
        <div className="alert alert-info text-center">
          Vous n'avez aucune ordonnance disponible pour le moment.
        </div>
      ) : (
        // Liste des ordonnances
        ordonnances.map((ordonnance) => (
          <div key={ordonnance.id} className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title text-primary">
                <i className="bi bi-file-earmark-medical me-2"></i>
                {ordonnance.nom}
              </h5>
              <button
                className="btn custom-btn w-25 mt-3 rounded-pill text-white"
                onClick={() => downloadOrdonnance(ordonnance.fichier)}
              >
                <i className="bi bi-download me-1"></i> Télécharger l'ordonnance
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Ordonnances;
