// src/patients/PaiementTicket/PaiementTicket.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import "./PaiementTicket.css";

const PaiementTicket = () => {
  const location = useLocation();
  // Récupération des infos du rendez-vous depuis location.state
  const {
    patientName = "",
    doctor = "",
    doctorId = "",
    specialty = "",
    date = "",
    time = ""
  } = location.state || {};

  // Extraction prénom/nom patient
  const [patientFullName, setPatientFullName] = useState("");
  const [loadingPatient, setLoadingPatient] = useState(true);
  // Récupère prénom et nom du patient depuis Firestore
  useEffect(() => {
    async function fetchPatientName() {
      setLoadingPatient(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setPatientFullName("");
          setLoadingPatient(false);
          return;
        }
        const { uid, email } = user;
        // Cherche par uid puis par email si besoin
        let querySnapshot = null;
        const { getDocs, collection, where, query } = await import("firebase/firestore");
        querySnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
        if (querySnapshot.empty && email) {
          querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", email)));
        }
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setPatientFullName(`${data.prenom || ""} ${data.nom || ""}`.trim());
        } else {
          setPatientFullName("");
        }
      } catch {
        setPatientFullName("");
      }
      setLoadingPatient(false);
    }
    fetchPatientName();
  }, []);
  // Extraction prénom/nom du docteur
  const doctorName = doctor.replace(/^Dr\.?\s*/, "");
  const doctorSpecialty = specialty;
  const appointmentDate = date;
  const appointmentTime = time;
  const navigate = useNavigate();

  const [payment, setPayment] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Simulation de paiement : le paiement est toujours accepté pour tester le flux
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const user = auth.currentUser;
    if (!user) {
      setErrorMsg("Utilisateur non connecté. Veuillez vous authentifier.");
      setPaymentError(true);
      setPaymentSuccess(false);
      return;
    }
    // Si le nom complet n'est pas renseigné dans Firebase, on exige la saisie
    let patientName = "";
    if (patientFullName && patientFullName.trim().length > 0) {
      patientName = patientFullName.trim();
    } else if (user.displayName && user.displayName.trim().length > 0) {
      patientName = user.displayName.trim();
    } else {
      setPaymentError(true);
      setPaymentSuccess(false);
      setErrorMsg("Le nom du patient est requis. Veuillez le renseigner.");
      return;
    }
    if (payment.cardNumber && payment.expiryDate && payment.cvv) {
      // Debug : afficher les valeurs des champs utilisés dans la validation
      console.log("doctorName:", doctorName);
      console.log("doctorSpecialty:", doctorSpecialty);
      console.log("appointmentDate:", appointmentDate);
      console.log("appointmentTime:", appointmentTime);
      console.log("user.displayName:", user.displayName);
      console.log("patientFullName:", patientFullName);
      if (
        !doctorName ||
        !doctorSpecialty ||
        !appointmentDate ||
        !appointmentTime
      ) {
        setPaymentError(true);
        setPaymentSuccess(false);
        setErrorMsg(
          "Tous les champs du ticket doivent être renseignés (médecin, spécialité, date, heure). Veuillez recommencer la réservation."
        );
        return;
      }
      setPaymentSuccess(true);
      setPaymentError(false);
      const ticketId = Date.now().toString();
      const rendezvousId = Math.random().toString(36).substring(2, 18);
      const createdAt = new Date().toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "medium",
      });
      const qrCodeUrl = `https://firebasestorage.googleapis.com/qrcode/ticket_${ticketId}.png`;
      const ticket = {
        id: ticketId,
        patientId: user.uid,
        patientName,
        doctorName: `Dr. ${doctorName}`,
        doctorSpecialty,
  doctorId: doctorId || "", // <-- Ajout de l'UID du médecin
        date: appointmentDate,
        time: appointmentTime,
        prix: 50,
        statutPaiement: "payé",
        createdAt,
        rendezvousId,
        qrCodeUrl,
        cardNumber: payment.cardNumber.replace(/\d(?=\d{4})/g, "*"),
      };
      setLastTicket(ticket);
      setPayment({ cardNumber: "", expiryDate: "", cvv: "" });
      sendTicket(ticket);
      // Ajout du ticket dans Firestore avec l'ID personnalisé
      try {
        await setDoc(doc(db, "tickets", ticketId), ticket);
      } catch (error) {
        setErrorMsg(
          "Erreur lors de l'enregistrement du ticket dans Firestore. Veuillez vérifier votre connexion ou vos droits Firestore."
        );
        setPaymentError(true);
        setPaymentSuccess(false);
        console.error("Firestore ticket error:", error);
        return;
      }
      // Ajout du paiement dans Firestore
      try {
        await addDoc(collection(db, "paiements"), {
          date: serverTimestamp(),
          methode: "Carte bancaire",
          patientId: user.uid,
          prix: 50,
          statut: "réussi",
          ticketId: ticketId,
          transactionId: ticketId,
        });
      } catch (error) {
        // Erreur d'enregistrement du paiement
      }
    } else {
      setPaymentError(true);
      setPaymentSuccess(false);
      setErrorMsg("Veuillez remplir tous les champs de paiement.");
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
              {/* Prénom et nom du patient (pré-rempli, modifiable si besoin) */}
              <div className="mb-3">
                <label htmlFor="patientFullName" className="form-label">
                  Prénom et nom du patient <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="patientFullName"
                  className="form-control rounded-pill"
                  placeholder="Entrez votre prénom et nom"
                  value={loadingPatient ? "Chargement..." : patientFullName}
                  onChange={(e) => setPatientFullName(e.target.value)}
                  required
                  disabled={loadingPatient}
                />
              </div>
              {/* Prénom et nom du docteur (pré-rempli, non modifiable) */}
              <div className="mb-3">
                <label className="form-label">Prénom et nom du docteur</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={doctorName}
                  disabled
                />
              </div>
              {/* Spécialité du docteur (pré-rempli, non modifiable) */}
              <div className="mb-3">
                <label className="form-label">Spécialité</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={doctorSpecialty}
                  disabled
                />
              </div>
              {/* Date du rendez-vous (pré-rempli, non modifiable) */}
              <div className="mb-3">
                <label className="form-label">Date du rendez-vous</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={appointmentDate}
                  disabled
                />
              </div>
              {/* Heure du rendez-vous (pré-rempli, non modifiable) */}
              <div className="mb-3">
                <label className="form-label">Heure du rendez-vous</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={appointmentTime}
                  disabled
                />
              </div>
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
                {errorMsg
                  ? errorMsg
                  : "Une erreur est survenue lors du paiement. Veuillez réessayer."}
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
