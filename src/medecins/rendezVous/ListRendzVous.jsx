// src/medecins/ListeRendezVous.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
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
          console.warn("Aucun utilisateur connecté !");
          setLoading(false);
          return;
        }
        // On récupère les tickets où le doctorId correspond à l'UID du médecin connecté
        const doctorId = user.uid;
        const q = query(collection(db, "tickets"), where("doctorId", "==", doctorId));
        const snapshot = await getDocs(q);
        const rdvs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        console.log("✅ Tickets filtrés par doctorId :", rdvs);
        setRendezVousList(rdvs);
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // 🔹 Confirmer un RDV
  const confirmerRdv = async (id) => {
    try {
      await updateDoc(doc(db, "rendezvous", id), { statut: "Confirmé" });
      setRendezVousList((prev) =>
        prev.map((rdv) =>
          rdv.id === id ? { ...rdv, statut: "Confirmé" } : rdv
        )
      );
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
    }
  };

  // 🔹 Annuler un RDV
  const annulerRdv = async (id) => {
    try {
      await updateDoc(doc(db, "rendezvous", id), { statut: "Annulé" });
      setRendezVousList((prev) =>
        prev.map((rdv) => (rdv.id === id ? { ...rdv, statut: "Annulé" } : rdv))
      );
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
    }
  };

  // 🔹 Format date en français
  const formatDate = (date) =>
    new Date(date).toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // 🔹 Badge selon statut
  const getStatusClass = (statut) => {
    if (statut === "Confirmé") return "badge bg-success rounded-pill px-3 py-2";
    if (statut === "En attente")
      return "badge bg-warning text-dark rounded-pill px-3 py-2";
    return "badge bg-secondary rounded-pill px-3 py-2";
  };

  return (
    <div className="container py-4">
      {/* Bouton retour */}
      <div className="mb-0 flex items-start">
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
        <div className="mb-4">
          <h4 className="mb-3 fw-bold text-primary">Tableau des rendez-vous</h4>
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle shadow rounded-4 overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Heure</th>
                  <th className="px-3 py-2">Spécialité</th>
                  <th className="px-3 py-2">Statut paiement</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rendezVousList.map((rdv, idx) => (
                  <tr key={rdv.id} className={idx % 2 === 0 ? "bg-light" : ""}>
                    <td className="px-3 py-2 fw-semibold text-dark">
                      {rdv.patientName || rdv.nomCompletPatient || rdv.prenom + " " + rdv.nom || rdv.patientEmail}
                    </td>
                    <td className="px-3 py-2">{rdv.date}</td>
                    <td className="px-3 py-2">{rdv.time}</td>
                    <td className="px-3 py-2">{rdv.doctorSpecialty}</td>
                    <td className="px-3 py-2">
                      <span className={
                        rdv.statutPaiement === "payé"
                          ? "badge bg-success rounded-pill px-3 py-2"
                          : "badge bg-danger rounded-pill px-3 py-2"
                      }>
                        {rdv.statutPaiement || "Non payé"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={getStatusClass(rdv.statutPaiement === "payé" ? "Confirmé" : rdv.statut)}>
                        {rdv.statutPaiement === "payé" ? "Confirmé" : rdv.statut}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="btn btn-sm btn-danger rounded-pill px-3"
                        onClick={() => annulerRdv(rdv.id)}
                      >
                        Annuler
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeRendezVous;
