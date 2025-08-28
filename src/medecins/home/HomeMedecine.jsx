// src/pages/HomeMedecin.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeMedecin.css"

// Exemple de service de notification simulé (tu peux le remplacer par ton vrai service)
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

  const sendReminders = () => {
    NotificationService.sendNotification(
      "📅 Rappel envoyé",
      "Les rappels ont été envoyés aux patients pour leurs rendez-vous."
    );
  };

  const cards = [
    {
      emoji: "👤",
      title: "Gérer mon profil",
      description:
        "Modifier vos informations personnelles et définir vos disponibilités.",
      button: "Accéder",
      link: "/profil-medecin",
      color: "#00a5a8",
    },
    {
      emoji: "📅",
      title: "Rendez-vous programmés",
      description: "Consulter la liste complète de vos rendez-vous à venir.",
      button: "Voir mes rendez-vous",
      link: "/liste-rendez-vous",
      color: "#00a5a8",
    },
    {
      emoji: "📹",
      title: "Consultation en ligne",
      description: "Effectuer une consultation via un appel vidéo sécurisé.",
      button: "Démarrer",
      link: "/consultation-video",
      color: "#00a5a8",
    },
    {
      emoji: "📝",
      title: "Prescrire une ordonnance",
      description: "Créer une ordonnance électronique et l’envoyer au patient.",
      button: "Prescrire",
      link: "/prescription",
      color: "#00a5a8",
    },
    {
      emoji: "📚",
      title: "Historique médical",
      description:
        "Accéder à l’historique des consultations et aux dossiers médicaux.",
      button: "Consulter",
      link: "/dossiers-medicaux",
      color: "#00a5a8",
    },
    {
      emoji: "🔔",
      title: "Notifications & rappels",
      description: "Envoyer des rappels aux patients pour leurs rendez-vous.",
      button: "Envoyer",
      action: () => sendReminders(),
      color: "#00a5a8",
    },
    {
      emoji: "💡",
      title: "Recommandations médicales",
      description:
        "Fournir des conseils ou recommandations après la consultation.",
      button: "Fournir",
      link: "/recommandation",
      color: "#00a5a8",
    },
  ];

  const goTo = (path) => {
    navigate(path);
  };

  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-center mb-10 font-bold text-2xl text-teal-600">
        Bienvenue sur votre espace médecin 👨‍⚕️
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {cards.map((card, index) => (
          <div
            key={index}
            className="shadow-lg rounded-2xl border-0 bg-white flex flex-col justify-between p-6"
          >
            <div>
              <h5 className="text-lg font-semibold">
                {card.emoji} {card.title}
              </h5>
              <p className="text-gray-600 mt-2">{card.description}</p>
            </div>
            <button
              className="mt-4 py-2 px-4 btn-custom rounded-full text-white font-medium"
              style={{ backgroundColor: card.color }}
              onClick={() => (card.action ? card.action() : goTo(card.link))}
            >
              {card.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeMedecin;
