import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./Profil.css";

// Cloudinary config
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const Profil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    photo: "https://via.placeholder.com/150/00a5a8/ffffff?text=Avatar",
  });
  const [historique] = useState([
    { date: "2025-01-10", description: "Consultation cardiologie" },
    { date: "2025-03-15", description: "Examen dermatologie" },
  ]);
  const [photoUpdated, setPhotoUpdated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser((prev) => ({
              ...prev,
              ...userDoc.data(),
              email: currentUser.email || userDoc.data().email || "",
              photo: userDoc.data().photo || prev.photo,
            }));
          }
        }
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchUser();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.secure_url) {
            setUser((prev) => ({ ...prev, photo: data.secure_url }));
            setPhotoUpdated(true);
            setTimeout(() => setPhotoUpdated(false), 300);
            // Update Firestore with new photo URL
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
              const userRef = doc(db, "users", currentUser.uid);
              updateDoc(userRef, { photo: data.secure_url });
            }
          }
        })
        .catch(() => {
          // Optionally handle error
        });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profil mis à jour ✅");
  };

  return (
    <div className="container mx-auto px-2 mt-5">
      {/* Bouton Retour aligné à gauche */}
      <div className="mb-4 flex items-start">
        <button
          className="btn custom-btn rounded-pill"
          onClick={() => navigate("/home-patient")}
        >
          <i className="fa fa-arrow-left me-2"></i> Retour à l’accueil
        </button>
      </div>
      <h3 className="fw-bold text-primary mt-2">👤 Mon profil</h3>

      {/* Formulaire */}
      <div className="card shadow-lg p-4 border-0 rounded-4 mb-5">
        <form onSubmit={handleUpdate}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-left w-100">Prénom</label>
              <input
                type="text"
                className="form-control rounded-pill py-2"
                value={user.prenom}
                onChange={(e) => setUser({ ...user, prenom: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-left w-100">Nom</label>
              <input
                type="text"
                className="form-control rounded-pill py-2"
                value={user.nom}
                onChange={(e) => setUser({ ...user, nom: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-left w-100">Email</label>
              <input
                type="email"
                className="form-control rounded-pill py-2"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-left w-100">Téléphone</label>
              <input
                type="text"
                className="form-control rounded-pill py-2"
                value={user.telephone}
                onChange={(e) => setUser({ ...user, telephone: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-left w-100">Adresse</label>
              <input
                type="text"
                className="form-control rounded-pill py-2"
                value={user.adresse}
                onChange={(e) => setUser({ ...user, adresse: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn custom-btn w-100 mt-4 rounded-pill text-white"
            style={{ backgroundColor: "#00a5a8" }}
          >
            Mettre à jour
          </button>
        </form>
      </div>

      {/* Historique médical */}
      <div className="card shadow-sm p-4 rounded-4 border-0">
        <h4 className="mb-3 text-primary">📚 Historique médical</h4>
        <ul className="list-group list-group-flush">
          {historique.map((item, index) => (
            <li key={index} className="list-group-item">
              <strong>{item.date}</strong> — {item.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profil;