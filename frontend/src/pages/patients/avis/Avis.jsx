import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Avis.css";


function Avis() {
  const navigate = useNavigate();

  // State du formulaire
  const [formData, setFormData] = useState({
    note: "",
    commentaire: "",
  });

  // State des erreurs
  const [errors, setErrors] = useState({});
  const [avisSubmitted, setAvisSubmitted] = useState(false);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.note) {
      newErrors.note = "La note est obligatoire.";
    } else if (formData.note < 1) {
      newErrors.note = "La note doit être au moins 1.";
    } else if (formData.note > 5) {
      newErrors.note = "La note ne peut pas dépasser 5.";
    }

    if (!formData.commentaire) {
      newErrors.commentaire = "Le commentaire est obligatoire.";
    } else if (formData.commentaire.length < 5) {
      newErrors.commentaire = "Minimum 5 caractères requis.";
    }

    return newErrors;
  };

  // Gestion du changement des champs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log("Avis soumis:", formData);
      setAvisSubmitted(true);
    }
  };

  return (
    <div className="container mt-4">
      {/* Bouton retour */}
      <div className="mb-0 d-flex align-items-start">
        <button
          onClick={() => navigate("/home-patient")}
          className="custom-btn gap-2 px-4 py-2 rounded-pill"
        >
          <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
        </button>
      </div>

      <h2 className="text-center text-primary mb-4">
        Laisser un avis et une note sur le médecin
      </h2>

      <form onSubmit={handleSubmit} className="shadow-sm p-4 rounded bg-white">
        {/* Note */}
        <div className="mb-3">
          <label htmlFor="note" className="form-label fw-bold">
            Note (1 à 5)
          </label>
          <input
            type="number"
            id="note"
            className="form-control"
            min="1"
            max="5"
            value={formData.note}
            onChange={handleChange}
          />
          {errors.note && (
            <div className="text-danger mt-1 small">{errors.note}</div>
          )}
        </div>

        {/* Commentaire */}
        <div className="mb-3">
          <label htmlFor="commentaire" className="form-label fw-bold">
            Commentaire
          </label>
          <textarea
            id="commentaire"
            className="form-control"
            rows="4"
            placeholder="Partagez votre expérience..."
            value={formData.commentaire}
            onChange={handleChange}
          ></textarea>
          {errors.commentaire && (
            <div className="text-danger mt-1 small">{errors.commentaire}</div>
          )}
        </div>

        {/* Bouton */}
        <button type="submit" className="custom-btn w-100 gap-2 px-4 py-2 rounded-pill">
          <i className="bi bi-send me-1"></i> Envoyer mon avis
        </button>
      </form>

      {/* Message succès */}
      {avisSubmitted && (
        <div className="alert alert-success mt-4 text-center">
          Merci pour votre avis !
        </div>
      )}
    </div>
  );
}

export default Avis;
