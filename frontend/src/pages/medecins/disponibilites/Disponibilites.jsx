import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../configuration/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { FaChevronLeft, FaChevronRight, FaTrash, FaArrowLeft } from "react-icons/fa";
import Button from "../../../components/boutons/Button";
import "./Disponibilites.css";

const Disponibilites = () => {
  const [horaires, setHoraires] = useState([]);
  const [nomMedecin, setNomMedecin] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?.uid || user?.id || user?._id;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    setNomMedecin(`${user.prenom} ${user.nom}`);

    const unsubscribeSnap = onSnapshot(
      doc(db, "disponibilites", userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data().horaires || [];
          setHoraires(data);
        }
        setLoading(false);
        setIsModified(false);
      },
      (error) => {
        console.error("❌ Erreur Firestore :", error);
        setLoading(false);
      }
    );

    return () => unsubscribeSnap();
  }, [userId, navigate, user.prenom, user.nom]);

  // Fonction de sauvegarde réutilisable
  const saveToFirebase = async (newHoraires) => {
    if (!userId) return false;
    setIsSaving(true);

    try {
      const docRef = doc(db, "disponibilites", userId);
      const horairesClean = newHoraires.map(h => ({
        date: String(h.date),
        heureDebut: String(h.heureDebut),
        heureFin: String(h.heureDebut),
        type: "consultation",
        jour: String(h.jour),
        nomMedecin: String(nomMedecin)
      }));

      await setDoc(docRef, {
        idMedecin: userId,
        nomMedecin: nomMedecin,
        horaires: horairesClean,
        updatedAt: serverTimestamp(),
      });

      setIsModified(false);
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error("❌ Erreur d'écriture :", error);
      setIsSaving(false);
      return false;
    }
  };

  const getLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Logique de Toggle (Ajout/Suppression)
  const toggleCreneau = async (day, time) => {
    const dateStr = getLocalDateStr(day);
    const exists = horaires.find(h => h.date === dateStr && h.heureDebut === time);

    let nouveauxHoraires;

    if (exists) {
      // Cas de suppression
      if (window.confirm(`Voulez-vous supprimer le créneau du ${new Date(dateStr).toLocaleDateString('fr-FR')} à ${time} ?`)) {
        nouveauxHoraires = horaires.filter(h => !(h.date === dateStr && h.heureDebut === time));
        alert("Créneau supprimé avec succès !");
      } else {
        return;
      }
    } else {
      // Cas d'ajout
      nouveauxHoraires = [...horaires, {
        date: dateStr,
        heureDebut: time,
        jour: day.toLocaleDateString('fr-FR', { weekday: 'long' })
      }];
    }

    setHoraires(nouveauxHoraires);
    setIsModified(true);
    // On synchronise direct avec Firestore
    await saveToFirebase(nouveauxHoraires);
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

  if (loading) return <div className="text-center mt-20 font-bold text-teal-600">Chargement...</div>;

  return (
    <div className="doctolib-container">

      <div className="back-nav mb-4">
        <button
          onClick={() => navigate("/medecin")}
          className="btn btn-link text-teal-600 d-flex align-items-center gap-2 text-decoration-none fw-bold"
        >
          <FaArrowLeft /> Retour à l'accueil
        </button>
      </div>

      <div className="header-dispo text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Agenda de {nomMedecin}</h2>
        <p className="text-muted">Cliquez sur une heure pour l'ajouter ou la retirer</p>
      </div>

      <div className="calendar-card bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden mb-10">
        <div className="calendar-nav flex justify-between items-center p-6 border-b">
          <button className="btn btn-outline-primary rounded-circle" onClick={() => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 7);
            setCurrentDate(d);
          }}><FaChevronLeft /></button>
          <span className="font-bold text-xl capitalize">{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          <button className="btn btn-outline-primary rounded-circle" onClick={() => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 7);
            setCurrentDate(d);
          }}><FaChevronRight /></button>
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
                  {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00"].map(time => {
                    const isActive = horaires.some(h => h.date === dateStr && h.heureDebut === time);
                    return (
                      <button
                        key={time}
                        disabled={isPast}
                        onClick={() => toggleCreneau(day, time)}
                        className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${isActive ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-teal-600 border-teal-50'}`}
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

      <div className="flex justify-center mb-5">
        <Button
          type="button"
          label="Confirmer les modifications"
          variant="login"
          disabled={!isModified}
          loading={isSaving}
          onClick={async () => {
            const success = await saveToFirebase(horaires);
            if (success) {
              alert("Agenda synchronisé avec succès !");
              navigate("/medecin");
            }
          }}
        />
      </div>

      <div className="summary-section bg-white shadow-xl rounded-2xl p-6 mb-10 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Récapitulatif ({horaires.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...horaires].sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut)).map((h, i) => (
              <tr key={i}>
                <td>{new Date(h.date).toLocaleDateString('fr-FR')}</td>
                <td className="font-bold text-teal-700">{h.heureDebut}</td>
                <td className="text-center">
                  <button
                    onClick={() => toggleCreneau(new Date(h.date), h.heureDebut)}
                    className="btn border-0 p-0"
                    style={{ color: "#dc3545" }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Disponibilites;