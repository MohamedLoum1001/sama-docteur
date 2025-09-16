// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, isSameDay } from "date-fns";

function generateTimeSlots(start, end, step = 30) {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m < endM)) {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    m += step;
    if (m >= 60) {
      m -= 60;
      h++;
    }
  }
  return slots;
}

const RendezVous = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [appointment, setAppointment] = useState({ specialty: "", doctor: "", date: null, time: "" });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

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

  useEffect(() => {
    const fetchDisponibilites = async () => {
      if (!appointment.specialty) {
        setAvailableDates([]);
        setAvailableTimes([]);
        return;
      }
      try {
        const medecinsForSpecialty = medecins.filter((m) => m.specialite === appointment.specialty);
        let datesMap = {};
        for (const med of medecinsForSpecialty) {
          const q = query(collection(db, "disponibilites"), where("idMedecin", "==", med.id));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (Array.isArray(data.horaires)) {
              data.horaires.forEach((h) => {
                if (h.date) {
                  if (!datesMap[h.date]) datesMap[h.date] = [];
                  const times = generateTimeSlots(h.heureDebut, h.heureFin, 30);
                  times.forEach((t) => {
                    datesMap[h.date].push({
                      time: t,
                      doctorName: `Dr. ${data.nomMedecin}`,
                      doctorId: data.idMedecin,
                    });
                  });
                }
              });
            }
          });
        }
        // Dates uniques (format Date JS)
        const dates = Object.keys(datesMap).map((d) => parseISO(d));
        setAvailableDates(dates);

        // Heures filtrées pour la date sélectionnée
        if (appointment.date) {
          const dateStr = appointment.date.toISOString().split("T")[0];
          const times = (datesMap[dateStr] || []).map((s) => ({
            time: s.time,
            doctorName: s.doctorName,
            doctorId: s.doctorId,
            value: `${s.time}__${s.doctorName}__${s.doctorId}`,
          }));
          setAvailableTimes(times);
        } else {
          setAvailableTimes([]);
        }
      } catch (error) {
        console.error("Erreur fetchDisponibilites:", error);
        setAvailableDates([]);
        setAvailableTimes([]);
      }
    };
    fetchDisponibilites();
  }, [appointment.specialty, appointment.date, medecins]);

  const submitAppointment = (e) => {
    e.preventDefault();
    if (!appointment.specialty || !appointment.date || !appointment.time) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const [selectedTime, selectedDoctor, selectedDoctorId] = appointment.time.split("__");
    const newAppointment = {
      ...appointment,
      time: selectedTime,
      doctor: selectedDoctor,
      doctorId: selectedDoctorId,
    };
    navigate("/paiement-ticket", { state: { appointment: newAppointment } });
    setAppointment({ specialty: "", doctor: "", date: null, time: "" });
  };

  return (
    <div className="container mt-5">
      <div className="mb-3 flex items-start">
        <button className="btn custom-btn rounded-pill" onClick={() => navigate("/home-patient")}> <i className="fa fa-arrow-left me-2"></i> Retour à l’accueil </button>
      </div>
      <div className="text-center mb-4">
        <h3 className="fw-bold text-primary">📅 Prendre un rendez-vous médical</h3>
      </div>
      <div className="card shadow-lg p-4 border-0 rounded-4 mb-5">
        <form onSubmit={submitAppointment}>
          {/* Spécialité */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une spécialité</label>
            <select className="form-select rounded-pill py-2" value={appointment.specialty} onChange={(e) => setAppointment({ ...appointment, specialty: e.target.value, doctor: "", date: null, time: "" })} required>
              <option value="">Sélectionnez une spécialité</option>
              {specialties.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          {/* DatePicker */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une date</label>
            <DatePicker
              selected={appointment.date}
              onChange={(date) => setAppointment({ ...appointment, date, time: "" })}
              includeDates={availableDates}
              dateFormat="dd/MM/yyyy"
              placeholderText="Cliquez pour choisir une date"
              className="form-control rounded-pill py-2"
              disabled={!appointment.specialty}
            />
          </div>
          {/* Heures disponibles par médecin */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une heure</label>
            <select className="form-select rounded-pill py-2" value={appointment.time} onChange={(e) => setAppointment({ ...appointment, time: e.target.value })} required disabled={!(appointment.specialty && appointment.date) || availableTimes.length === 0}>
              <option value="">Sélectionnez une heure</option>
              {appointment.specialty && appointment.date && availableTimes.map((slot, idx) => (
                <option key={idx} value={slot.value}>{slot.time} - {slot.doctorName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn custom-btn w-100 mt-3 rounded-pill text-white">Prendre un rendez-vous & Payer</button>
        </form>
      </div>
    </div>
  );
};

export default RendezVous;
