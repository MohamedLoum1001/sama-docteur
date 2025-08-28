// src/medecins/ListeRendezVous.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./ListRendezVous.css";

const ListeRendezVous = () => {
  const rendezVousList = [
    {
      id: 1,
      patient: "Alice Dupuis",
      date: new Date("2025-05-08T10:00:00"),
      motif: "Suivi cardiaque",
      statut: "Confirmé",
    },
    {
      id: 2,
      patient: "Marc Dubois",
      date: new Date("2025-05-10T14:00:00"),
      motif: "Bilan général",
      statut: "En attente",
    },
    {
      id: 3,
      patient: "Sophie Bernard",
      date: new Date("2025-05-12T09:30:00"),
      motif: "Consultation post-opératoire",
      statut: "Confirmé",
    },
  ];

  // Format date en français
  const formatDate = (date) => {
    return new Date(date).toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Détermine la classe bootstrap en fonction du statut
  const getStatusClass = (statut) => {
    if (statut === "Confirmé") return "badge bg-success rounded-pill px-3 py-2";
    if (statut === "En attente")
      return "badge bg-warning text-dark rounded-pill px-3 py-2";
    return "badge bg-secondary rounded-pill px-3 py-2";
  };

  return (
    <div className="container py-4">
      {/* Bouton retour */}
      <div className="mb-0 flex items-start">
        <Link to="/home-medecin" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i>Retour à l'accueil
        </Link>
      </div>

      {/* Titre */}
      <h2 className="text-center text-primary fw-bold mb-4">
        📅 Mes Rendez-vous Programmés
      </h2>

      {/* Tableau */}
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>👤 Patient</th>
                  <th>🗓️ Date & Heure</th>
                  <th>📝 Motif</th>
                  <th>📌 Statut</th>
                </tr>
              </thead>
              <tbody>
                {rendezVousList.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{rdv.patient}</td>
                    <td>{formatDate(rdv.date)}</td>
                    <td>{rdv.motif}</td>
                    <td>
                      <span className={getStatusClass(rdv.statut)}>
                        {rdv.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeRendezVous;
