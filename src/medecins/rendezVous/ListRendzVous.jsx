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
    const fetchRendezVous = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("Aucun utilisateur connecté !");
          setLoading(false);
          return;
        }

        // ⚡ Assurez-vous que vos documents Firestore ont bien un champ doctorId
        const q = query(
          collection(db, "rendezvous"),
          where("doctorId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.warn("Aucun rendez-vous trouvé pour doctorId =", user.uid);
        }

        const rdvs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        console.log("✅ Rendez-vous récupérés :", rdvs);
        setRendezVousList(rdvs);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des rendez-vous :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRendezVous();
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
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4">
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>👤 Patient</th>
                    <th>🗓️ Date & Heure</th>
                    <th>📝 Motif</th>
                    <th>📌 Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rendezVousList.map((rdv) => (
                    <tr key={rdv.id}>
                      <td>{rdv.patientName}</td>
                      <td>{formatDate(rdv.date)}</td>
                      <td>{rdv.motif}</td>
                      <td>
                        <span className={getStatusClass(rdv.statut)}>
                          {rdv.statut}
                        </span>
                      </td>
                      <td>
                        {rdv.statut === "En attente" && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => confirmerRdv(rdv.id)}
                            >
                              Confirmer
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => annulerRdv(rdv.id)}
                            >
                              Annuler
                            </button>
                          </>
                        )}
                        {rdv.statut === "Confirmé" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => annulerRdv(rdv.id)}
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeRendezVous;
