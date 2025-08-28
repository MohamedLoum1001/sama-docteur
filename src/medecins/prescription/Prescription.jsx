// src/pages/Prescription.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Prescription = () => {
  const navigate = useNavigate();

  // State du formulaire
  const [formData, setFormData] = useState({
    patientName: "",
    medicaments: "",
    instructions: "",
  });

  // Gestion du changement des inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion de la soumission du formulaire
  const envoyerOrdonnance = (e) => {
    e.preventDefault();

    const { patientName, medicaments, instructions } = formData;

    if (!patientName || !medicaments || !instructions) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    console.log("Ordonnance envoyée au patient :", formData);
    alert(`Ordonnance envoyée à ${patientName}`);

    // Réinitialiser le formulaire
    setFormData({
      patientName: "",
      medicaments: "",
      instructions: "",
    });
  };

  return (
    <div className="container py-4">
      {/* Bouton retour */}
      <div className="mb-0 flex items-start">
        <button
          className="btn btn-custom rounded-pill"
          onClick={() => navigate("/home-medecin")}
        >
          <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
        </button>
      </div>

      <h3 className="text-center text-primary mb-3">
        📄 Prescrire une ordonnance électronique
      </h3>

      <form onSubmit={envoyerOrdonnance}>
        <div className="mb-0">
          <label className="form-label text-start w-100">Nom du patient</label>
          <input
            type="text"
            className="form-control rounded-pill"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Entrez le nom du patient"
          />
        </div>

        <div className="mb-0">
          <label className="form-label text-start w-100">Médicaments prescrits</label>
          <textarea
            className="form-control"
            rows="4"
            name="medicaments"
            value={formData.medicaments}
            onChange={handleChange}
            placeholder="Liste des médicaments prescrits"
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label text-start w-100">Instructions</label>
          <textarea
            className="form-control"
            rows="3"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Instructions supplémentaires"
          ></textarea>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-custom w-100 shadow-sm">
            <i className="bi bi-send"></i> Envoyer l’ordonnance
          </button>
        </div>
      </form>
    </div>
  );
};

export default Prescription;
