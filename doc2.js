import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { FaArrowLeft, FaLock, FaCalendarCheck } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../../../components/boutons/Button";
import "./PaiementTicket.css";

const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : "http://4.233.208.186:8000";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ doctorData, storedUser, setPaymentSuccess, setLastTicket }) => {
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
      const response = await fetch(`${API_URL}/api/auth/create-payment-intent`, {
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

        // Sauvegarde dans Firestore
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
      setErrorMsg("Impossible de contacter le serveur de paiement Azure.");
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

      {errorMsg && <div className="alert alert-danger py-2 small shadow-sm">{errorMsg}</div>}

      <Button
        type="submit"
        label="Confirmer et payer 50 €"
        variant="login"
        loading={isProcessing}
        disabled={!stripe}
        className="w-100 mt-2 rounded-pill"
      />

      <p className="security-note mt-3 text-center small text-muted">
        <FaLock size={12} className="me-1" /> Paiement 100% sécurisé via Stripe & Azure
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
          <button className="back-link border-0 bg-transparent text-teal fw-bold" onClick={() => navigate("/patient")}>
            <FaArrowLeft className="me-2" /> Retour à l'accueil
          </button>

          <div className="row mt-4">
            <div className="col-lg-5 mb-4">
              <div className="summary-card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                <div className="summary-header p-3 text-white" style={{ backgroundColor: "#1a1c23" }}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaCalendarCheck className="me-2" /> Récapitulatif
                  </h5>
                </div>
                <div className="summary-body p-4">
                  <div className="summary-item">
                    <label className="text-muted small text-uppercase fw-bold">Médecin</label>
                    <p className="mb-0 fw-bold text-dark">{doctorData.doctorName || "Non spécifié"}</p>
                    <span style={{ color: "#00a5a8" }}>{doctorData.specialty}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="summary-item">
                    <label className="text-muted small text-uppercase fw-bold">Date et Heure</label>
                    <p className="mb-0 text-dark">{displayDate(doctorData.date)}</p>
                    <p className="fw-bold" style={{ color: "#00a5a8" }}>à {doctorData.time || "--:--"}</p>
                  </div>
                  <hr className="my-3" />
                  <div className="total-box mt-4 p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#f8f9fa" }}>
                    <span className="fw-bold">Total à régler</span>
                    <span className="price h4 mb-0 fw-black" style={{ color: "#00a5a8" }}>50 €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="payment-card shadow-sm p-4 bg-white rounded-4 border-0">
                {!paymentSuccess ? (
                  <>
                    <div className="card-header-custom d-flex justify-content-between align-items-center border-bottom pb-3">
                      <h5 className="mb-0 fw-bold">Paiement par carte</h5>
                      <div className="cards-icons">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="visa" height="15" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="master" height="20" className="ms-2" />
                      </div>
                    </div>

                    <CheckoutForm
                      doctorData={doctorData}
                      storedUser={storedUser}
                      setPaymentSuccess={setPaymentSuccess}
                      setLastTicket={setLastTicket}
                    />
                  </>
                ) : (
                  <div className="success-container text-center py-4">
                    <div className="success-icon-box mb-3 shadow-sm d-inline-flex align-items-center justify-content-center rounded-circle" 
                         style={{ width: "80px", height: "80px", backgroundColor: "#e6f6f4", color: "#00a5a8", fontSize: "2rem" }}>✓</div>
                    <h4 className="fw-bold">Paiement réussi !</h4>
                    <p className="text-muted">Votre ticket a été généré sur Azure avec succès.</p>

                    <div className="ticket-visual mt-4 p-4 border-0 rounded-4 shadow-sm text-center bg-white">
                      <div className="badge rounded-pill mb-2 px-3 py-2" style={{ backgroundColor: "#e6f6f4", color: "#00a5a8" }}>TICKET VALIDE</div>
                      <h5 className="fw-bold text-dark">{lastTicket.doctorName}</h5>
                      <p className="mb-1 text-muted">{displayDate(lastTicket.date)}</p>
                      <p className="fw-bold h5" style={{ color: "#00a5a8" }}>Heure : {lastTicket.time}</p>
                      
                      <div className="d-flex justify-content-center my-3 bg-white p-3 d-inline-block rounded-4 border shadow-sm">
                        <QRCodeCanvas value={JSON.stringify(lastTicket)} size={160} />
                      </div>
                      <p className="mt-2 small text-muted font-monospace">ID : {lastTicket.id}</p>
                    </div>

                    <Button
                      label="Aller à mon espace patient"
                      variant="register"
                      className="w-100 mt-4 py-3 rounded-pill"
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