// src/medecin/ProfilMedecin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilMedecin = () => {
  const navigate = useNavigate();

  // État du médecin (infos personnelles + horaires)
  const [medecin, setMedecin] = useState({
    nom: "Dr Loum",
    specialite: "Cardiologue",
    email: "dr.loum@example.com",
    telephone: "0600000000",
    horaires: [
      { jour: "Lundi", heureDebut: "08:00", heureFin: "12:00" },
      { jour: "Mercredi", heureDebut: "14:00", heureFin: "18:00" },
    ],
  });

  // Nouveau horaire en cours d'ajout
  const [nouveauHoraire, setNouveauHoraire] = useState({
    jour: "",
    heureDebut: "",
    heureFin: "",
  });

  const joursDisponibles = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  // Navigation retour
  const goBack = () => {
    navigate("/home-medecin");
  };

  // Gestion de la mise à jour du formulaire profil
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedecin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Profil mis à jour avec succès !");
  };

  // Gestion horaires
  const ajouterHoraire = () => {
    if (
      nouveauHoraire.jour &&
      nouveauHoraire.heureDebut &&
      nouveauHoraire.heureFin
    ) {
      setMedecin((prev) => ({
        ...prev,
        horaires: [...prev.horaires, nouveauHoraire],
      }));
      setNouveauHoraire({ jour: "", heureDebut: "", heureFin: "" });
    }
  };

  const supprimerHoraire = (index) => {
    setMedecin((prev) => ({
      ...prev,
      horaires: prev.horaires.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="container py-4">
      {/* Bouton retour */}
      <div className="mb-0 flex items-start">
        <button className="btn btn-custom rounded-pill" onClick={goBack}>
          <i className="bi bi-arrow-left me-2"></i>Retour à l'accueil
        </button>
      </div>

      {/* Titre */}
      <h2 className="text-center fw-bold text-primary mb-4">
        👨‍⚕️ Profil Médecin
      </h2>

      {/* Informations personnelles */}
      <div className="card shadow-lg border-0 rounded-4 mb-5">
        <div className="card-body">
          <h5 className="card-title text-secondary fw-bold mb-3">
            📋 Informations personnelles
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-left w-100">Nom</label>
              <input
                type="text"
                name="nom"
                className="form-control rounded-pill"
                value={medecin.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-left w-100">Spécialité</label>
              <input
                type="text"
                name="specialite"
                className="form-control rounded-pill"
                value={medecin.specialite}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-left w-100">Email</label>
              <input
                type="email"
                name="email"
                className="form-control rounded-pill"
                value={medecin.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-left w-100">Téléphone</label>
              <input
                type="text"
                name="telephone"
                className="form-control rounded-pill"
                value={medecin.telephone}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-custom rounded-pill mt-2">
              💾 Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>

      {/* Disponibilités */}
      <div className="card shadow-lg border-0 rounded-4 mb-5">
        <div className="card-body">
          <h5 className="card-title text-secondary fw-bold mb-3">
            🗓️ Disponibilités
          </h5>

          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>📅 Jour</th>
                <th>🕒 Heure Début</th>
                <th>🕒 Heure Fin</th>
                <th>🛠️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {medecin.horaires.map((horaire, i) => (
                <tr key={i}>
                  <td>{horaire.jour}</td>
                  <td>{horaire.heureDebut}</td>
                  <td>{horaire.heureFin}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill"
                      onClick={() => supprimerHoraire(i)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h6 className="mt-4 fw-semibold">➕ Ajouter un nouvel horaire</h6>
          <div className="row g-3 align-items-center mt-2">
            <div className="col-md-3">
              <select
                className="form-select rounded-3"
                value={nouveauHoraire.jour}
                onChange={(e) =>
                  setNouveauHoraire({ ...nouveauHoraire, jour: e.target.value })
                }
              >
                <option value="">Jour</option>
                {joursDisponibles.map((jour) => (
                  <option key={jour} value={jour}>
                    {jour}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="time"
                className="form-control rounded-3"
                value={nouveauHoraire.heureDebut}
                onChange={(e) =>
                  setNouveauHoraire({
                    ...nouveauHoraire,
                    heureDebut: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-3">
              <input
                type="time"
                className="form-control rounded-3"
                value={nouveauHoraire.heureFin}
                onChange={(e) =>
                  setNouveauHoraire({
                    ...nouveauHoraire,
                    heureFin: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-custom mt-3 rounded-pill w-100"
                type="button"
                onClick={ajouterHoraire}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilMedecin;
