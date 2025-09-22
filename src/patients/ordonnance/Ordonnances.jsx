// src/pages/Ordonnances.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "./Ordonnance.css";

// Import du logo
import logoImage from "../../assets/logo-sama-docteur.png"; // Remplacer par ton logo réel
import { toBase64 } from "../../utils/toBase64";

const Ordonnances = () => {
  const navigate = useNavigate();
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdonnances = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
          collection(db, "ordonnances"),
          where("patientId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrdonnances(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des ordonnances :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrdonnances();
  }, []);

  const homePatient = () => navigate("/home-patient");

  const downloadPDF = async (ordonnance) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Bordure générale
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Logo
    try {
      const logoBase64 = await toBase64(logoImage);
      doc.addImage(logoBase64, "PNG", 15, 15, 50, 25);
    } catch (err) {
      console.warn("Logo non chargé", err);
    }

    // Entête médecin
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${ordonnance.doctorName || "Dr Médecin"}`, pageWidth - 15, 20, {
      align: "right",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Spécialité : Médecin généraliste", pageWidth - 15, 27, {
      align: "right",
    });
    doc.text("Contact : +221 XXX XXX XXX", pageWidth - 15, 34, {
      align: "right",
    });

    // Date
    const createdAt = ordonnance.createdAt?.toDate?.() || new Date();
    doc.setFontSize(12);
    doc.text(
      `Date : ${createdAt.toLocaleDateString()} à ${createdAt.toLocaleTimeString()}`,
      15,
      55
    );

    // Patient
    doc.text(`Patient : ${ordonnance.prenom} ${ordonnance.nom}`, 15, 63);

    // Titre ordonnance
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("🧾 Ordonnance Médicale", pageWidth / 2, 80, { align: "center" });

    // Médicaments
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Médicaments :", 15, 95);
    doc.text(ordonnance.medicaments, 20, 102, { maxWidth: pageWidth - 40 });

    // Instructions
    doc.text("Instructions :", 15, 120);
    doc.text(ordonnance.instructions, 20, 127, { maxWidth: pageWidth - 40 });

    // Signature du médecin
    if (ordonnance.signature) {
      // Affiche la signature si disponible (base64)
      doc.addImage(
        ordonnance.signature,
        "PNG",
        pageWidth - 80,
        pageHeight - 60,
        60,
        30
      );
    } else {
      // Placeholder signature
      doc.text("Signature :", pageWidth - 60, pageHeight - 40);
      doc.line(
        pageWidth - 60,
        pageHeight - 38,
        pageWidth - 20,
        pageHeight - 38
      );
    }

    // Télécharger le PDF
    doc.save(`ordonnance_${ordonnance.id}.pdf`);
  };

  return (
    <div className="container mt-4 py-3">
      <div className="mb-3">
        <button
          className="btn custom-btn mb-4 d-flex align-items-center rounded-pill"
          onClick={homePatient}
        >
          <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
        </button>
      </div>

      <h2 className="text-center mb-4">🧾 Mes Ordonnances</h2>

      {loading ? (
        <p className="text-center">Chargement des ordonnances...</p>
      ) : ordonnances.length === 0 ? (
        <div className="alert alert-info text-center">
          Vous n'avez aucune ordonnance disponible pour le moment.
        </div>
      ) : (
        ordonnances.map((ordonnance) => (
          <div key={ordonnance.id} className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title text-primary">
                <i className="bi bi-file-earmark-medical me-2"></i>
                Ordonnance du Dr {ordonnance.doctorName || "Médecin"}
              </h5>
              <p>
                <strong>Médicaments :</strong> {ordonnance.medicaments}
              </p>
              <p>
                <strong>Instructions :</strong> {ordonnance.instructions}
              </p>
              <button
                className="btn custom-btn w-25 mt-3 rounded-pill text-white"
                onClick={() => downloadPDF(ordonnance)}
              >
                <i className="bi bi-download me-1"></i> Télécharger l'ordonnance
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Ordonnances;
