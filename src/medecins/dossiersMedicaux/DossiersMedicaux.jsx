// src/pages/DossiersMedicaux.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./DossiersMedicaux.css";

const DossiersMedicaux = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    prenom: "",
    nom: "",
    dateNaissance: "",
    lieuNaissance: "",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [errors, setErrors] = useState({});

  // 🔹 Récupération des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "patient")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(data);
      } catch (err) {
        console.error("Erreur récupération patients :", err);
      }
    };

    fetchPatients();
  }, []);

  // 🔹 Récupération des dossiers du médecin connecté
  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "dossiersMedicaux"),
          where("medecinId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDossiers(data);
      } catch (err) {
        console.error("Erreur récupération dossiers :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, []);

  // 🔹 Remplissage automatique des champs quand un patient est sélectionné
  useEffect(() => {
    if (!formData.patientId) return;
    const selectedPatient = patients.find((p) => p.id === formData.patientId);
    if (selectedPatient) {
      setFormData((prev) => ({
        ...prev,
        prenom: selectedPatient.prenom || "",
        nom: selectedPatient.nom || "",
        dateNaissance: selectedPatient.dateNaissance || "",
        lieuNaissance: selectedPatient.lieuNaissance || "",
        email: selectedPatient.email || "",
        telephone: selectedPatient.telephone || "",
        adresse: selectedPatient.adresse || "",
      }));
    }
  }, [formData.patientId, patients]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCreateDossier = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      setErrors({ ...errors, patientId: "Veuillez sélectionner un patient." });
      return;
    }
    setCreating(true);
    try {
      await addDoc(collection(db, "dossiersMedicaux"), {
        ...formData,
        medecinId: auth.currentUser.uid, // lien avec le médecin connecté
        createdAt: serverTimestamp(),
      });

      // Reset formulaire
      setFormData({
        patientId: "",
        prenom: "",
        nom: "",
        dateNaissance: "",
        lieuNaissance: "",
        email: "",
        telephone: "",
        adresse: "",
      });

      // Rafraîchir la liste des dossiers
      const q = query(
        collection(db, "dossiersMedicaux"),
        where("medecinId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      setDossiers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Erreur création dossier :", err);
    } finally {
      setCreating(false);
    }
  };

  const inputGroupClass = (field) =>
    `input-group mb-3 ${
      errors[field] ? "border border-danger rounded-pill" : ""
    }`;

  const inputClass = "form-control border-0 px-3 py-2";

  return (
    <div className="container mt-4">
      {/* Bouton retour */}
      <div className="mb-4">
        <Link to="/home-medecin" className="btn btn-custom rounded-pill">
          <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
        </Link>
      </div>

      <h2 className="text-center mb-4">📂 Dossiers Médicaux</h2>

      {/* Formulaire création dossier */}
      <div className="card shadow-lg p-4 border-0 rounded-4 mb-5">
        <h5 className="text-primary mb-3">Créer un nouveau dossier</h5>
        <form onSubmit={handleCreateDossier}>
          {/* Sélection patient */}
          <div className={inputGroupClass("patientId")}>
            <span className="input-group-text bg-white rounded-start-pill">
              <i className="fa fa-user"></i>
            </span>
            <select
              name="patientId"
              className="form-select border-0"
              value={formData.patientId}
              onChange={handleInputChange}
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom} ({p.email})
                </option>
              ))}
            </select>
          </div>
          {errors.patientId && (
            <small className="text-danger">{errors.patientId}</small>
          )}

          {/* Prénom et Nom */}
          <div className="row">
            <div className="col-md-6">
              <div className={inputGroupClass("prenom")}>
                <span className="input-group-text bg-white rounded-start-pill">
                  <i className="fa fa-user"></i>
                </span>
                <input
                  type="text"
                  name="prenom"
                  className={inputClass}
                  value={formData.prenom}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className={inputGroupClass("nom")}>
                <span className="input-group-text bg-white rounded-start-pill">
                  <i className="fa fa-user"></i>
                </span>
                <input
                  type="text"
                  name="nom"
                  className={inputClass}
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Nom"
                />
              </div>
            </div>
          </div>

          {/* Date de naissance et lieu */}
          <div className="row">
            <div className="col-md-6">
              <div className={inputGroupClass("dateNaissance")}>
                <span className="input-group-text bg-white rounded-start-pill">
                  <i className="fa fa-calendar"></i>
                </span>
                <input
                  type="date"
                  name="dateNaissance"
                  className={inputClass}
                  value={formData.dateNaissance}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className={inputGroupClass("lieuNaissance")}>
                <span className="input-group-text bg-white rounded-start-pill">
                  <i className="fa fa-map-marker"></i>
                </span>
                <input
                  type="text"
                  name="lieuNaissance"
                  className={inputClass}
                  value={formData.lieuNaissance}
                  onChange={handleInputChange}
                  placeholder="Lieu de naissance"
                />
              </div>
            </div>
          </div>

          {/* Email et téléphone */}
          <div className="row">
            <div className="col-md-6">
              <div className={inputGroupClass("email")}>
                <span className="input-group-text bg-white rounded-start-pill">
                  <i className="fa fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className={inputClass}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className={inputGroupClass("telephone")}>
                <span className="input-group-text bg-white rounded-start-pill">
                  <i className="fa fa-phone"></i>
                </span>
                <input
                  type="text"
                  name="telephone"
                  className={inputClass}
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="Téléphone"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className={inputGroupClass("adresse")}>
            <span className="input-group-text bg-white rounded-start-pill">
              <i className="fa fa-map"></i>
            </span>
            <input
              type="text"
              name="adresse"
              className={inputClass}
              value={formData.adresse}
              onChange={handleInputChange}
              placeholder="Adresse"
            />
          </div>

          {/* Bouton créer */}
          <div className="text-end">
            <button
              type="submit"
              className="btn btn-success rounded-pill"
              disabled={creating}
            >
              {creating ? "Création..." : "Créer le dossier"}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des dossiers */}
      {loading ? (
        <p className="text-center">Chargement des dossiers médicaux...</p>
      ) : dossiers.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucun dossier médical disponible.
        </div>
      ) : (
        <div className="row">
          {dossiers.map((dossier) => (
            <div key={dossier.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">
                    {dossier.prenom} {dossier.nom}
                  </h5>
                  <p>
                    <strong>Date de naissance :</strong>{" "}
                    {dossier.dateNaissance
                      ? new Date(dossier.dateNaissance).toLocaleDateString(
                          "fr-FR"
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Lieu de naissance :</strong>{" "}
                    {dossier.lieuNaissance || "N/A"}
                  </p>
                  <p>
                    <strong>Email :</strong> {dossier.email || "N/A"}
                  </p>
                  <p>
                    <strong>Téléphone :</strong> {dossier.telephone || "N/A"}
                  </p>
                  <p>
                    <strong>Adresse :</strong> {dossier.adresse || "N/A"}
                  </p>

                  {/* Boutons pour accéder aux données du patient */}
                  <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        navigate(`/ordonnances-patient/${dossier.patientId}`)
                      }
                    >
                      Voir Ordonnances
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={() =>
                        navigate(`/examens-patient/${dossier.patientId}`)
                      }
                    >
                      Voir Examens
                    </button>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate(
                          `/recommandations-patient/${dossier.patientId}`
                        )
                      }
                    >
                      Voir Recommandations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DossiersMedicaux;
