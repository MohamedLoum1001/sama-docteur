import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { db, auth } from "../../../firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { FaCalendarAlt, FaStethoscope, FaMapMarkerAlt, FaQrcode, FaArrowLeft } from "react-icons/fa";
// ✅ Importation du composant réutilisable
import Button from "../../../components/boutons/Button";
import "./TicketAcheter.css";

const TicketAcheter = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchTickets();
    });

    const fetchTickets = async () => {
      try {
        console.log("Tentative de récupération globale des tickets...");
        const q = query(collection(db, "tickets"));
        const querySnapshot = await getDocs(q);
        const ticketsList = [];
        querySnapshot.forEach((docSnap) => {
          ticketsList.push({ id: docSnap.id, ...docSnap.data() });
        });

        console.log("Tickets récupérés :", ticketsList.length);
        setTickets(ticketsList);
      } catch (error) {
        console.error("Erreur lors du test de récupération :", error);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  const formatDateFR = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="history-container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-bold text-secondary">Test de récupération en cours...</p>
      </div>
    );
  }

  return (
    <div className="history-container mt-4">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate("/patient")}>
          <FaArrowLeft />
        </button>
        <h1>Historique des tickets</h1>
      </div>

      <div className="tickets-list">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card-slim">
              <div className="ticket-date-side">
                <span className="day-num">
                  {ticket.date ? new Date(ticket.date).getDate() : "--"}
                </span>
                <span className="month-name">
                  {ticket.date
                    ? new Date(ticket.date).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")
                    : "---"}
                </span>
              </div>

              <div className="ticket-info-main">
                <div className="status-row">
                  {/* ✅ Application de la couleur #00a5a8 sur le statut payé */}
                  <span
                    className={`status-badge ${ticket.statutPaiement === "payé" ? "paid" : "pending"}`}
                    style={ticket.statutPaiement === "payé" ? { backgroundColor: "#00a5a8", color: "#fff" } : {}}
                  >
                    {ticket.statutPaiement === "payé" ? "Paiement confirmé" : "En attente"}
                  </span>
                  <span className="ticket-time">{ticket.time}</span>
                </div>

                <h3 className="doctor-name">Dr {ticket.doctorName}</h3>
                <p className="specialty-text">
                  <FaStethoscope className="me-1" /> {ticket.doctorSpecialty}
                </p>
                <p className="location-text">
                  <FaMapMarkerAlt className="me-1" /> Cabinet Médical (ID Patient: {ticket.patientId})
                </p>

                <div className="ticket-actions">
                  <Button
                    variant="login"
                    onClick={() => setSelectedTicket(ticket)}
                    label={
                      <>
                        <FaQrcode className="me-2" /> Voir mon ticket
                      </>
                    }
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FaCalendarAlt size={50} color="#ccc" />
            <p>La collection "tickets" semble vide dans Firestore.</p>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {selectedTicket && (
        <div className="qr-modal-overlay mt-5" onClick={() => setSelectedTicket(null)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedTicket(null)}>&times;</button>
            <h4>Ticket de Test</h4>
            <div className="qr-box">
              <QRCodeCanvas value={JSON.stringify(selectedTicket)} size={200} />
            </div>
            <div className="qr-details">
              <h5>Dr {selectedTicket.doctorName}</h5>
              <p>{formatDateFR(selectedTicket.date)} à {selectedTicket.time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketAcheter;