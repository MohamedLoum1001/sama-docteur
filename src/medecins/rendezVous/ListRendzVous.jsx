// src/medecin/ListeRendezVous.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./ListRendezVous.css";

const ListeRendezVous = () => {
  const [rendezVousList, setRendezVousList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Charger les rendez-vous du médecin connecté
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const doctorId = user.uid;
        const q = query(
          collection(db, "tickets"),
          where("doctorId", "==", doctorId)
        );
        const snapshot = await getDocs(q);

        const rdvs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setRendezVousList(rdvs);
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 🔹 Format date en FR
  const formatDateFR = (date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // 🔹 Format heure en FR
  const formatTimeFR = (timeStr) => {
    try {
      const [h, m] = timeStr.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    } catch {
      return timeStr;
    }
  };

  // 🔹 Badge statut paiement
  const getPaymentClass = (paiement) => {
    if (paiement === "payé") return "badge bg-success rounded-pill px-3 py-2";
    if (paiement === "remboursé")
      return "badge bg-info text-dark rounded-pill px-3 py-2";
    return "badge bg-danger rounded-pill px-3 py-2";
  };

  // 🔹 Badge statut RDV
  const getStatusClass = (statut) => {
    if (statut === "Confirmé") return "badge bg-success rounded-pill px-3 py-2";
    if (statut === "Annulé") return "badge bg-danger rounded-pill px-3 py-2";
    return "badge bg-warning text-dark rounded-pill px-3 py-2";
  };

  // 🔹 Valider un RDV
  const validerRdv = async (rdv) => {
    try {
      await updateDoc(doc(db, "tickets", rdv.id), { statut: "Confirmé" });

      setRendezVousList((prev) =>
        prev.map((r) => (r.id === rdv.id ? { ...r, statut: "Confirmé" } : r))
      );

      // Notification patient
      await addDoc(collection(db, "notifications"), {
        userId: rdv.patientId,
        title: "Rendez-vous validé",
        message: `Votre rendez-vous avec Dr ${
          rdv.nomCompletMedecin || rdv.doctorName
        } du ${formatDateFR(rdv.date)} à ${formatTimeFR(
          rdv.time
        )} a été validé.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
    }
  };

  // 🔹 Annuler un RDV + remboursement + notifications
  const annulerRdv = async (rdv) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?"))
      return;

    try {
      await updateDoc(doc(db, "tickets", rdv.id), {
        statut: "Annulé",
        statutPaiement: "remboursé",
      });

      setRendezVousList((prev) =>
        prev.map((r) =>
          r.id === rdv.id
            ? { ...r, statut: "Annulé", statutPaiement: "remboursé" }
            : r
        )
      );

      // Notification patient
      await addDoc(collection(db, "notifications"), {
        userId: rdv.patientId,
        title: "Rendez-vous annulé",
        message: `Votre rendez-vous avec Dr ${
          rdv.nomCompletMedecin || rdv.doctorName
        } du ${formatDateFR(rdv.date)} à ${formatTimeFR(
          rdv.time
        )} a été annulé.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      // Notification médecin
      await addDoc(collection(db, "notifications"), {
        userId: rdv.doctorId,
        title: "Rendez-vous annulé par le patient",
        message: `Le patient ${
          rdv.nomCompletPatient || rdv.patientName
        } a annulé son rendez-vous du ${formatDateFR(
          rdv.date
        )} à ${formatTimeFR(rdv.time)}.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link to="/home-medecin" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i>Retour à l'accueil
        </Link>
      </div>

      <h2 className="text-center text-primary fw-bold mb-4">
        📅 Mes Rendez-vous Programmés
      </h2>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : rendezVousList.length === 0 ? (
        <div className="alert alert-info text-center mt-5">
          Vous n'avez pas de rendez-vous avec aucun patient.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle shadow rounded-4 overflow-hidden">
            <thead className="bg-primary text-white">
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Spécialité</th>
                <th>Statut paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rendezVousList.map((rdv, idx) => (
                <tr key={rdv.id} className={idx % 2 === 0 ? "bg-light" : ""}>
                  <td>{rdv.patientName || rdv.nomCompletPatient}</td>
                  <td>{formatDateFR(rdv.date)}</td>
                  <td>{formatTimeFR(rdv.time)}</td>
                  <td>{rdv.doctorSpecialty}</td>
                  <td>
                    <span className={getPaymentClass(rdv.statutPaiement)}>
                      {rdv.statutPaiement || "Non payé"}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusClass(rdv.statut)}>
                      {rdv.statut || "En attente"}
                    </span>
                  </td>
                  <td>
                    {rdv.statut === "Annulé" ? (
                      <span className="badge bg-danger rounded-pill px-3 py-2">
                        RV annulé
                      </span>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-success rounded-pill px-3 me-2"
                          onClick={() => validerRdv(rdv)}
                          disabled={rdv.statut === "Confirmé"}
                        >
                          Valider
                        </button>
                        <button
                          className="btn btn-sm btn-danger rounded-pill px-3"
                          onClick={() => annulerRdv(rdv)}
                        >
                          Annuler
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListeRendezVous;
