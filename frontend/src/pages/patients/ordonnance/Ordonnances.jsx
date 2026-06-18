import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../configuration/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import { FaArrowLeft, FaFileDownload, FaFilePrescription, FaUserMd } from "react-icons/fa";
import Button from "../../../components/boutons/Button";
import "./Ordonnance.css";
import logoImage from "../../../assets/logo-sama-docteur.png";
import cachetImage from "../../../assets/cachet.png";
import { toBase64 } from "../../../utils/toBase64";

const Ordonnances = () => {
  const navigate = useNavigate();
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsData, setDoctorsData] = useState({});
  // Récupération utilisateur pour ID et sécurité nom
  const userString = localStorage.getItem("user");
  const userProfil = userString ? JSON.parse(userString) : null;
  const patientId = userProfil?.uid || userProfil?.id || userProfil?._id;

  useEffect(() => {
    const fetchOrdonnances = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "ordonnances"),
          where("patientId", "==", patientId)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrdonnances(data);

        const doctorIds = [...new Set(data.map((o) => o.doctorId).filter(Boolean))];
        const newDoctorsData = {};

        for (const drId of doctorIds) {
          const docRef = doc(db, "users", drId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            newDoctorsData[drId] = docSnap.data();
          }
        }
        setDoctorsData(newDoctorsData);
      } catch (error) {
        console.error("Erreur récupération :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdonnances();
  }, [patientId]);

  const downloadPDF = async (ordonnance) => {
    const docPdf = new jsPDF("p", "mm", "a4");
    const pageWidth = docPdf.internal.pageSize.getWidth();
    const pageHeight = docPdf.internal.pageSize.getHeight();

    const pPrenom = ordonnance.prenom || userProfil?.prenom || "";
    const pNom = ordonnance.nom || userProfil?.nom || "Patient";
    const patientFullName = `${pPrenom} ${pNom}`.trim();

    docPdf.setFillColor(250, 250, 250);
    docPdf.rect(0, 0, pageWidth, pageHeight, "F");
    docPdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 5, 5, "S");

    try {
      const logoBase64 = await toBase64(logoImage);
      docPdf.addImage(logoBase64, "PNG", 15, 15, 40, 20);
    } catch (err) { }

    const doctorInfo = doctorsData[ordonnance.doctorId] || {};
    docPdf.setFont("helvetica", "bold");
    docPdf.text(`Dr. ${doctorInfo.prenom || ""} ${doctorInfo.nom || ""}`, pageWidth - 15, 20, { align: "right" });
    docPdf.setFont("helvetica", "normal");
    docPdf.setFontSize(10);
    docPdf.text(`${doctorInfo.specialite || "Médecin"}`, pageWidth - 15, 27, { align: "right" });
    docPdf.text(`Tel: ${doctorInfo.telephone || "N/A"}`, pageWidth - 15, 34, { align: "right" });

    docPdf.setFontSize(18);
    docPdf.setFont("helvetica", "bold");
    docPdf.text("Ordonnance Médicale", pageWidth / 2, 60, { align: "center" });
    docPdf.line(15, 65, pageWidth - 15, 65);

    docPdf.setFontSize(12);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(`Patient : ${patientFullName}`, 15, 78);

    const dateStr = ordonnance.createdAt?.seconds
      ? new Date(ordonnance.createdAt.seconds * 1000).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");
    docPdf.text(`Date : ${dateStr}`, pageWidth - 15, 78, { align: "right" });

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Médicaments :", 15, 95);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(ordonnance.medicaments || "", 15, 102, { maxWidth: pageWidth - 30 });

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Instructions :", 15, 130);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(ordonnance.instructions || "", 15, 137, { maxWidth: pageWidth - 30 });

    try {
      const cachetBase64 = await toBase64(cachetImage);
      docPdf.addImage(cachetBase64, "PNG", pageWidth / 2 - 20, pageHeight - 50, 40, 40);
    } catch (e) { }

    if (ordonnance.signature) {
      docPdf.addImage(ordonnance.signature, "PNG", pageWidth - 70, pageHeight - 45, 50, 25);
    }

    docPdf.save(`ordonnance_${pNom}.pdf`);
  };

  if (loading) return <div className="text-center mt-5 text-teal">Chargement des ordonnances...</div>;

  return (
    <div className="container mt-4 py-3">
      {/* Utilisation du Button pour le retour */}
      <div className="flex justify-start mb-4">
        <Button
          label={<><FaArrowLeft className="me-2" /> Retour à l'accueil</>}
          variant="register"
          onClick={() => navigate("/patient")}
          className="px-4"
        />
      </div>

      <h2 className="text-center mb-5 fw-bold text-teal">Mes Ordonnances</h2>

      {ordonnances.length === 0 ? (
        <div className="alert alert-info text-center shadow-sm rounded-4">
          <FaFilePrescription size={40} className="mb-3 d-block mx-auto text-teal" />
          Vous n'avez aucune ordonnance disponible pour le moment.
        </div>
      ) : (
        <div className="row">
          {ordonnances.map((ord) => {
            const dr = doctorsData[ord.doctorId] || {};
            return (
              <div key={ord.id} className="col-md-6 mb-4">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                  <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between">
                    <span className="badge bg-light text-teal p-2 px-3 rounded-pill">
                      {ord.createdAt?.seconds
                        ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                        : 'Date inconnue'}
                    </span>
                    <FaUserMd className="text-teal opacity-50" size={24} />
                  </div>
                  <div className="card-body px-4">
                    <h5 className="fw-bold text-primary mb-1">Dr. {dr.prenom} {dr.nom}</h5>
                    <p className="text-muted small mb-3">{dr.specialite}</p>
                    <div className="bg-light p-3 rounded-3 mb-4">
                      <p className="small fw-bold text-uppercase text-secondary mb-1">Aperçu prescription :</p>
                      <p className="text-truncate mb-0">{ord.medicaments}</p>
                    </div>

                    {/* Utilisation du Button pour le téléchargement PDF */}
                    <Button
                      label={<><FaFileDownload className="me-2" /> Télécharger en PDF</>}
                      variant="login"
                      onClick={() => downloadPDF(ord)}
                      className="w-100 py-2 fw-bold"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Ordonnances;