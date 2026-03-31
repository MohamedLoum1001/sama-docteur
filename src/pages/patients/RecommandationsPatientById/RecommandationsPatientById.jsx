// src/pages/RecommandationsPatient.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const RecommandationsPatientById = () => {
  const { patientId } = useParams();
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommandations = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "recommandations"),
          where("patientId", "==", patientId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecommandations(data);
      } catch (err) {
        console.error("Erreur récupération recommandations :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommandations();
  }, [patientId]);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/dossiers-medicaux" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i> Retour aux dossiers
        </Link>
      </div>

      <h2 className="text-center mb-4">📋 Recommandations du patient</h2>

      {loading ? (
        <p className="text-center">Chargement des recommandations...</p>
      ) : recommandations.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucune recommandation disponible pour ce patient.
        </div>
      ) : (
        <div className="row">
          {recommandations.map((rec) => (
            <div key={rec.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    Par : {rec.doctorName || "Médecin"}
                  </h5>
                  <p>
                    <strong>Date :</strong>{" "}
                    {rec.createdAt
                      ? new Date(rec.createdAt.seconds * 1000).toLocaleDateString(
                          "fr-FR"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Recommandation :</strong> {rec.text || "Non spécifié"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommandationsPatientById;
