// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// import { QRCodeCanvas } from "qrcode.react";
import "./RendezVous.css";

const RendezVous = () => {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [medecins, setMedecins] = useState([]);

  const [appointment, setAppointment] = useState({
    specialty: "",
    doctor: "",
    date: "",
    time: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]); // [{date, time, doctorName}]

  const [appointmentsHistory, setAppointmentsHistory] = useState([]);
  const [doctorDisponibilites, setDoctorDisponibilites] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  // Charger les spécialités et les médecins depuis Firestore
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

  // Charger les disponibilités selon la spécialité sélectionnée
  useEffect(() => {
    const fetchDisponibilites = async () => {
      if (!appointment.specialty) {
        setDoctorDisponibilites([]);
        setAvailableDates([]);
        setAvailableTimes([]);
        setAvailableSlots([]);
        return;
      }
      try {
        const medecinsForSpecialty = medecins.filter(m => m.specialite === appointment.specialty);
        let allDisponibilites = [];
        let slots = [];
        for (const med of medecinsForSpecialty) {
          const q = query(collection(db, "disponibilites"), where("doctorName", "==", med.nom));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (Array.isArray(data.horaires)) {
              data.horaires.forEach(h => {
                slots.push({ date: h.date, time: h.time, doctorName: med.nom });
              });
            }
            allDisponibilites.push(data);
          });
        }
        setDoctorDisponibilites(allDisponibilites);
        setAvailableSlots(slots);
        // Extraire les dates disponibles
        const dates = Array.from(new Set(slots.map(s => s.date)));
        setAvailableDates(dates);
        // Si une date est sélectionnée, filtrer les heures pour cette date
        if (appointment.date) {
          // On propose chaque créneau (heure) avec le médecin associé
          const times = slots
            .filter(s => s.date === appointment.date)
            .map(s => ({ time: s.time, doctorName: s.doctorName, value: `${s.time}__${s.doctorName}` }));
          setAvailableTimes(times);
        } else {
          setAvailableTimes([]);
        }
      } catch (error) {
        setDoctorDisponibilites([]);
        setAvailableDates([]);
        setAvailableTimes([]);
        setAvailableSlots([]);
      }
    };
    fetchDisponibilites();
  }, [appointment.specialty, appointment.date, medecins]);

  const submitAppointment = (e) => {
    e.preventDefault();
    if (
      !appointment.specialty ||
      !appointment.date ||
      !appointment.time
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    // Découper la valeur composite pour retrouver l'heure et le médecin
    const [selectedTime, selectedDoctor] = appointment.time.split("__");
    if (!selectedTime || !selectedDoctor) {
      alert("Ce créneau n'est pas disponible pour cette spécialité.");
      return;
    }
    const newAppointment = { ...appointment, time: selectedTime, doctor: selectedDoctor };
    setAppointmentsHistory((prev) => [...prev, newAppointment]);
    // Redirection vers la page PaiementTicket avec les infos du rendez-vous
    navigate("/paiement-ticket", { state: { appointment: newAppointment } });
    // Reset formulaire
    setAppointment({ specialty: "", doctor: "", date: "", time: "" });
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

      {/* Titre */}
      <div className="text-center mb-4">
        <h3 className="fw-bold text-primary">
          📅 Prendre un rendez-vous médical
        </h3>
      </div>

      {/* Formulaire */}
      <div className="card shadow-lg p-4 border-0 rounded-4 mb-5">
        <form onSubmit={submitAppointment}>
          <div className="mb-3">
            <label htmlFor="specialty" className="form-label text-left w-100">
              Choisir une spécialité
            </label>
            <select
              id="specialty"
              className="form-select rounded-pill py-2"
              value={appointment.specialty}
              onChange={(e) =>
                setAppointment({
                  ...appointment,
                  specialty: e.target.value,
                  doctor: "",
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

          <div className="mb-3">
            <label htmlFor="date" className="form-label text-left w-100">
              Choisir une date
            </label>
            <select
              id="date"
              className="form-select rounded-pill py-2"
              value={appointment.date}
              onChange={(e) =>
                setAppointment({ ...appointment, date: e.target.value, time: "" })
              }
              required
              disabled={!appointment.specialty || availableDates.length === 0}
            >
              <option value="">Sélectionnez une date</option>
              {availableDates.map((date, idx) => (
                <option key={idx} value={date}>{date}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="time" className="form-label text-left w-100">
              Choisir une heure
            </label>
            <select
              id="time"
              className="form-select rounded-pill py-2"
              value={appointment.time}
              onChange={(e) => {
                setAppointment({ ...appointment, time: e.target.value });
              }}
              required
              disabled={!appointment.date || availableTimes.length === 0}
            >
              <option value="">Sélectionnez une heure</option>
              {availableTimes.map((slot, idx) => (
                <option key={idx} value={slot.value}>
                  {slot.time} - {slot.doctorName}
                </option>
              ))}
            </select>
            {/* Affiche le médecin associé au créneau sélectionné */}
            {appointment.date && appointment.time && (() => {
              const [selectedTime, selectedDoctor] = appointment.time.split("__");
              return selectedTime && selectedDoctor ? (
                <div className="mt-2 text-success">Médecin: {selectedDoctor}</div>
              ) : null;
            })()}
          </div>

          <button
            type="submit"
            className="btn custom-btn w-100 mt-3 rounded-pill text-white"
          >
            Prendre un rendez-vous & Payer
          </button>
        </form>
      </div>

      {/* Tableau des rendez-vous */}
      {appointmentsHistory.length > 0 && (
        <div className="card shadow-lg p-4 border-0 rounded-4 mb-5">
          <h4 className="text-primary mb-3">📋 Vos rendez-vous</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Spécialité</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Médecin</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsHistory.map((app, idx) => (
                <tr key={idx}>
                  <td>{app.specialty}</td>
                  <td>{app.date}</td>
                  <td>{app.time}</td>
                  <td>{app.doctor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RendezVous;
