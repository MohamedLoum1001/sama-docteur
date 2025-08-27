// src/patients/dossier/DossierMedical.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DossierMedical.css";

const DossierMedical = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("consultations"); // 👈 gestion des onglets

  const dossier = {
    consultations: [
      {
        id: 1,
        date: "2023-04-01",
        type: "Consultation générale",
        rapport: "Compte rendu de la consultation...",
      },
      {
        id: 2,
        date: "2023-06-15",
        type: "Consultation dermatologique",
        rapport: "Rapport détaillé des examens cutanés...",
      },
    ],
    examens: [
      {
        id: 1,
        date: "2023-05-10",
        type: "Radiographie thoracique",
        resultat: "Résultat normal, aucune anomalie détectée.",
      },
      {
        id: 2,
        date: "2023-07-20",
        type: "IRM cérébrale",
        resultat: "Présence de légère inflammation...",
      },
    ],
    prescriptions: [
      {
        id: 1,
        medecin: "Dr. Dupont",
        medicament: "Paracétamol",
        dosage: "500mg, 3 fois par jour",
      },
      {
        id: 2,
        medecin: "Dr. Martin",
        medicament: "Ibuprofène",
        dosage: "200mg, 2 fois par jour",
      },
    ],
  };

  // Retour à l’accueil
  const homePatient = () => {
    navigate("/home-patient");
  };

  // Télécharger fichier PDF fictif
  const downloadFichier = (fichier) => {
    const link = document.createElement("a");
    link.href = `/assets/dossier-medical/${fichier}`;
    link.download = fichier;
    link.click();
  };

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
        <button
          className={`px-4 py-2 rounded-pill font-medium transition ${
            activeTab === "consultations"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("consultations")}
        >
          🩺 Consultations
        </button>
        <button
          className={`px-4 py-2 rounded-pill font-medium transition ${
            activeTab === "examens"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("examens")}
        >
          🧪 Examens
        </button>
        <button
          className={`px-4 py-2 rounded-pill font-medium transition ${
            activeTab === "prescriptions"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("prescriptions")}
        >
          💊 Prescriptions
        </button>
      </div>

      {/* Contenu dynamique */}
      {activeTab === "consultations" && (
        <section className="mb-8">
          {dossier.consultations.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune consultation disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {dossier.consultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">{c.type}</h4>
                  <p className="text-gray-600">📅 Date : {c.date}</p>
                  <p className="text-gray-700">{c.rapport}</p>
                  <button
                    onClick={() => downloadFichier(`consultation-${c.id}.pdf`)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-pill text-white custom-btn"
                  >
                    <i className="bi bi-download"></i> Télécharger le rapport
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "examens" && (
        <section className="mb-8">
          {dossier.examens.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune donnée d'examen disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {dossier.examens.map((e) => (
                <div
                  key={e.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">{e.type}</h4>
                  <p className="text-gray-600">📅 Date : {e.date}</p>
                  <p className="text-gray-700">{e.resultat}</p>
                  <button
                    onClick={() => downloadFichier(`examen-${e.id}.pdf`)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-pill text-white custom-btn"
                  >
                    <i className="bi bi-download"></i> Télécharger le résultat
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "prescriptions" && (
        <section>
          {dossier.prescriptions.length === 0 ? (
            <p className="text-center p-3 bg-blue-100 text-blue-700 rounded-md">
              Aucune prescription disponible.
            </p>
          ) : (
            <div className="grid gap-4">
              {dossier.prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="bg-white shadow-md rounded-lg p-4 border"
                >
                  <h4 className="font-semibold text-gray-800">
                    Médicament : {p.medicament}
                  </h4>
                  <p className="text-gray-600">👨‍⚕️ Prescrit par : {p.medecin}</p>
                  <p className="text-gray-700">💊 Dosage : {p.dosage}</p>
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
