// src/patients/PaiementTicket/PaiementTicket.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Import corrigé
import "./PaiementTicket.css";

const PaiementTicket = ({ doctorName, doctorSpecialty, appointmentDate, appointmentTime }) => {
  const navigate = useNavigate();

  const [payment, setPayment] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (payment.cardNumber && payment.expiryDate && payment.cvv) {
      setPaymentSuccess(true);
      setPaymentError(false);

      const ticket = {
        id: Date.now(),
        doctorName,
        doctorSpecialty,
        date: appointmentDate,
        time: appointmentTime,
        cardNumber: payment.cardNumber.replace(/\d(?=\d{4})/g, "*"),
      };

      setLastTicket(ticket);

      // Réinitialiser le formulaire
      setPayment({ cardNumber: "", expiryDate: "", cvv: "" });

      // Ici tu peux appeler ton API pour envoyer le ticket par SMS/email
      sendTicket(ticket);
    } else {
      setPaymentError(true);
      setPaymentSuccess(false);
    }
  };

  const sendTicket = (ticket) => {
    console.log("Envoi du ticket au patient :", ticket);
    alert("Le ticket a été envoyé sur votre téléphone/email ✅");
  };

  return (
    <div className="container mt-5 py-2">
      {/* Bouton retour */}
      <button
        className="btn custom-btn mb-3 d-flex align-items-center rounded-pill"
        onClick={() => navigate("/home-patient")}
      >
        <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
      </button>

      <h2 className="text-center mb-4">🎟️ Acheter et payer votre ticket</h2>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4 rounded-3">
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="cardNumber" className="form-label">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  className="form-control rounded-pill"
                  placeholder="Entrez votre numéro de carte"
                  value={payment.cardNumber}
                  onChange={(e) =>
                    setPayment({ ...payment, cardNumber: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="expiryDate" className="form-label">
                  Date d'expiration
                </label>
                <input
                  type="month"
                  id="expiryDate"
                  className="form-control rounded-pill"
                  value={payment.expiryDate}
                  onChange={(e) =>
                    setPayment({ ...payment, expiryDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="cvv" className="form-label">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  className="form-control rounded-pill"
                  placeholder="Entrez le code CVV"
                  value={payment.cvv}
                  onChange={(e) =>
                    setPayment({ ...payment, cvv: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="amount" className="form-label">
                  Montant à payer
                </label>
                <input
                  type="text"
                  id="amount"
                  className="form-control rounded-pill"
                  value="50"
                  disabled
                />
              </div>

              <button
                type="submit"
                className="btn custom-btn w-100 mt-3 rounded-pill"
              >
                💳 Payer
              </button>
            </form>

            {paymentSuccess && (
              <div className="alert alert-success mt-3">
                Le paiement a été effectué avec succès !
              </div>
            )}
            {paymentError && (
              <div className="alert alert-danger mt-3">
                Une erreur est survenue lors du paiement. Veuillez réessayer.
              </div>
            )}
          </div>

          {/* Affichage du ticket avec QR code */}
          {lastTicket && (
            <div className="card shadow mt-4 p-4 rounded-3 text-center">
              <h5 className="text-primary mb-3">🎫 Votre ticket</h5>
              <p>Médecin : {lastTicket.doctorName}</p>
              <p>Spécialité : {lastTicket.doctorSpecialty}</p>
              <p>Date : {lastTicket.date}</p>
              <p>Heure : {lastTicket.time}</p>
              <p>Carte : {lastTicket.cardNumber}</p>

              <div className="mt-3">
                <QRCodeCanvas
                  value={JSON.stringify(lastTicket)}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="mt-2 text-muted">
                Scannez ce QR code pour récupérer votre ticket
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaiementTicket;
