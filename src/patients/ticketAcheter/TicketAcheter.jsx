
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import "./TicketAcheter.css";

// Format date FR
const formatDateFR = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const TicketAcheter = () => {
  const navigate = useNavigate();

  // États locaux
  const [tickets, setTickets] = useState([]);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [editingTimeTicketId, setEditingTimeTicketId] = useState(null);
  const [newTime, setNewTime] = useState("");

  // 🔹 Annuler un rendez-vous (supprime définitivement de Firestore)
  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?"))
      return;

    try {
      const ticketRef = doc(db, "tickets", ticketId);

      await deleteDoc(ticketRef); // suppression Firestore
      setTickets((prev) => prev.filter((t) => t.id !== ticketId)); // mise à jour UI

      alert("Le rendez-vous a bien été annulé ✅");
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      alert("Erreur lors de l'annulation du rendez-vous.");
    }
  };

  // 🔹 Modifier la date
  const handleEditDate = async (ticketId) => {
    if (!newDate) {
      alert("Veuillez choisir une nouvelle date.");
      return;
    }
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { date: newDate });

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, date: newDate } : t))
      );

      setEditingTicketId(null);
      setNewDate("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification de la date.");
    }
  };

  // 🔹 Modifier l’heure
  const handleEditTime = async (ticketId) => {
    if (!newTime) {
      alert("Veuillez choisir une nouvelle heure.");
      return;
    }
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { time: newTime });

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, time: newTime } : t))
      );

      setEditingTimeTicketId(null);
      setNewTime("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification de l'heure.");
    }
  };

  // 🔹 Récupérer les tickets du patient
  useEffect(() => {
    const fetchTickets = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "tickets"),
          where("patientId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const ticketsList = [];
        querySnapshot.forEach((docSnap) => {
          ticketsList.push({ id: docSnap.id, ...docSnap.data() });
        });

        setTickets(ticketsList);
      } catch (error) {
        console.error("Erreur lors du chargement des tickets :", error);
        setTickets([]);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="container mt-3">
      {/* Bouton retour */}
      <button
        className="btn custom-btn mb-3 d-flex align-items-center rounded-pill"
        onClick={() => navigate("/home-patient")}
      >
        <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
      </button>

      <h2 className="text-center mb-0">🎟️ Mes tickets achetés</h2>

      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="card shadow-lg mt-4 p-4 rounded-4 text-start border-0 position-relative"
            style={{ maxWidth: 500, margin: "0 auto" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="text-primary fw-bold mb-0">🎫 Ticket #{ticket.id}</h5>
              <span className={
                ticket.statutPaiement === "payé"
                  ? "badge bg-success rounded-pill px-3 py-2"
                  : "badge bg-danger rounded-pill px-3 py-2"
              }>
                {ticket.statutPaiement === "payé" ? "Payé" : "Non payé"}
              </span>
            </div>
            <hr />
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Patient :</span>
              <span className="ms-2">{ticket.patientName}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Médecin :</span>
              <span className="ms-2">{ticket.doctorName}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Spécialité :</span>
              <span className="ms-2">{ticket.doctorSpecialty}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Date :</span>
              <span className="ms-2">{formatDateFR(ticket.date)}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Heure :</span>
              <span className="ms-2">{ticket.time}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Prix :</span>
              <span className="ms-2">{ticket.prix} €</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Carte :</span>
              <span className="ms-2">{ticket.cardNumber}</span>
            </div>
            <div className="mb-2">
              <span className="fw-semibold text-secondary">Créé le :</span>
              <span className="ms-2">{ticket.createdAt}</span>
            </div>
            <div className="d-flex justify-content-center align-items-center mt-4">
              <QRCodeCanvas
                value={JSON.stringify(ticket)}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="mt-3 text-muted text-center">
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
