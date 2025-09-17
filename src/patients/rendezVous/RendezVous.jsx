// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.uid) return;

      const q = query(
        collection(db, "rendezvous"),
        where("patientId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const rvList = [];
      querySnapshot.forEach((doc) => {
        rvList.push({ id: doc.id, ...doc.data() });
      });
      setRendezvousList(rvList);
    };
    fetchRendezvous();
  }, []);

  // Soumettre un rendez-vous
  const submitAppointment = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.uid) return alert("Utilisateur non connecté");

    try {
      await addDoc(collection(db, "rendezvous"), {
        patientId: user.uid,
        specialty: appointment.specialty,
        doctor: appointment.doctor,
        doctorId: appointment.doctorId,
        date: appointment.date.toISOString(),
        time: appointment.time,
        statut: "en attente",
        createdAt: serverTimestamp(),
      });
      alert("Rendez-vous enregistré ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la prise de rendez-vous ❌");
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
        <h3 className="fw-bold text-primary">📅 Prendre un rendez-vous médical</h3>
      </div>

      {/* Formulaire prise de rendez-vous */}
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
                  ...appointment,
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
                const selectedMedecin = medecins.find((m) => m.id === e.target.value);
                setAppointment({
                  ...appointment,
                  doctor: selectedMedecin
                    ? selectedMedecin.nomComplet || selectedMedecin.displayName || selectedMedecin.email
                    : "",
                  doctorId: e.target.value,
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
                    {med.nomComplet || med.displayName || med.email}
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
            />
          </div>

          {/* Heure */}
          <div className="mb-3">
            <label className="form-label w-100">Choisir une heure</label>
            <select
              className="form-select rounded-pill py-2"
              value={appointment.time}
              onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
              required
              disabled={!appointment.date}
            >
              <option value="">Sélectionnez une heure</option>
              {availableTimes.map((slot, idx) => (
                <option key={idx} value={slot.value}>
                  {slot.time}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn custom-btn w-100 mt-3 rounded-pill text-white">
            Prendre un rendez-vous & Payer
          </button>
        </form>
      </div>

      {/* Liste des rendez-vous */}
      <div className="mb-4">
        <h4 className="mb-3">Mes rendez-vous</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Date/Heure</th>
              <th>Médecin</th>
              <th>Spécialité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rendezvousList.map((rv) => (
              <tr key={rv.id}>
                <td>
                  {rv.date} {rv.time}
                </td>
                <td>{rv.doctor}</td>
                <td>{rv.specialty}</td>
                <td>{rv.statut}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      await deleteDoc(doc(db, "rendezvous", rv.id));
                      setRendezvousList((list) => list.filter((item) => item.id !== rv.id));
                    }}
                  >
                    Annuler
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

export default RendezVous;
