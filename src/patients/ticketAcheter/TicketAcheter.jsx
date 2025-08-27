// src/patients/TicketAcheter/TicketAcheter.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./TicketAcheter.css";

const TicketAcheter = () => {
  const navigate = useNavigate();

  // Ici on simule la récupération des tickets depuis un backend ou localStorage
  const [tickets, setTickets] = useState([]);

  // Exemple : récupérer les tickets depuis localStorage au chargement
  useEffect(() => {
    const savedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    setTickets(savedTickets);
  }, []);

  return (
    <div className="container mt-5 py-2">
      {/* Bouton retour */}
      <button
        className="btn custom-btn mb-3 d-flex align-items-center rounded-pill"
        onClick={() => navigate("/home-patient")}
      >
        <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
      </button>

      <h2 className="text-center mb-4">🎟️ Mes tickets achetés</h2>

      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="card shadow mt-4 p-4 rounded-3 text-center"
          >
            <h5 className="text-primary mb-3">🎫 Ticket #{ticket.id}</h5>
            <p>Médecin : {ticket.doctorName}</p>
            <p>Spécialité : {ticket.doctorSpecialty}</p>
            <p>Date : {ticket.date}</p>
            <p>Heure : {ticket.time}</p>
            <p>Carte : {ticket.cardNumber}</p>

            <div className="mt-3">
              <QRCodeCanvas
                value={JSON.stringify(ticket)}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="mt-2 text-muted">
              Scannez ce QR code pour récupérer votre ticket
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-muted mt-4">
          Vous n'avez encore aucun ticket acheté.
        </p>
      )}
    </div>
  );
};

export default TicketAcheter;
