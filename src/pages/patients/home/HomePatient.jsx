// src/patients/home/HomePatient.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  FaUserInjured,
  FaSearch,
  FaCalendarPlus,
  FaPills,
  FaFilePrescription // ✅ Import de l'icône Ordonnances
} from "react-icons/fa";
import Button from "../../../components/boutons/Button";
import "./HomePatient.css";

const HomePatient = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorsFromDB, setDoctorsFromDB] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "medecin"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctorsFromDB(docs);
    });
    return () => unsubscribe();
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    return doctorsFromDB.filter(
      (doc) =>
        (doc.prenom && doc.prenom.toLowerCase().includes(term)) ||
        (doc.nom && doc.nom.toLowerCase().includes(term)) ||
        (doc.specialite && doc.specialite.toLowerCase().includes(term))
    );
  }, [searchTerm, doctorsFromDB]);

  // ✅ Liste des cartes mise à jour avec Pharmacie et Ordonnances
  const cards = [
    { emoji: "👤", title: "Gérer mon profil", description: "Mettez à jour vos informations et historique.", link: "/profil" },
    { emoji: "📅", title: "Prendre RDV", description: "Choisissez un médecin et une date disponible.", action: () => navigate("/rendez-vous") },
    { emoji: "💊", title: "Pharmacie", description: "Trouvez un médicament au meilleur prix près de chez vous.", link: "/pharmacie" },
    { emoji: "🧾", title: "Mes Ordonnances", description: "Consultez et téléchargez vos prescriptions médicales.", link: "/ordonnances" },
    { emoji: "🎟️", title: "Tickets", description: "Consultez vos tickets et historique d'achats.", link: "/ticket-acheter" },
    { emoji: "🔔", title: "Notifications", description: "Recevez des rappels pour vos soins.", link: "/notifications" },
    { emoji: "📁", title: "Mon dossier médical", description: "Accédez à vos examens et prescriptions.", link: "/dossier-medical" },
  ];

  return (
    <div className="home-patient-wrapper">
      <div className="container mx-auto px-4 pb-12">

        <div className="mt-5 flex flex-col items-center justify-center gap-2">
          <FaUserInjured className="text-teal-600 text-5xl mb-2" />
          <h2 className="font-extrabold text-3xl text-gray-800 text-center">
            Bienvenue sur votre espace patient
          </h2>
          <p className="text-gray-500">Recherchez un praticien ou accédez à nos services</p>
        </div>

        {/* Barre de recherche */}
        <div className="flex flex-col items-center mb-10 position-relative">
          <div className="relative w-full max-w-xl">
            <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou spécialité..."
              className="pl-12 pr-4 py-4 w-full border-2 border-gray-100 rounded-2xl shadow-xl focus:outline-none focus:border-teal-500 transition-all text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <div
                className="position-absolute w-100 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-10"
                style={{ top: "100%", marginTop: "10px", left: 0, zIndex: 1000 }}
              >
                <div className="p-3 bg-gray-50 border-bottom">
                  <span className="text-sm font-bold text-gray-600">
                    {filteredDoctors.length} médecin(s) trouvé(s)
                  </span>
                </div>

                {filteredDoctors.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {filteredDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-teal-50 cursor-pointer flex justify-between items-center border-b last:border-b-0 transition"
                        onClick={() => {
                          navigate(`/doctor-profile/${doc.id}`);
                          setSearchTerm("");
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={doc.photo || `https://ui-avatars.com/api/?name=${doc.prenom}+${doc.nom}&background=00a5a8&color=fff`}
                            className="rounded-circle me-3"
                            style={{ width: "45px", height: "45px", objectFit: "cover" }}
                            alt="avatar"
                          />
                          <div className="text-start">
                            <div className="font-bold text-gray-800" style={{ fontSize: "0.95rem" }}>
                              Dr. {doc.prenom} {doc.nom}
                            </div>
                            <div className="text-sm text-teal-600 fw-medium">
                              {doc.specialite || "Généraliste"}
                            </div>
                          </div>
                        </div>
                        <FaCalendarPlus className="text-teal-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 italic">
                    Aucun résultat trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Grille des fonctionnalités */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div key={index} className="group p-8 bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-50 flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.emoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{card.description}</p>
              </div>

              <Button
                label="Découvrir"
                variant="login"
                className="w-full py-3"
                onClick={() => card.action ? card.action() : navigate(card.link)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePatient;