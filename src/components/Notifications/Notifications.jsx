// src/patients/notifications/Notifications.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  // Notifications (state)
  const [notifications] = useState([
    {
      titre: "Votre rendez-vous est confirmé pour demain à 10h",
      date: new Date(),
      type: "success",
    },
    {
      titre: "Nouvelle mise à jour de l’application disponible",
      date: new Date(),
      type: "info",
    },
    {
      titre: "Paiement en attente pour votre ticket de consultation",
      date: new Date(),
      type: "warning",
    },
    {
      titre: "Erreur de paiement détectée",
      date: new Date(),
      type: "error",
    },
  ]);

  // Format de date simple (équivalent Angular date:'short')
  const formatDate = (date) =>
    new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Mapping type -> couleur Bootstrap
  const getBadgeClass = (type) => {
    switch (type) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-danger";
      case "info":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container mt-5 py-4">
      {/* Bouton retour */}
      <button
        className="btn custom-btn mb-4 d-flex align-items-center rounded-pill"
        onClick={() => navigate("/home-patient")}
      >
        <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
      </button>

      <h2 className="text-center mb-4">🔔 Notifications</h2>

      {notifications.length > 0 ? (
        <ul className="list-group shadow">
          {notifications.map((notif, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h6 className="mb-1">{notif.titre}</h6>
                <small className="text-muted">{formatDate(notif.date)}</small>
              </div>
              <span className={`badge ${getBadgeClass(notif.type)}`}>
                {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="alert alert-info text-center mt-5">
          😴 Vous n'avez aucune notification pour le moment.
        </div>
      )}
    </div>
  );
};

export default Notifications;
