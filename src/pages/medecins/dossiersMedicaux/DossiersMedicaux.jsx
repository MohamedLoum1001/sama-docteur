import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaArrowLeft, FaFolderPlus, FaCalendarAlt,
  FaEnvelope, FaFileMedical,
  FaSearch, FaClipboardList
} from "react-icons/fa";
import Button from "../../../components/boutons/Button"; // ✅ Import de ton composant Button
import "./DossiersMedicaux.css";

const DossiersMedicaux = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userString = localStorage.getItem("user");
  const userMedecin = userString ? JSON.parse(userString) : null;
  const medecinId = userMedecin?.uid || userMedecin?.id;

  const [formData, setFormData] = useState({
    patientId: "",
    prenom: "",
    nom: "",
    dateNaissance: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  // ✅ Formate les dates Firebase pour éviter le crash "Objects are not valid as React child"
  const formatFirebaseDate = (dateObj) => {
    if (!dateObj) return "Date non disponible";
    if (dateObj.seconds) {
      return new Date(dateObj.seconds * 1000).toLocaleDateString("fr-FR");
    }
    return typeof dateObj === "string" ? dateObj : "Format invalide";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!medecinId) return;
      try {
        const qPatients = query(collection(db, "users"), where("role", "==", "patient"));
        const snapPatients = await getDocs(qPatients);
        setPatients(snapPatients.docs.map(d => ({ id: d.id, ...d.data() })));

        const qDossiers = query(collection(db, "dossiersMedicaux"), where("medecinId", "==", medecinId));
        const snapDossiers = await getDocs(qDossiers);
        const list = snapDossiers.docs.map(d => ({ id: d.id, ...d.data() }));

        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setDossiers(list);
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [medecinId]);

  const handlePatientSelect = (e) => {
    const pId = e.target.value;
    const patient = patients.find(p => p.id === pId);
    if (patient) {
      setFormData({
        patientId: pId,
        prenom: patient.prenom || "",
        nom: patient.nom || "",
        dateNaissance: patient.dateNaissance || "",
        email: patient.email || "",
        telephone: patient.telephone || "",
        adresse: patient.adresse || "",
      });
    }
  };

  const handleCreateDossier = async (e) => {
    e.preventDefault();
    if (!formData.patientId) return alert("Sélectionnez un patient");
    setCreating(true);
    try {
      await addDoc(collection(db, "dossiersMedicaux"), {
        ...formData,
        medecinId,
        createdAt: serverTimestamp(),
      });
      alert("Dossier médical créé avec succès ! ✅");
      window.location.reload();
    } catch (err) {
      console.error("Erreur création:", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredDossiers = dossiers.filter(d =>
    `${d.prenom} ${d.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dm-container bg-light min-vh-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-4">
          {/* ✅ Utilisation du composant Button pour le retour */}
          <Button
            label={<><FaArrowLeft className="me-2" /> Retour</>}
            variant="register"
            onClick={() => navigate("/medecin")}
            className="px-4 fw-bold"
          />
          <h2 className="fw-bold text-dark m-0">📂 Dossiers Médicaux</h2>
        </div>

        <div className="row g-4">
          {/* FORMULAIRE DE CRÉATION */}
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="p-3 text-white text-center fw-bold" style={{ backgroundColor: '#00a5a8' }}>
                <FaFolderPlus className="me-2" /> Nouveau dossier
              </div>
              <form onSubmit={handleCreateDossier} className="p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">PATIENT</label>
                  <select className="form-select border-2" onChange={handlePatientSelect} required>
                    <option value="">-- Sélectionner un patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                  </select>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">PRÉNOM</label>
                    <input type="text" className="form-control bg-light" value={formData.prenom} readOnly />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">NOM</label>
                    <input type="text" className="form-control bg-light" value={formData.nom} readOnly />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold">EMAIL</label>
                  <input type="text" className="form-control bg-light" value={formData.email} readOnly />
                </div>

                {/* ✅ Utilisation du composant Button pour la soumission */}
                <Button
                  type="submit"
                  label={creating ? "Patientez..." : "Créer le dossier"}
                  variant="login"
                  className="w-100 py-2 shadow-sm"
                  loading={creating}
                />
              </form>
            </div>
          </div>

          {/* LISTE DES DOSSIERS */}
          <div className="col-lg-7">
            <div className="position-relative mb-4">
              <FaSearch className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#00a5a8' }} />
              <input
                type="text"
                className="form-control border-2 p-3 ps-5 rounded-pill shadow-sm"
                style={{ borderColor: '#00a5a8' }}
                placeholder="Rechercher un dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="dm-scroll-area pe-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {loading ? (
                <p className="text-center py-5 text-teal">Chargement...</p>
              ) : filteredDossiers.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border shadow-sm">Aucun dossier trouvé</div>
              ) : (
                filteredDossiers.map(d => (
                  <div key={d.id} className="card mb-3 shadow-sm border-0 rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '50px', height: '50px', backgroundColor: '#00a5a8', flexShrink: 0 }}>
                          {d.prenom?.[0]}{d.nom?.[0]}
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="fw-bold m-0 text-dark">{d.prenom} {d.nom}</h5>
                          <div className="small text-secondary mt-1">
                            <span><FaEnvelope className="me-1" /> {d.email}</span>
                          </div>
                          <p className="m-0 mt-2 text-teal small fw-bold">
                            Créé le : {formatFirebaseDate(d.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        {/* ✅ Utilisation du composant Button pour les actions */}
                        <Button
                          label={<><FaFileMedical className="me-1" /> Ordonnances</>}
                          variant="register"
                          onClick={() => navigate(`/ordonnances-patient/${d.patientId}`)}
                          className="btn-sm flex-grow-1 border-teal text-teal"
                        />
                        <Button
                          label={<><FaClipboardList className="me-1" /> Examens</>}
                          variant="register"
                          onClick={() => navigate(`/examens-patient/${d.patientId}`)}
                          className="btn-sm flex-grow-1 border-warning text-warning"
                          style={{ borderColor: '#ffc107', color: '#856404' }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DossiersMedicaux;