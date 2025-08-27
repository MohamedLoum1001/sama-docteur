// src/patients/home/HomePatient.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Navbar from "../../components/Navbar/Nabar";
import { FaUserInjured, FaSearch } from "react-icons/fa";
import "./HomePatient.css";

const HomePatient = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Rendez-vous à venir
  const upcomingAppointments = useMemo(
    () => [
      {
        id: 1,
        date: new Date("2025-08-30T10:00:00"),
        doctor: "Dr. Smith",
        speciality: "Cardiologue",
      },
      {
        id: 2,
        date: new Date("2025-09-02T14:30:00"),
        doctor: "Dr. John",
        speciality: "Dermatologue",
      },
      {
        id: 3,
        date: new Date("2025-09-05T09:00:00"),
        doctor: "Dr. Lee",
        speciality: "Dentiste",
      },
    ],
    []
  );

  // Vérification des rendez-vous
  useEffect(() => {
    const now = new Date();
    upcomingAppointments.forEach((appt) => {
      const timeUntilAppointment = appt.date.getTime() - now.getTime();
      if (timeUntilAppointment > 0 && timeUntilAppointment <= 30 * 60 * 1000) {
        alert(
          `Rappel : Vous avez un rendez-vous avec ${appt.doctor}\nSpécialité: ${
            appt.speciality
          } - À ${appt.date.toLocaleTimeString()}`
        );
      }
    });
  }, [upcomingAppointments]);

  // Cartes principales
  const cards = [
    {
      emoji: "👤",
      title: "Gérer mon profil",
      description:
        "Mettez à jour vos informations personnelles et consultez votre historique médical.",
      button: "Accéder",
      link: "/profil",
      color: "#00a5a8",
    },
    {
      emoji: "📅",
      title: "Prendre un rendez-vous",
      description:
        "Choisissez une spécialité, un médecin et une date disponible.",
      button: "Prendre rendez-vous",
      action: () => navigate("/rendez-vous"),
      color: "#00a5a8",
    },
    {
      emoji: "🎟️",
      title: "Tickets",
      description:
        "Voir tous vos tickets achetés, leur statut et l'historique de vos achats.",
      button: "Voir mes tickets",
      link: "/ticket-acheter",
      color: "#00a5a8",
    },
    {
      emoji: "📹",
      title: "Consultation en ligne",
      description: "Lancez une séance vidéo avec votre médecin.",
      button: "Rejoindre la consultation",
      link: "/consultation",
      color: "#00a5a8",
    },
    {
      emoji: "🔔",
      title: "Notifications & rappels",
      description: "Recevez des rappels pour vos rendez-vous médicaux.",
      button: "Voir les rappels",
      link: "/notifications",
      color: "#00a5a8",
    },
    {
      emoji: "💊",
      title: "Mes ordonnances",
      description:
        "Consultez vos ordonnances électroniques et téléchargez-les.",
      button: "Accéder aux ordonnances",
      link: "/ordonnances",
      color: "#00a5a8",
    },
    {
      emoji: "📁",
      title: "Mon dossier médical",
      description: "Accédez à vos consultations, examens, et prescriptions.",
      button: "Voir le dossier",
      link: "/dossier-medical",
      color: "#00a5a8",
    },
    {
      emoji: "⭐",
      title: "Laisser un avis",
      description: "Évaluez votre médecin et laissez un commentaire.",
      button: "Donner mon avis",
      link: "/avis",
      color: "#00a5a8",
    },
  ];

  // 🔎 Filtrage par spécialité
  const filteredDoctors = upcomingAppointments.filter((appt) =>
    appt.speciality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4">

      {/* Titre avec icône */}
      <div className="mt-12 py-5 flex items-center justify-center gap-3">
        <FaUserInjured className="text-primary text-3xl" />
        <h2 className="font-bold text-2xl text-primary">
          Bienvenue sur votre espace patient
        </h2>
      </div>

      {/* Barre de recherche */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un docteur par spécialité..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Résultats filtrés */}
      {searchTerm && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            Résultats pour "{searchTerm}" :
          </h3>
          {filteredDoctors.length > 0 ? (
            <ul className="list-disc pl-5">
              {filteredDoctors.map((doc) => (
                <li key={doc.id}>
                  {doc.doctor} - {doc.speciality}
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun docteur trouvé pour cette spécialité.</p>
          )}
        </div>
      )}

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="shadow-lg rounded-2xl border-0 bg-white h-full"
          >
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                <h5 className="text-lg font-semibold">
                  {card.emoji} {card.title}
                </h5>
                <p className="text-gray-600 mt-2">{card.description}</p>
              </div>
              <button
                className="mt-4 text-white py-2 px-4 rounded-xl transition btn-custom"
                style={{ backgroundColor: card.color }}
                onClick={() =>
                  card.action ? card.action() : navigate(card.link)
                }
              >
                {card.button}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePatient;
