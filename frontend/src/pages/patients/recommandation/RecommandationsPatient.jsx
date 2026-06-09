import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./RecommandationsPatient.css";

const RecommandationsPatient = () => {
  const { id } = useParams();
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommandations = async () => {
      try {
        const q = query(
          collection(db, "patients", id, "recommandations"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecommandations(data);
      } catch (error) {
        console.error("Erreur chargement recommandations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommandations();
  }, [id]);

  return (
    <div className="container-fluid">
      {/* Bouton retour */}
      <div className="row ms-5 py-4">
        <div className="mb-2">
          <Link to="/home-patient" className="btn btn-custom rounded-pill">
            <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Titre */}
      <div className="container">
        <h4 className="text-center text-primary mb-4">
          Mes recommandations médicales
        </h4>

        {/* Contenu */}
        {loading ? (
          <div className="alert alert-info text-center">
            Chargement des recommandations...
          </div>
        ) : recommandations.length === 0 ? (
          <div className="alert alert-warning text-center">
            Aucune recommandation disponible pour le moment.
          </div>
        ) : (
          <div className="card shadow-sm border-0 p-3">
            <ul className="list-group list-group-flush">
              {recommandations.map((rec) => (
                <li
                  key={rec.id}
                  className="list-group-item border-0 border-bottom"
                >
                  <p className="mb-1">{rec.message}</p>
                  <small className="text-muted">
                    {" "}
                    {rec.createdAt?.toDate().toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommandationsPatient;
