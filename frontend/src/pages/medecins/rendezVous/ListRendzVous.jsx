import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../../configuration/firebase";
import { FaArrowLeft, FaCheck, FaTimes, FaCalendarCheck, FaUser } from "react-icons/fa";
import "./ListRendezVous.css";

const ListeRendezVous = () => {
  const [rendezVousList, setRendezVousList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Récupération sécurisée du médecin depuis le localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const doctorId = user?.uid || user?.id || user?._id;

  useEffect(() => {
    const fetchRendezVous = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        // On récupère tous les RDV liés à ce doctorId
        const q = query(
          collection(db, "rendezvous"),
          where("doctorId", "==", doctorId)
        );

        const snapshot = await getDocs(q);

        // Tri local (JavaScript) pour éviter les erreurs d'index Firestore
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })).sort((a, b) => {
          // Trie du plus récent au plus ancien par date de création
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        setRendezVousList(docs);
        console.log("RDV récupérés pour le docteur :", docs.length);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRendezVous();
  }, [doctorId]);

  // Valider un rendez-vous
  const validerRdv = async (rdv) => {
    try {
      const rdvRef = doc(db, "rendezvous", rdv.id);
      await updateDoc(rdvRef, { statut: "Confirmé" });

      // Mise à jour visuelle
      setRendezVousList(prev => prev.map(r => r.id === rdv.id ? { ...r, statut: "Confirmé" } : r));

      // Notification au patient
      await addDoc(collection(db, "notifications"), {
        userId: rdv.patientId,
        title: "Rendez-vous confirmé",
        message: `Bonne nouvelle ! Dr ${user.nom} a confirmé votre rendez-vous du ${new Date(rdv.date).toLocaleDateString('fr-FR')} à ${rdv.time}.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      alert("Le rendez-vous a été confirmé et le patient notifié.");
    } catch (error) {
      console.error("Erreur validation :", error);
      alert("Erreur lors de la validation.");
    }
  };

  // Annuler un rendez-vous
  const annulerRdv = async (rdv) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;

    try {
      const rdvRef = doc(db, "rendezvous", rdv.id);
      await updateDoc(rdvRef, { statut: "Annulé" });

      // Mise à jour visuelle
      setRendezVousList(prev => prev.map(r => r.id === rdv.id ? { ...r, statut: "Annulé" } : r));

      // Notification au patient
      await addDoc(collection(db, "notifications"), {
        userId: rdv.patientId,
        title: "Rendez-vous annulé",
        message: `Désolé, Dr ${user.nom} a dû annuler votre rendez-vous du ${new Date(rdv.date).toLocaleDateString('fr-FR')}.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      alert("Le rendez-vous a été annulé.");
    } catch (error) {
      console.error("Erreur annulation :", error);
    }
  };

  if (loading) return (
    <div className="loader-container text-center mt-5">
      <div className="spinner-border text-teal" role="status"></div>
      <p className="mt-2 text-teal">Chargement de votre agenda...</p>
    </div>
  );

  return (
    <div className="list-rdv-container">
      <div className="list-rdv-header">
        <button onClick={() => navigate("/medecin")} className="back-link">
          <FaArrowLeft /> Retour à l'accueil
        </button>
        <h2 className="title-section">
          <FaCalendarCheck className="me-3 text-teal" />
          Mes Rendez-vous ({rendezVousList.length})
        </h2>
      </div>

      <div className="table-card shadow-sm border-0">
        {rendezVousList.length === 0 ? (
          <div className="empty-msg py-5 text-center">
            <FaCalendarCheck size={50} className="text-muted mb-3" />
            <p>Vous n'avez pas encore de rendez-vous programmé.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table w-100">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date & Heure</th>
                  <th>Spécialité</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rendezVousList.map((rdv) => (
                  <tr key={rdv.id}>
                    <td className="patient-cell">
                      <div className="avatar-mini bg-teal text-white">
                        <FaUser size={14} />
                      </div>
                      <span className="fw-bold">{rdv.patientName}</span>
                    </td>
                    <td>
                      <div className="date-text fw-bold">
                        {new Date(rdv.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="time-text text-teal">{rdv.time}</div>
                    </td>
                    <td><span className="badge-spec">{rdv.specialty}</span></td>
                    <td>
                      <span className={`status-pill ${rdv.statut?.toLowerCase().replace(/\s/g, '')}`}>
                        {rdv.statut || "En attente"}
                      </span>
                    </td>
                    <td className="text-center">
                      {rdv.statut !== "Annulé" ? (
                        <div className="action-buttons d-flex justify-content-center gap-2">
                          {rdv.statut !== "Confirmé" && (
                            <button onClick={() => validerRdv(rdv)} className="btn-action confirm" title="Confirmer">
                              <FaCheck />
                            </button>
                          )}
                          <button onClick={() => annulerRdv(rdv)} className="btn-action cancel" title="Annuler">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <span className="text-danger small fw-bold">Annulé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeRendezVous;