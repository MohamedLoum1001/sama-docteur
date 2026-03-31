// src/patients/dossier/DossierMedical.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./DossierMedical.css";

const DossierMedical = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("consultations");
  const [consultations, setConsultations] = useState([]);
  const [examens, setExamens] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);

  const homePatient = () => navigate("/home-patient");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const dossierId = "dossierPrincipal"; // ID fixe du dossier principal

        // 🔹 Consultations
        const snapConsult = await getDocs(
          collection(
            db,
            "users",
            user.uid,
            "dossiersMedicaux",
            dossierId,
            "consultations"
          )
        );
        const consultData = snapConsult.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setConsultations(
          consultData.sort((a, b) => new Date(b.date) - new Date(a.date))
        );

        // 🔹 Examens
        const snapExam = await getDocs(
          collection(
            db,
            "users",
            user.uid,
            "dossiersMedicaux",
            dossierId,
            "examens"
          )
        );
        const examData = snapExam.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setExamens(
          examData.sort((a, b) => new Date(b.date) - new Date(a.date))
        );

        // 🔹 Ordonnances
        const snapOrd = await getDocs(
          collection(
            db,
            "users",
            user.uid,
            "dossiersMedicaux",
            dossierId,
            "ordonnances"
          )
        );
        const ordData = snapOrd.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
          };
        });
        setOrdonnances(
          ordData.sort(
            (a, b) =>
              (b.createdAt ? b.createdAt.getTime() : 0) -
              (a.createdAt ? a.createdAt.getTime() : 0)
          )
        );

        // 🔹 Recommandations
        const snapReco = await getDocs(
          collection(
            db,
            "users",
            user.uid,
            "dossiersMedicaux",
            dossierId,
            "recommandations"
          )
        );
        const recoData = snapReco.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
          };
        });
        setRecommandations(
          recoData.sort(
            (a, b) =>
              (b.createdAt ? b.createdAt.getTime() : 0) -
              (a.createdAt ? a.createdAt.getTime() : 0)
          )
        );

        setLoading(false);
      } catch (err) {
        console.error("Erreur récupération dossier médical:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadFichier = (fichier) => {
    if (!fichier) return;
    const link = document.createElement("a");
    link.href = fichier;
    link.download = fichier.split("/").pop();
    link.click();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600">
        <div className="spinner-border text-primary me-2" role="status"></div>
        Chargement du dossier médical...
      </div>
    );

  return (
    <div className="container mx-auto mt-6 px-4">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={homePatient}
          className="custom-btn flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md"
        >
          <i className="bi bi-arrow-left"></i> Retour à l'accueil
        </button>
      </div>

      <h2 className="text-center text-3xl font-bold mb-8 text-gray-800">
        📁 Mon Dossier Médical
      </h2>

      {/* Onglets */}
      <div className="flex justify-center gap-4 mb-8">
        {["consultations", "examens", "ordonnances", "recommandations"].map(
          (tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-pill font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "consultations" && "🩺 Consultations"}
              {tab === "examens" && "🧪 Examens"}
              {tab === "ordonnances" && "💊 Ordonnances"}
              {tab === "recommandations" && "📝 Recommandations"}
            </button>
          )
        )}
      </div>

      {/* Contenu dynamique */}
      {activeTab === "consultations" && (
        <section className="mb-8">
          {consultations.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune consultation disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">{c.type}</h4>
                  <p className="text-gray-600">📅 Date : {c.date}</p>
                  <p className="text-gray-700">{c.rapport}</p>
                  {c.fichier && (
                    <button
                      onClick={() => downloadFichier(c.fichier)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-pill text-white custom-btn"
                    >
                      <i className="bi bi-download"></i> Télécharger le rapport
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "examens" && (
        <section className="mb-8">
          {examens.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune donnée d'examen disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {examens.map((e) => (
                <div
                  key={e.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">{e.type}</h4>
                  <p className="text-gray-600">📅 Date : {e.date}</p>
                  <p className="text-gray-700">{e.resultat}</p>
                  {e.fichier && (
                    <button
                      onClick={() => downloadFichier(e.fichier)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-pill text-white custom-btn"
                    >
                      <i className="bi bi-download"></i> Télécharger le résultat
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "ordonnances" && (
        <section>
          {ordonnances.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune ordonnance disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {ordonnances.map((o) => (
                <div
                  key={o.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">
                    💊 Médicament : {o.medicaments || o.medicament}
                  </h4>
                  <p className="text-gray-600">
                    👨‍⚕️ Prescrit par : {o.doctorName || o.medecin}
                  </p>
                  <p className="text-gray-600">
                    📅 Date :{" "}
                    {o.createdAt
                      ? o.createdAt.toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                  <p className="text-gray-700">
                    📝 Instructions : {o.instructions || o.dosage}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "recommandations" && (
        <section>
          {recommandations.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune recommandation disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {recommandations.map((r) => (
                <div
                  key={r.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">
                    👨‍⚕️ Dr. {r.doctorName || r.medecin}
                  </h4>
                  <p className="text-gray-600">
                    📅 Date :{" "}
                    {r.createdAt
                      ? r.createdAt.toLocaleDateString("fr-FR")
                      : "N/A"}
                  </p>
                  <p className="text-gray-700">
                    📝 Message : {r.message || r.instructions}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DossierMedical;
