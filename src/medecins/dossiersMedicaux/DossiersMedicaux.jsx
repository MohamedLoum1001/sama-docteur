// src/pages/DossiersMedicaux.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./DossiersMedicaux.css";

const DossiersMedicaux = () => {
  return (
    <div className="container-fluid">
      {/* Bouton retour */}
      <div className="row ms-5 py-4">
        <div className="mb-0 flex items-start">
          <Link to="/home-medecin" className="btn btn-custom rounded-pill">
            <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Message de succès */}
      <div className="container mt-4">
        <div className="alert alert-success text-center" role="alert">
          <h4 className="alert-heading">✅ Success</h4>
          <hr />
          <p className="mb-0">
            Votre fonctionnalité "dossiers médicaux" est opérationnelle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DossiersMedicaux;
