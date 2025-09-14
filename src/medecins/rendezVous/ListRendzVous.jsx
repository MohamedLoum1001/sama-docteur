// src/medecins/ListeRendezVous.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "./ListRendezVous.css";

const ListeRendezVous = () => {
  const [rendezVousList, setRendezVousList] = useState([]);

  // Action: Confirmer
  const confirmerRdv = (id) => {
    setRendezVousList((prev) =>
      prev.map((rdv) =>
        rdv.id === id ? { ...rdv, statut: "Confirmé" } : rdv
      )
    );
  };

  // Action: Annuler
  const annulerRdv = (id) => {
    setRendezVousList((prev) =>
      prev.map((rdv) =>
        rdv.id === id ? { ...rdv, statut: "Annulé" } : rdv
      )
    );
  };

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

      {/* Message ou tableau selon la liste */}
      {rendezVousList.length === 0 ? (
        <div className="alert alert-info text-center mt-5">
          Vous n'avez pas de rendez-vous avec aucun patient.
        </div>
      ) : (
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
                    <th>Actions</th>
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
                      <td>
                        {rdv.statut === "En attente" && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => confirmerRdv(rdv.id)}
                            >
                              Confirmer
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => annulerRdv(rdv.id)}
                            >
                              Annuler
                            </button>
                          </>
                        )}
                        {rdv.statut === "Confirmé" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => annulerRdv(rdv.id)}
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeRendezVous;
