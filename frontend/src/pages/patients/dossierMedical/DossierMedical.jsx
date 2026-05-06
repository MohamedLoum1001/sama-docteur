// src/patients/dossier/DossierMedical.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaStethoscope, FaFlask, FaPills, FaClipboardList, FaArrowLeft, FaDownload, FaExclamationCircle } from "react-icons/fa";
import Button from "../../../components/boutons/Button";
import "./DossierMedical.css";

const DossierMedical = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("consultations");
  const [data, setData] = useState({
    consultations: [],
    examens: [],
    ordonnances: [],
    recommandations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const newData = {
          consultations: [],
          examens: [],
          ordonnances: [],
          recommandations: []
        };

        // --- 1. RECHERCHE DANS LES COLLECTIONS RACINES (Globales) ---
        // Récupération des ordonnances globales
        const qRootOrd = query(collection(db, "ordonnances"), where("patientId", "==", user.uid));
        const snapRootOrd = await getDocs(qRootOrd);
        const rootOrd = snapRootOrd.docs.map(doc => ({
          id: doc.id, ...doc.data(),
          dateObj: doc.data().createdAt?.toDate() || new Date()
        }));

        // Récupération des recommandations globales
        const qRootRec = query(collection(db, "recommandations"), where("patientId", "==", user.uid));
        const snapRootRec = await getDocs(qRootRec);
        const rootRec = snapRootRec.docs.map(doc => ({
          id: doc.id, ...doc.data(),
          dateObj: doc.data().createdAt?.toDate() || new Date()
        }));

        // --- 2. RECHERCHE DANS LES SOUS-COLLECTIONS DU DOSSIER (Imbriquées) ---
        // Chemin : users -> UID -> dossiersMedicaux -> dossierPrincipal -> [Sous-Collection]
        const subColPath = (name) => collection(db, "users", user.uid, "dossiersMedicaux", "dossierPrincipal", name);

        const [snapSubConsult, snapSubExam, snapSubOrd, snapSubRec] = await Promise.all([
          getDocs(subColPath("consultations")),
          getDocs(subColPath("examens")),
          getDocs(subColPath("ordonnances")),
          getDocs(subColPath("recommandations"))
        ]);

        // Mapping des résultats des sous-collections
        newData.consultations = snapSubConsult.docs.map(d => ({
          id: d.id, ...d.data(), dateObj: d.data().createdAt?.toDate() || d.data().date || new Date()
        }));

        newData.examens = snapSubExam.docs.map(d => ({
          id: d.id, ...d.data(), dateObj: d.data().createdAt?.toDate() || d.data().date || new Date()
        }));

        const subOrd = snapSubOrd.docs.map(d => ({
          id: d.id, ...d.data(), dateObj: d.data().createdAt?.toDate() || new Date()
        }));

        const subRec = snapSubRec.docs.map(d => ({
          id: d.id, ...d.data(), dateObj: d.data().createdAt?.toDate() || new Date()
        }));

        // --- 3. FUSION ET TRI ---
        // On combine les données trouvées en racine et en sous-collection
        newData.ordonnances = [...rootOrd, ...subOrd];
        newData.recommandations = [...rootRec, ...subRec];

        // Tri final chronologique (plus récent en premier) pour chaque catégorie
        Object.keys(newData).forEach(key => {
          newData[key].sort((a, b) => b.dateObj - a.dateObj);
        });

        setData(newData);
      } catch (err) {
        console.error("Erreur lors du scan des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const renderContent = () => {
    const currentData = data[activeTab];

    if (currentData.length === 0) {
      return (
        <div className="empty-state">
          <FaExclamationCircle className="empty-icon" style={{ color: '#cbd5e0', fontSize: '3rem' }} />
          <p>Aucun document trouvé dans la catégorie <strong>{activeTab}</strong>.</p>
        </div>
      );
    }

    return (
      <div className="medical-grid">
        {currentData.map((item) => (
          <div key={item.id} className="medical-card shadow-sm">
            <div className="card-header-flex">
              <span className="date-badge">
                {item.dateObj ? new Date(item.dateObj).toLocaleDateString('fr-FR') : "Date inconnue"}
              </span>
              <span className="type-tag">{activeTab}</span>
            </div>

            <div className="card-body-content">
              <h4 className="doctor-name">{item.doctorName || item.medecinName || "Médecin Sama Docteur"}</h4>
              <p className="main-text">
                {item.medicaments || item.message || item.rapport || "Contenu confidentiel"}
              </p>
              {item.instructions && <p className="sub-text"><strong>Note :</strong> {item.instructions}</p>}
            </div>

            {(item.fichier || item.signature) && (
              <button className="download-action-btn" onClick={() => window.open(item.fichier || item.signature)}>
                <FaDownload /> Voir / Télécharger
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="mt-3 fw-bold" style={{ color: '#00a5a8' }}>Sécurisation de vos données de santé...</p>
    </div>
  );

  return (
    <div className="medical-dossier-wrapper">
      <header className="dossier-header shadow-sm">
        <div className="container d-flex align-items-center justify-content-between">
          <Button
            label={<><FaArrowLeft className="me-2" /> Accueil</>}
            variant="register"
            onClick={() => navigate("/home-patient")}
            className="btn-back"
          />
          <h2 className="title-modern text-teal">📂 Mon Espace Santé</h2>
          <div style={{ width: '100px' }} className="d-none d-md-block"></div>
        </div>
      </header>

      <div className="container mt-4">
        <div className="modern-tabs">
          <button className={activeTab === 'consultations' ? 'active' : ''} onClick={() => setActiveTab('consultations')}>
            <FaStethoscope /> <span className="d-none d-md-inline">Consultations</span>
          </button>
          <button className={activeTab === 'examens' ? 'active' : ''} onClick={() => setActiveTab('examens')}>
            <FaFlask /> <span className="d-none d-md-inline">Examens</span>
          </button>
          <button className={activeTab === 'ordonnances' ? 'active' : ''} onClick={() => setActiveTab('ordonnances')}>
            <FaPills /> <span className="d-none d-md-inline">Ordonnances</span>
          </button>
          <button className={activeTab === 'recommandations' ? 'active' : ''} onClick={() => setActiveTab('recommandations')}>
            <FaClipboardList /> <span className="d-none d-md-inline">Conseils</span>
          </button>
        </div>

        <main className="dossier-content animate-fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DossierMedical;