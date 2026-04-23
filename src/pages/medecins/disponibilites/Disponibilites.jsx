import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebase";
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc } from "firebase/firestore";
import { FaChevronLeft, FaChevronRight, FaTrash } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import "./Disponibilites.css";

const Disponibilites = () => {
  const [horaires, setHoraires] = useState([]);
  const [nomMedecin, setNomMedecin] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userId, setUserId] = useState(auth.currentUser?.uid || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        getDoc(doc(db, "users", user.uid)).then((userSnap) => {
          if (userSnap.exists()) {
            setNomMedecin(userSnap.data().nom || "Docteur");
          }
        });

        const unsubscribeSnap = onSnapshot(doc(db, "disponibilites", user.uid), (snap) => {
          if (snap.exists()) {
            setHoraires(snap.data().horaires || []);
          }
          setLoading(false);
        });
        return () => unsubscribeSnap();
      } else {
        setUserId(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // ✅ SAUVEGARDE NETTOYÉE POUR FIRESTORE
  const saveToFirebase = async (newHoraires, currentUid) => {
    const uidToUse = currentUid || userId || auth.currentUser?.uid;
    if (!uidToUse) return false;

    try {
      const docRef = doc(db, "disponibilites", uidToUse);

      // On nettoie les données pour éviter d'envoyer des objets complexes (Date, etc.)
      const horairesClean = newHoraires.map(h => ({
        date: String(h.date),
        heureDebut: String(h.heureDebut),
        heureFin: String(h.heureFin),
        type: String(h.type),
        jour: String(h.jour),
        nomMedecin: String(nomMedecin || "Docteur")
      }));

      await setDoc(docRef, {
        idMedecin: uidToUse,
        nomMedecin: nomMedecin || "Docteur",
        horaires: horairesClean,
        updatedAt: serverTimestamp(),
      });

      console.log("🚀 Firestore synchronisé avec succès !");
      return true;
    } catch (error) {
      console.error("❌ Erreur Firestore détaillée :", error);
      return false;
    }
  };

  const getLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const ajouterCreneau = (day, time) => {
    const dateStr = getLocalDateStr(day);
    const exists = horaires.find(h => h.date === dateStr && h.heureDebut === time);

    let nouveauxHoraires;
    if (exists) {
      nouveauxHoraires = horaires.filter(h => !(h.date === dateStr && h.heureDebut === time));
    } else {
      nouveauxHoraires = [...horaires, {
        date: dateStr,
        heureDebut: time,
        heureFin: time,
        type: "consultation",
        jour: day.toLocaleDateString('fr-FR', { weekday: 'long' }),
        nomMedecin: nomMedecin
      }];
    }

    setHoraires(nouveauxHoraires);
    // Sauvegarde silencieuse en arrière-plan
    saveToFirebase(nouveauxHoraires, userId);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00"];

  if (loading) return <div className="text-center mt-20 font-bold text-teal-600">Chargement...</div>;

  return (
    <div className="doctolib-container">
      <div className="header-dispo text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Agenda de {nomMedecin}</h2>
      </div>

      <div className="calendar-card bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden mb-10">
        <div className="calendar-nav flex justify-between items-center p-6 border-b">
          <button onClick={prevWeek} className="p-2 border rounded-full text-teal-600"><FaChevronLeft /></button>
          <span className="font-bold text-xl capitalize">{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={nextWeek} className="p-2 border rounded-full text-teal-600"><FaChevronRight /></button>
        </div>

        <div className="calendar-grid grid grid-cols-7 overflow-x-auto">
          {getWeekDays().map((day, index) => {
            const dateStr = getLocalDateStr(day);
            const isPast = day < new Date().setHours(0, 0, 0, 0);
            return (
              <div key={index} className={`calendar-column border-r p-2 ${isPast ? 'bg-gray-50' : ''}`}>
                <div className="text-center mb-4">
                  <div className="text-xs font-black uppercase text-teal-600">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                  <div className="text-lg font-bold">{day.getDate()}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {timeSlots.map(time => {
                    const isActive = horaires.some(h => h.date === dateStr && h.heureDebut === time);
                    return (
                      <button
                        key={time}
                        disabled={isPast}
                        onClick={() => ajouterCreneau(day, time)}
                        className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${isActive ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-teal-600 border-teal-50'
                          }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="summary-section bg-white shadow-xl rounded-2xl p-6 mb-10 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Mes disponibilités ({horaires.length})</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm">
              <th className="p-2">Date</th>
              <th className="p-2">Heure</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {horaires.map((h, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{new Date(h.date).toLocaleDateString('fr-FR')}</td>
                <td className="p-2 font-bold text-teal-700">{h.heureDebut}</td>
                <td className="p-2 text-center">
                  <button onClick={() => ajouterCreneau(new Date(h.date), h.heureDebut)} className="text-red-400 p-1"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button
          disabled={horaires.length === 0}
          onClick={async () => {
            const success = await saveToFirebase(horaires, auth.currentUser?.uid);
            if (success) {
              alert(`Succès ! Vos ${horaires.length} créneaux ont été enregistrés.`);
              navigate("/medecin"); // Route corrigée selon ton App.js
            } else {
              alert("Erreur lors de l'enregistrement. Vérifiez votre connexion Firestore.");
            }
          }}
          className={`px-12 py-4 rounded-full font-bold text-white shadow-lg transition-all ${horaires.length > 0 ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer' : 'bg-gray-300'
            }`}
        >
          Valider et publier mon agenda
        </button>
      </div>
    </div>
  );
};

export default Disponibilites;