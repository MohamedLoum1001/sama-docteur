// src/patients/TicketAcheter/TicketAcheter.jsx
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

            {ticket.patientName && (
              <p>
                <strong>Patient :</strong> {ticket.patientName}
              </p>
            )}

            {/* 🔹 Date */}
            {editingTicketId === ticket.id ? (
              <div className="mb-2">
                <strong>Date :</strong>
                <input
                  type="date"
                  className="form-control d-inline-block w-auto ms-2"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <button
                  className="btn btn-success btn-sm ms-2"
                  onClick={() => handleEditDate(ticket.id)}
                >
                  Valider
                </button>
                <button
                  className="btn btn-secondary btn-sm ms-2"
                  onClick={() => {
                    setEditingTicketId(null);
                    setNewDate("");
                  }}
                >
                  Annuler
                </button>
              </div>
            ) : (
              <p>
                <strong>Date :</strong> {ticket.date || "Non renseignée"}
                <button
                  className="btn btn-warning btn-sm ms-2"
                  onClick={() => {
                    setEditingTicketId(ticket.id);
                    setNewDate("");
                  }}
                >
                  Modifier
                </button>
              </p>
            )}

            {/* 🔹 Heure */}
            {editingTimeTicketId === ticket.id ? (
              <div className="mb-2">
                <strong>Heure :</strong>
                <input
                  type="time"
                  className="form-control d-inline-block w-auto ms-2"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <button
                  className="btn btn-success btn-sm ms-2"
                  onClick={() => handleEditTime(ticket.id)}
                >
                  Valider
                </button>
                <button
                  className="btn btn-secondary btn-sm ms-2"
                  onClick={() => {
                    setEditingTimeTicketId(null);
                    setNewTime("");
                  }}
                >
                  Annuler
                </button>
              </div>
            ) : (
              <p>
                <strong>Heure :</strong> {ticket.time || "Non renseignée"}
                <button
                  className="btn btn-warning btn-sm ms-2"
                  onClick={() => {
                    setEditingTimeTicketId(ticket.id);
                    setNewTime("");
                  }}
                >
                  Modifier
                </button>
              </p>
            )}

            {/* 🔹 Infos médecin */}
            {ticket.doctorName && (
              <p>
                <strong>Médecin :</strong> {ticket.doctorName}
              </p>
            )}
            {ticket.doctorSpecialty && (
              <p>
                <strong>Spécialité :</strong> {ticket.doctorSpecialty}
              </p>
            )}

            {/* 🔹 Autres infos */}
            {ticket.createdAt && (
              <p>
                <strong>Créé le :</strong> {ticket.createdAt}
              </p>
            )}
            {ticket.prix && (
              <p>
                <strong>Prix :</strong> {ticket.prix} €
              </p>
            )}
            {ticket.cardNumber && (
              <p>
                <strong>Carte :</strong> {ticket.cardNumber}
              </p>
            )}
            {ticket.statutPaiement && (
              <p>
                <strong>Paiement :</strong> {ticket.statutPaiement}
              </p>
            )}

            {/* 🔹 QR Code */}
            <div className="mt-3">
              <QRCodeCanvas
                value={JSON.stringify(ticket)}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* 🔹 Bouton annulation */}
            <button
              className="btn btn-danger mt-3 rounded-pill"
              onClick={() => handleCancelTicket(ticket.id)}
            >
              Annuler le rendez-vous
            </button>

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
