// src/medecin/ProfilMedecin.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// import Disponibilites from "./Disponibilites";

const ProfilMedecin = () => {
  const navigate = useNavigate();

  // État du médecin (infos personnelles)
  const [medecin, setMedecin] = useState({
    nom: "",
    prenom: "",
    specialite: "",
    email: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(true);

  // Récupérer les infos du médecin connecté
  useEffect(() => {
    const fetchMedecin = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setMedecin({
          nom: data.nom || "",
          prenom: data.prenom || "",
          specialite: data.specialite || "",
          email: data.email || user.email || "",
          telephone: data.telephone || "",
        });
      }
      setLoading(false);
    };
    fetchMedecin();
  }, []);

  // Navigation retour
  const goBack = () => {
    navigate("/home-medecin");
  };

  // Gestion de la mise à jour du formulaire profil
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedecin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, {
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      email: medecin.email,
      telephone: medecin.telephone,
    });
    alert("✅ Profil mis à jour avec succès !");
  };

  return (
    <div className="container py-4">
      {/* Bouton retour */}
      <div className="mb-0 flex items-start">
        <button className="btn btn-custom rounded-pill" onClick={goBack}>
          <i className="bi bi-arrow-left me-2"></i>Retour à l'accueil
        </button>
      </div>

      {/* Titre */}
      <h2 className="text-center fw-bold text-primary mb-4">
        👨‍⚕️ Profil Médecin
      </h2>

      {/* Informations personnelles */}
      <div className="card shadow-lg border-0 rounded-4 mb-5">
        <div className="card-body">
          <h5 className="card-title text-secondary fw-bold mb-3">
            📋 Informations personnelles
          </h5>
          {loading ? (
            <div className="text-center text-muted">Chargement...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-left w-100">Nom</label>
                <input
                  type="text"
                  name="nom"
                  className="form-control rounded-pill"
                  value={medecin.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-left w-100">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  className="form-control rounded-pill"
                  value={medecin.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-left w-100">Spécialité</label>
                <input
                  type="text"
                  name="specialite"
                  className="form-control rounded-pill"
                  value={medecin.specialite}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-left w-100">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control rounded-pill"
                  value={medecin.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-left w-100">Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  className="form-control rounded-pill"
                  value={medecin.telephone}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-custom rounded-pill mt-2">
                💾 Enregistrer les modifications
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Disponibilités supprimées du profil */}
    </div>
  );
};

export default ProfilMedecin;
