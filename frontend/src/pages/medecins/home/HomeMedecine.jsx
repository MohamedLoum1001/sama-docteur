// src/pages/HomeMedecin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FaUserMd, FaSearch, FaUserInjured } from "react-icons/fa";
import Button from "../../../components/boutons/Button";
import "./HomeMedecin.css";

// Service de notification simulé
const NotificationService = {
  requestPermission: () => {
    console.log("Demande de permission pour notifications...");
  },
  sendNotification: (title, message) => {
    alert(`${title}\n${message}`);
  },
};

const HomeMedecin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [patientsFromDB, setPatientsFromDB] = useState([]);

  useEffect(() => {
    NotificationService.requestPermission();

    // Récupérer uniquement les patients
    const q = query(collection(db, "users"), where("role", "==", "patient"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatientsFromDB(docs);
    });
    return () => unsubscribe();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    return patientsFromDB.filter(
      (p) =>
        (p.prenom && p.prenom.toLowerCase().includes(term)) ||
        (p.nom && p.nom.toLowerCase().includes(term))
    );
  }, [searchTerm, patientsFromDB]);

  const sendReminders = () => {
    NotificationService.sendNotification(
      "Rappel envoyé",
      "Les rappels ont été envoyés aux patients pour leurs rendez-vous."
    );
  };

  const cards = [
    { title: "Gérer mon profil", description: "Modifier vos informations personnelles.", link: "/profil-medecin" },
    { title: "Disponibilités", description: "Définir ou modifier vos horaires de consultation.", link: "/disponibilites" },
    { title: "Rendez-vous", description: "Consulter la liste de vos rendez-vous à venir.", link: "/liste-rendez-vous" },
    { title: "Consultation", description: "Effectuer une consultation via un appel vidéo sécurisé.", link: "/consultation" },
    { title: "Prescrire", description: "Créer une ordonnance électronique pour un patient.", link: "/prescription" },
    { title: "Dossiers", description: "Accéder à l’historique des dossiers médicaux.", link: "/dossiers-medicaux" },
    { title: "Rappels", description: "Envoyer des rappels de RDV aux patients.", action: () => sendReminders() },
    { title: "Conseils", description: "Fournir des recommandations post-consultation.", link: "/recommandation" },
  ];

  return (
    <div className="home-medecin-wrapper">
      <div className="container mx-auto px-4 pb-12">

        {/* Header Section */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2">
          <FaUserMd className="text-teal-600 text-5xl mb-2" />
          <h2 className="font-extrabold text-3xl text-gray-800 text-center">
            Bienvenue sur votre espace médecin
          </h2>
          <p className="text-gray-500">Recherchez un dossier patient ou gérez votre activité</p>
        </div>

        {/* Barre de recherche Patients */}
        <div className="flex flex-col items-center mb-10 relative">
          <div className="relative w-full max-w-xl">
            <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un patient par nom ou prénom..."
              className="pl-12 pr-4 py-4 w-full border-2 border-gray-100 rounded-2xl shadow-xl focus:outline-none focus:border-teal-500 transition-all text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <div className="absolute w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 mt-2">
                <div className="p-3 bg-gray-50 border-bottom">
                  <span className="text-sm font-bold text-gray-600">
                    {filteredPatients.length} patient(s) trouvé(s)
                  </span>
                </div>

                {filteredPatients.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 hover:bg-teal-50 cursor-pointer flex justify-between items-center border-b last:border-b-0 transition"
                        onClick={() => {
                          navigate(`/patient-profile/${p.id}`);
                          setSearchTerm("");
                        }}
                      >
                        <div className="flex items-center">
                          <img
                            src={p.photo || `https://ui-avatars.com/api/?name=${p.prenom}+${p.nom}&background=00a5a8&color=fff`}
                            className="rounded-full mr-3"
                            style={{ width: "45px", height: "45px", objectFit: "cover" }}
                            alt="avatar"
                          />
                          <div className="text-left">
                            <div className="font-bold text-gray-800">
                              {p.prenom} {p.nom}
                            </div>
                            <div className="text-sm text-gray-500">Patient</div>
                          </div>
                        </div>
                        <FaUserInjured className="text-teal-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400 italic">
                    Aucun patient trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Grille des fonctionnalités */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="group p-6 bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-50 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">{card.description}</p>
              </div>

              <Button
                label="Accéder"
                variant="login"
                className="w-full py-2 text-sm"
                onClick={() => card.action ? card.action() : navigate(card.link)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeMedecin;