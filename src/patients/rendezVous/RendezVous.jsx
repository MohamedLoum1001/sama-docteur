// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Génère des créneaux horaires toutes les 30 minutes
const generateTimeSlots = (start, end) => {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  while (h < endH || (h === endH && m < endM)) {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    m += 30;
    if (m >= 60) {
      h += 1;
      m = 0;
    }
  }
  return slots;
};

// Format date FR
const formatDateFR = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Format heure FR
const formatTimeFR = (timeStr) => {
  try {
    const [h, m] = timeStr.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  } catch {
    return timeStr;
  }
};

const RendezVous = () => {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [appointment, setAppointment] = useState({
    specialty: "",
    doctor: "",
    doctorId: "",
    date: null,
    time: "",
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [rendezvousList, setRendezvousList] = useState([]);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");

  // Récupérer prénom et nom du patient connecté
  useEffect(() => {
    const fetchPatientInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPrenom(data.prenom || user.displayName || "");
          setNom(data.nom || "");
        } else {
          setPrenom(user.displayName || "");
          setNom("");
        }
      } catch (err) {
        console.error("Erreur récupération patient :", err);
        setPrenom(user.displayName || "");
        setNom("");
      }
    };
    fetchPatientInfo();
  }, []);

  // Charger les spécialités et médecins
  useEffect(() => {
    const fetchSpecialties = async () => {
      const q = query(collection(db, "users"), where("role", "==", "medecin"));
      const querySnapshot = await getDocs(q);

      let medecinsList = [];
      let specialtiesSet = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        medecinsList.push({ id: doc.id, ...data });
        if (data.specialite) specialtiesSet.add(data.specialite);
      });

      setMedecins(medecinsList);
      setSpecialties(Array.from(specialtiesSet));
    };
    fetchSpecialties();
  }, []);

  // Charger les rendez-vous du patient
  useEffect(() => {
    const fetchRendezvous = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "rendezvous"),
        where("patientId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const rvList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRendezvousList(rvList);
    };
    fetchRendezvous();
  }, []);

  // Charger les disponibilités du médecin selon la date choisie
  useEffect(() => {
    const fetchDisponibilites = async () => {
      if (!appointment.doctorId || !appointment.date) {
        setAvailableTimes([]);
        return;
      }

      const formattedDate = appointment.date.toISOString().split("T")[0];

      // 1️⃣ Disponibilités du médecin
      const dispoQuery = query(
        collection(db, "disponibilites"),
        where("idMedecin", "==", appointment.doctorId),
        where("date", "==", formattedDate)
      );
      const dispoSnap = await getDocs(dispoQuery);

      let slots = [];
      if (!dispoSnap.empty) {
        const dispo = dispoSnap.docs[0].data();
        slots = generateTimeSlots(dispo.heureDebut, dispo.heureFin);
      } else {
        // Disponibilité par défaut
        slots = generateTimeSlots("08:00", "17:00");
      }

      // 2️⃣ Exclure les créneaux déjà réservés
      const rvQuery = query(
        collection(db, "rendezvous"),
        where("doctorId", "==", appointment.doctorId),
        where("date", "==", formattedDate)
      );
      const rvSnap = await getDocs(rvQuery);
      const takenTimes = rvSnap.docs.map((d) => d.data().time);

      const freeSlots = slots.filter((s) => !takenTimes.includes(s));
      setAvailableTimes(freeSlots);
    };
    fetchDisponibilites();
  }, [appointment.doctorId, appointment.date]);

  // Soumettre un rendez-vous
  const submitAppointment = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Utilisateur non connecté");

    // Validation des champs
    if (
      !appointment.specialty ||
      !appointment.doctor ||
      !appointment.doctorId ||
      !appointment.date ||
      !appointment.time ||
      !prenom.trim() ||
      !nom.trim()
    ) {
      alert(
        "Tous les champs du ticket doivent être renseignés (médecin, spécialité, date, heure, nom patient)."
      );
      return;
    }

    try {
      const patientName = `${prenom} ${nom}`.trim();
      const docRef = await addDoc(collection(db, "rendezvous"), {
        patientId: user.uid,
        patientName,
        specialty: appointment.specialty,
        doctor: appointment.doctor,
        doctorId: appointment.doctorId,
        date: appointment.date.toISOString().split("T")[0],
        time: appointment.time,
        statut: "en attente",
        createdAt: serverTimestamp(),
      });

      alert("Rendez-vous enregistré ✅");
      setRendezvousList((prev) => [
        ...prev,
        {
          id: docRef.id,
          patientId: user.uid,
          patientName,
          specialty: appointment.specialty,
          doctor: appointment.doctor,
          doctorId: appointment.doctorId,
          date: appointment.date.toISOString().split("T")[0],
          time: appointment.time,
          statut: "en attente",
        },
      ]);

      navigate("/paiement-ticket", {
        state: {
          rendezvousId: docRef.id,
          patientId: user.uid,
          patientName,
          specialty: appointment.specialty,
          doctor: appointment.doctor,
          doctorId: appointment.doctorId,
          date: appointment.date.toISOString().split("T")[0],
          time: appointment.time,
        },
      });

      setAppointment({
        specialty: "",
        doctor: "",
        doctorId: "",
        date: null,
        time: "",
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la prise de rendez-vous ❌");
    }
  };

  // Annuler un rendez-vous
  const cancelAppointment = async (id) => {
    if (window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
      await deleteDoc(doc(db, "rendezvous", id));
      setRendezvousList((list) => list.filter((rv) => rv.id !== id));
    }
  };

  return (
    <div className="container mt-5">
      {/* Bouton retour */}
      <div className="mb-3 flex items-start">
        <button
          className="btn custom-btn rounded-pill"
          onClick={() => navigate("/home-patient")}
        >
          <i className="fa fa-arrow-left me-2"></i> Retour à l’accueil
        </button>
      </div>

      <div className="text-center mb-4">
        <h3 className="fw-bold text-primary">
          📅 Prendre un rendez-vous médical
        </h3>
        <div className="mt-2 text-secondary">
          {auth.currentUser && (
            <span>
              Utilisateur : {prenom} {nom}
            </span>
          )}
        </div>
      </div>

      {/* Formulaire */}
      <div className="card shadow-lg p-4 border-0 rounded-4 mb-5">
        <form onSubmit={submitAppointment}>
          {/* Spécialité */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une spécialité</label>
            <select
              className="form-select rounded-pill py-2"
              value={appointment.specialty}
              onChange={(e) =>
                setAppointment({
                  specialty: e.target.value,
                  doctor: "",
                  doctorId: "",
                  date: null,
                  time: "",
                })
              }
              required
            >
              <option value="">Sélectionnez une spécialité</option>
              {specialties.map((spec, idx) => (
                <option key={idx} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Médecin */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir un médecin</label>
            <select
              className="form-select rounded-pill py-2"
              value={appointment.doctorId}
              onChange={(e) => {
                const selectedMedecin = medecins.find(
                  (m) => m.id === e.target.value
                );
                setAppointment({
                  ...appointment,
                  doctor: selectedMedecin
                    ? `Dr ${selectedMedecin.prenom || ""} ${
                        selectedMedecin.nom || ""
                      }`
                    : "",
                  doctorId: e.target.value,
                  date: null,
                  time: "",
                });
              }}
              required
              disabled={!appointment.specialty}
            >
              <option value="">Sélectionnez un médecin</option>
              {medecins
                .filter((m) => m.specialite === appointment.specialty)
                .map((med) => (
                  <option key={med.id} value={med.id}>
                    {`Dr ${med.prenom || ""} ${med.nom || ""}`}
                  </option>
                ))}
            </select>
          </div>

          {/* Date */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une date</label>
            <DatePicker
              className="form-control rounded-pill py-2"
              selected={appointment.date}
              onChange={(date) => setAppointment({ ...appointment, date })}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              required
              disabled={!appointment.doctorId}
              placeholderText="Sélectionnez une date"
            />
          </div>

          {/* Heure */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une heure</label>
            <select
              className="form-select rounded-pill py-2"
              value={appointment.time}
              onChange={(e) =>
                setAppointment({ ...appointment, time: e.target.value })
              }
              required
              disabled={!appointment.date}
            >
              <option value="">Sélectionnez une heure</option>
              {availableTimes.length > 0 ? (
                availableTimes.map((time, idx) => (
                  <option key={idx} value={time}>
                    {formatTimeFR(time)}
                  </option>
                ))
              ) : (
                <option disabled>Aucune disponibilité</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            className="btn custom-btn w-100 mt-3 rounded-pill text-white"
          >
            Prendre un rendez-vous & Payer
          </button>
        </form>
      </div>

      {/* Liste des rendez-vous */}
      <div className="mb-4">
        <h4 className="mb-3 fw-bold text-primary">Mes rendez-vous</h4>
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle shadow rounded-4 overflow-hidden">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-3 py-2">Date/Heure</th>
                <th className="px-3 py-2">Médecin</th>
                <th className="px-3 py-2">Spécialité</th>
                <th className="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rendezvousList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Aucun rendez-vous
                  </td>
                </tr>
              ) : (
                rendezvousList.map((rv, idx) => (
                  <tr key={rv.id} className={idx % 2 === 0 ? "bg-light" : ""}>
                    <td className="px-3 py-2 fw-semibold text-dark">
                      {formatDateFR(rv.date)} {formatTimeFR(rv.time)}
                    </td>
                    <td className="px-3 py-2">{rv.doctor}</td>
                    <td className="px-3 py-2">{rv.specialty}</td>
                    <td className="px-3 py-2">
                      {rv.statut === "Annulé" ? (
                        <span className="badge bg-danger rounded-pill px-3 py-2">
                          Rendez-vous annulé
                        </span>
                      ) : (
                        <span className="badge bg-success rounded-pill px-3 py-2">
                          Rendez-vous confirmé
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RendezVous;
