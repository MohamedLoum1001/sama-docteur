// src/patients/TicketAcheter/TicketAcheter.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./TicketAcheter.css";

const TicketAcheter = () => {
  const navigate = useNavigate();

  // Récupère les tickets achetés par le patient depuis Firestore
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, "tickets"), where("patientId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const ticketsList = [];
        querySnapshot.forEach((doc) => {
          ticketsList.push({ id: doc.id, ...doc.data() });
        });
        setTickets(ticketsList);
      } catch (error) {
        setTickets([]);
      }
    };
    fetchTickets();
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
            {ticket.patientName && ticket.patientName !== "" && (
              <p><strong>Prénom et Nom du Patient :</strong> {ticket.patientName}</p>
            )}
            {ticket.date && ticket.date !== "Date non renseignée" && (
              <p><strong>Date :</strong> {ticket.date}</p>
            )}
            {ticket.time && ticket.time !== "Heure non renseignée" && (
              <p><strong>Heure :</strong> {ticket.time}</p>
            )}
            {ticket.doctorName && ticket.doctorName !== "Médecin inconnu" && (
              <p><strong>Nom du docteur :</strong> {ticket.doctorName}</p>
            )}
            {ticket.doctorSpecialty && ticket.doctorSpecialty !== "Spécialité inconnue" && (
              <p><strong>Spécialité :</strong> {ticket.doctorSpecialty}</p>
            )}
            {ticket.createdAt && (
              <p><strong>createdAt :</strong> {ticket.createdAt}</p>
            )}
            {ticket.prix && (
              <p><strong>Prix :</strong> {ticket.prix} €</p>
            )}
            {ticket.cardNumber && (
              <p><strong>Carte :</strong> {ticket.cardNumber}</p>
            )}
            {ticket.statutPaiement && (
              <p><strong>Statut paiement :</strong> {ticket.statutPaiement}</p>
            )}
            {ticket.qrCodeUrl && (
              <p><strong>QR Code :</strong> <a href={ticket.qrCodeUrl} target="_blank" rel="noopener noreferrer">Voir</a></p>
            )}

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
