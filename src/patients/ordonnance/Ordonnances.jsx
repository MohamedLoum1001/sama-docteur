// src/pages/Ordonnances.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import "./Ordonnance.css";

import logoImage from "../../assets/logo-sama-docteur.png";
import cachetImage from "../../assets/cachet.png";
import { toBase64 } from "../../utils/toBase64";

const Ordonnances = () => {
  const navigate = useNavigate();
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsData, setDoctorsData] = useState({});

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

        const doctorIds = [
          ...new Set(data.map((o) => o.doctorId).filter(Boolean)),
        ];
        const newDoctorsData = {};

        for (const doctorId of doctorIds) {
          const docRef = doc(db, "users", doctorId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const { prenom, nom, specialite, telephone, adresse } =
              docSnap.data();
            newDoctorsData[doctorId] = {
              prenom: prenom || "",
              nom: nom || "",
              specialite: specialite || "Médecin généraliste",
              telephone: telephone || "N/A",
              adresse: adresse || "N/A",
            };
          }
        }

        setDoctorsData(newDoctorsData);
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

    // Fond et bordure principale
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setLineWidth(0.7);
    doc.setDrawColor(200);
    doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 5, 5, "S");

    // Logo
    try {
      const logoBase64 = await toBase64(logoImage);
      doc.addImage(logoBase64, "PNG", 15, 15, 50, 25);
    } catch (err) {
      console.warn("Logo non chargé", err);
    }

    // Infos médecin
    const doctorInfo = doctorsData[ordonnance.doctorId] || {};
    const doctorFullName = `Dr. ${doctorInfo.prenom} ${doctorInfo.nom}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(doctorFullName, pageWidth - 15, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Spécialité : ${doctorInfo.specialite}`, pageWidth - 15, 27, {
      align: "right",
    });
    doc.text(`Contact : ${doctorInfo.telephone}`, pageWidth - 15, 34, {
      align: "right",
    });
    doc.text(`Adresse : ${doctorInfo.adresse}`, pageWidth - 15, 41, {
      align: "right",
    });

    // Titre ordonnance
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Ordonnance Médicale", pageWidth / 2, 60, { align: "center" });
    doc.setLineWidth(0.2);
    doc.setDrawColor(150);
    doc.line(15, 65, pageWidth - 15, 65);

    // Patient et date (sans bordure)
    const createdAt = ordonnance.createdAt?.toDate?.() || new Date();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Patient :", 15, 78);
    doc.text(`${ordonnance.prenom} ${ordonnance.nom}`, 32, 78);
    doc.text("Date :", pageWidth - 55, 78, { align: "right" });
    doc.text(
      `${createdAt.toLocaleDateString(
        "fr-FR"
      )} à ${createdAt.toLocaleTimeString("fr-FR")}`,
      pageWidth - 15,
      78,
      { align: "right" }
    );

    // Médicaments (sans bordure)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Médicaments :", 15, 95);
    doc.setFont("helvetica", "normal");
    doc.text(ordonnance.medicaments, 15, 102, { maxWidth: pageWidth - 30 });

    // Instructions (sans bordure)
    doc.setFont("helvetica", "bold");
    doc.text("Instructions :", 15, 120);
    doc.setFont("helvetica", "normal");
    doc.text(ordonnance.instructions, 15, 127, { maxWidth: pageWidth - 30 });

    // Cachet centré
    try {
      const cachetBase64 = await toBase64(cachetImage);
      doc.addImage(
        cachetBase64,
        "PNG",
        pageWidth / 2 - 25,
        pageHeight - 65,
        50,
        50
      );
    } catch (err) {
      console.warn("Cachet non chargé", err);
    }

    // Signature droite
    if (ordonnance.signature) {
      doc.addImage(
        ordonnance.signature,
        "PNG",
        pageWidth - 80,
        pageHeight - 60,
        60,
        30
      );
    } else {
      doc.setFontSize(10);
      doc.text("Signature :", pageWidth - 60, pageHeight - 40);
      doc.line(
        pageWidth - 60,
        pageHeight - 38,
        pageWidth - 20,
        pageHeight - 38
      );
    }

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

      <h2 className="text-center mb-4">Mes Ordonnances</h2>

      {loading ? (
        <p className="text-center">Chargement des ordonnances...</p>
      ) : ordonnances.length === 0 ? (
        <div className="alert alert-info text-center">
          Vous n'avez aucune ordonnance disponible pour le moment.
        </div>
      ) : (
        ordonnances.map((ordonnance) => {
          const doctorInfo = doctorsData[ordonnance.doctorId] || {};
          return (
            <div
              key={ordonnance.id}
              className="card shadow-sm mb-4 border border-gray-200 rounded-lg"
              style={{ backgroundColor: "#fefefe" }}
            >
              <div className="card-body text-center">
                <h5 className="card-title text-primary">
                  <i className="bi bi-file-earmark-medical me-2"></i>
                  Ordonnance du Dr {doctorInfo.prenom} {doctorInfo.nom}
                </h5>
                <p>
                  <strong>Spécialité :</strong> {doctorInfo.specialite}
                </p>
                <p>
                  <strong>Téléphone :</strong> {doctorInfo.telephone}
                </p>
                <p>
                  <strong>Adresse :</strong> {doctorInfo.adresse}
                </p>
                <p>
                  <strong>Médicaments :</strong> {ordonnance.medicaments}
                </p>
                <p>
                  <strong>Instructions :</strong> {ordonnance.instructions}
                </p>

                <div className="d-flex justify-content-center align-items-end">
                  <img
                    src={cachetImage}
                    alt="Cachet"
                    style={{ height: "60px", opacity: 0.8 }}
                  />
                </div>

                <button
                  className="btn custom-btn w-25 mt-3 rounded-pill text-white"
                  onClick={() => downloadPDF(ordonnance)}
                >
                  <i className="bi bi-download me-1"></i> Télécharger
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Ordonnances;
