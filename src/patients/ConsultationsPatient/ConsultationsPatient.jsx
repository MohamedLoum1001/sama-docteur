// src/pages/ConsultationsPatient.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const ConsultationsPatient = () => {
  const { patientId } = useParams();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        // On récupère les consultations du patient
        const q = query(
          collection(db, "consultations"),
          where("patientId", "==", patientId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConsultations(data);
      } catch (err) {
        console.error("Erreur récupération consultations :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [patientId]);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/dossiers-medicaux" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i> Retour aux dossiers
        </Link>
      </div>

      <h2 className="text-center mb-4">📋 Consultations du patient</h2>

      {loading ? (
        <p className="text-center">Chargement des consultations...</p>
      ) : consultations.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucune consultation disponible pour ce patient.
        </div>
      ) : (
        <div className="row">
          {consultations.map((consult) => (
            <div key={consult.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    {consult.titre || "Consultation"}
                  </h5>
                  <p>
                    <strong>Date :</strong>{" "}
                    {consult.date
                      ? new Date(
                          consult.date.seconds * 1000
                        ).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Médecin :</strong> {consult.medecin || "N/A"}
                  </p>
                  <p>
                    <strong>Notes :</strong> {consult.notes || "Aucune note"}
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

export default ConsultationsPatient;
