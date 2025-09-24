// src/pages/ExamensPatient.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const ExamensPatient = () => {
  const { patientId } = useParams();
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamens = async () => {
      try {
        setLoading(true);
        // Récupération des examens pour le patient
        const q = query(
          collection(db, "examens"),
          where("patientId", "==", patientId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExamens(data);
      } catch (err) {
        console.error("Erreur récupération examens :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamens();
  }, [patientId]);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/dossiers-medicaux" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i> Retour aux dossiers
        </Link>
      </div>

      <h2 className="text-center mb-4">🧪 Examens du patient</h2>

      {loading ? (
        <p className="text-center">Chargement des examens...</p>
      ) : examens.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucun examen disponible pour ce patient.
        </div>
      ) : (
        <div className="row">
          {examens.map((exam) => (
            <div key={exam.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    {exam.titre || "Examen"}
                  </h5>
                  <p>
                    <strong>Date :</strong>{" "}
                    {exam.date
                      ? new Date(exam.date.seconds * 1000).toLocaleDateString(
                          "fr-FR"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Type :</strong> {exam.type || "N/A"}
                  </p>
                  <p>
                    <strong>Résultats :</strong>{" "}
                    {exam.resultats || "Résultats non disponibles"}
                  </p>
                  {exam.fichier && (
                    <a
                      href={exam.fichier}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary mt-2"
                    >
                      Voir le fichier
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamensPatient;
