import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../configuration/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const OrdonnancesPatient = () => {
  const { patientId } = useParams();
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdonnances = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "ordonnances"),
          where("patientId", "==", patientId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrdonnances(data);
      } catch (err) {
        console.error("Erreur récupération ordonnances :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdonnances();
  }, [patientId]);

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <Link to="/dossiers-medicaux" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i> Retour aux dossiers
        </Link>
      </div>

      <h2 className="text-center mb-4">Ordonnances du patient</h2>

      {loading ? (
        <p className="text-center">Chargement des ordonnances...</p>
      ) : ordonnances.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucune ordonnance disponible pour ce patient.
        </div>
      ) : (
        <div className="row">
          {ordonnances.map((ordonnance) => (
            <div key={ordonnance.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    Prescrit par : {ordonnance.doctorName || "Médecin"}
                  </h5>
                  <p>
                    <strong>Date :</strong>{" "}
                    {ordonnance.createdAt
                      ? new Date(
                          ordonnance.createdAt.seconds * 1000
                        ).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Médicaments :</strong>{" "}
                    {ordonnance.medicaments || "Non spécifié"}
                  </p>
                  <p>
                    <strong>Instructions :</strong>{" "}
                    {ordonnance.instructions || "Non spécifié"}
                  </p>
                  {ordonnance.recommandation && (
                    <p>
                      <strong>Recommandation :</strong>{" "}
                      {ordonnance.recommandation}
                    </p>
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

export default OrdonnancesPatient;
