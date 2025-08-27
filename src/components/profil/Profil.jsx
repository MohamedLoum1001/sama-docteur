// src/patients/Profil/Profil.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profil.css";

const Profil = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    prenom: "Mohamed",
    nom: "LOUM",
    email: "mohamed@example.com",
    telephone: "123456789",
    adresse: "Dakar, Sénégal",
    photo: "https://via.placeholder.com/150/00a5a8/ffffff?text=Avatar",
  });

  const [historique] = useState([
    { date: "2025-01-10", description: "Consultation cardiologie" },
    { date: "2025-03-15", description: "Examen dermatologie" },
  ]);

  const [photoUpdated, setPhotoUpdated] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profil mis à jour ✅");
  };

  return (
    <div className="container mx-auto px-2 mt-2">
      {/* Bouton Retour aligné à gauche */}
      <div className="mb-4 flex items-start">
        <button
          className="btn custom-btn rounded-pill"
          onClick={() => navigate("/home-patient")}
        >
          <i className="fa fa-arrow-left me-2"></i> Retour à l’accueil
        </button>
      </div>

      {/* Photo de profil */}
      <div className="text-center mb-4 relative">
        <div className="relative inline-block w-32 h-32">
          <img
            src={user.photo}
            alt="Profil"
            className={`rounded-full w-32 h-32 object-cover border-4 border-primary transition-transform duration-300 ${
              photoUpdated ? "scale-105" : ""
            }`}
          />
          {/* Cercle caméra */}
          <label
            htmlFor="photoUpload"
            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-blue-600 transition"
            title="Ajouter / Modifier"
          >
            <i className="fa fa-camera text-white"></i>
          </label>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setUser((prev) => ({ ...prev, photo: reader.result }));
                  setPhotoUpdated(true);
                  setTimeout(() => setPhotoUpdated(false), 300);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
        <h3 className="fw-bold text-primary mt-2">👤 Mon profil</h3>
      </div>

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
                onChange={(e) =>
                  setUser({ ...user, telephone: e.target.value })
                }
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
