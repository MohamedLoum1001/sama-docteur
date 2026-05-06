import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { FaArrowLeft, FaLock, FaCalendarCheck } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
// ✅ Importation du composant réutilisable
import Button from "../../../components/boutons/Button";
import "./PaiementTicket.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ doctorData, storedUser, displayDate, setPaymentSuccess, setLastTicket }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 50,
          patientName: `${storedUser.prenom} ${storedUser.nom}`,
          doctorName: doctorData.doctorName,
          date: doctorData.date,
          time: doctorData.time
        }),
      });

      if (!response.ok) throw new Error("Erreur serveur backend");
      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${storedUser.prenom} ${storedUser.nom}`,
            email: storedUser.email
          },
        },
      });

      if (result.error) {
        setErrorMsg(result.error.message);
        setIsProcessing(false);
      } else if (result.paymentIntent.status === "succeeded") {
        const ticketId = `TICK-${Date.now()}`;
        const ticketData = {
          id: ticketId,
          patientId: storedUser.uid || storedUser.id,
          patientName: `${storedUser.prenom} ${storedUser.nom}`,
          doctorName: doctorData.doctorName,
          doctorSpecialty: doctorData.specialty || "Généraliste",
          date: doctorData.date,
          time: doctorData.time,
          prix: 50,
          statutPaiement: "payé",
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "tickets", ticketId), ticketData);

        await addDoc(collection(db, "paiements"), {
          date: serverTimestamp(),
          methode: "Stripe / Carte",
          patientId: storedUser.uid || storedUser.id,
          prix: 50,
          statut: "réussi",
          ticketId: ticketId
        });

        setLastTicket(ticketData);
        setPaymentSuccess(true);
      }
    } catch (err) {
      setErrorMsg("Impossible de contacter le serveur de paiement.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="form-label fw-bold">Informations de carte bancaire</label>
      <div className="p-3 border rounded mb-3 bg-white shadow-sm">
        <CardElement options={{
          style: { base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } } },
          hidePostalCode: true
        }} />
      </div>

      {errorMsg && <div className="alert alert-danger py-2 small">{errorMsg}</div>}

      {/* ✅ Utilisation du composant Button pour le paiement */}
      <Button
        type="submit"
        label="Confirmer et payer 50 €"
        variant="login"
        loading={isProcessing}
        disabled={!stripe}
        className="w-100 mt-2"
      />

      <p className="security-note mt-3 text-center small text-muted">
        <FaLock size={12} className="me-1" /> Paiement 100% sécurisé via Stripe
      </p>
    </form>
  );
};

const PaiementTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorData = location.state || {};
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);

  const displayDate = (dateStr) => {
    if (!dateStr) return "Date non définie";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return "Date invalide"; }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="payment-page">
        <div className="container py-4">
          <button className="back-link" onClick={() => navigate("/patient")}>
            <FaArrowLeft className="me-2" /> Retour à l'accueil
          </button>

          <div className="row mt-4">
            <div className="col-lg-5 mb-4">
              <div className="summary-card shadow-sm">
                <div className="summary-header">
                  <FaCalendarCheck className="me-2" />
                  <h5>Récapitulatif du rendez-vous</h5>
                </div>
                <div className="summary-body">
                  <div className="summary-item">
                    <label>Médecin</label>
                    <p>{doctorData.doctorName || "Non spécifié"}</p>
                    <span className="text-teal">{doctorData.specialty}</span>
                  </div>
                  <hr />
                  <div className="summary-item">
                    <label>Date et Heure</label>
                    <p>{displayDate(doctorData.date)}</p>
                    <p>à {doctorData.time || "--:--"}</p>
                  </div>
                  <hr />
                  <div className="total-box mt-4">
                    <span>Total à régler</span>
                    <span className="price">50 €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="payment-card shadow-sm p-4">
                {!paymentSuccess ? (
                  <>
                    <div className="card-header-custom d-flex justify-content-between align-items-center border-bottom pb-3">
                      <h5 className="mb-0">Paiement sécurisé par carte</h5>
                      <div className="cards-icons">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="visa" height="20" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="master" height="25" className="ms-2" />
                      </div>
                    </div>

                    <CheckoutForm
                      doctorData={doctorData}
                      storedUser={storedUser}
                      displayDate={displayDate}
                      setPaymentSuccess={setPaymentSuccess}
                      setLastTicket={setLastTicket}
                    />
                  </>
                ) : (
                  <div className="success-container text-center py-4">
                    <div className="success-icon-box mb-3" style={{ fontSize: "3.5rem", color: "#28a745" }}>✓</div>
                    <h4>Paiement réussi !</h4>
                    <p className="text-muted">Votre ticket est disponible ci-dessous.</p>

                    <div className="ticket-visual mt-4 p-4 border rounded bg-light shadow-sm text-center">
                      <h5 className="text-primary">{lastTicket.doctorName}</h5>
                      <p className="mb-1">{displayDate(lastTicket.date)}</p>
                      <p className="fw-bold">Heure : {lastTicket.time}</p>
                      <div className="d-flex justify-content-center my-3 bg-white p-2 d-inline-block rounded shadow-sm">
                        <QRCodeCanvas value={JSON.stringify(lastTicket)} size={160} />
                      </div>
                      <p className="mt-2 small text-muted">ID Ticket : {lastTicket.id}</p>
                    </div>

                    {/* ✅ Utilisation du composant Button pour le retour à l'espace patient */}
                    <Button
                      label="Aller à mon espace patient"
                      variant="register"
                      className="w-100 mt-4 py-2"
                      onClick={() => navigate("/patient")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default PaiementTicket;