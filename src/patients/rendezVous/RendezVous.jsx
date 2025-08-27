// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { QRCodeCanvas } from "qrcode.react";
import "./RendezVous.css";

const RendezVous = () => {
  const navigate = useNavigate();

  const specialties = useMemo(
    () => ["Cardiologie", "Dermatologie", "Pédiatrie", "Généraliste"],
    []
  );

  const doctors = useMemo(
    () => [
      { name: "Dr. Dupont", specialty: "Cardiologie" },
      { name: "Dr. Martin", specialty: "Dermatologie" },
      { name: "Dr. Lefevre", specialty: "Pédiatrie" },
      { name: "Dr. Durant", specialty: "Généraliste" },
      { name: "Dr. Bernard", specialty: "Cardiologie" },
    ],
    []
  );

  const [appointment, setAppointment] = useState({
    specialty: "",
    doctor: "",
    date: "",
    time: "",
  });

  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [appointmentsHistory, setAppointmentsHistory] = useState([]);

  useEffect(() => {
    if (appointment.specialty) {
      setFilteredDoctors(
        doctors.filter((d) => d.specialty === appointment.specialty)
      );
    } else {
      setFilteredDoctors(doctors);
    }
  }, [appointment.specialty, doctors]);

  const suggestions = filteredDoctors.filter((d) =>
    d.name.toLowerCase().includes(doctorQuery.toLowerCase())
  );

  const submitAppointment = (e) => {
    e.preventDefault();
    if (
      !appointment.specialty ||
      !appointment.doctor ||
      !appointment.date ||
      !appointment.time
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const newAppointment = { ...appointment };
    setAppointmentsHistory((prev) => [...prev, newAppointment]);

    // Redirection vers la page PaiementTicket avec les infos du rendez-vous
    navigate("/paiement-ticket", { state: { appointment: newAppointment } });

    // Reset formulaire
    setAppointment({ specialty: "", doctor: "", date: "", time: "" });
    setDoctorQuery("");
  };

  return (
    <div className="container">
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

          <div className="mb-3 position-relative">
            <label htmlFor="doctor" className="form-label text-left w-100">
              Choisir un médecin
            </label>
            <input
              type="text"
              id="doctor"
              className="form-control rounded-pill py-2"
              value={doctorQuery}
              placeholder="Tapez le nom du médecin"
              onChange={(e) => {
                setDoctorQuery(e.target.value);
                setAppointment({ ...appointment, doctor: e.target.value });
              }}
              required
              autoComplete="off"
            />
            {doctorQuery && suggestions.length > 0 && (
              <ul className="list-group position-absolute w-100 z-10">
                {suggestions.map((doc, idx) => (
                  <li
                    key={idx}
                    className="list-group-item list-group-item-action"
                    onClick={() => {
                      setDoctorQuery(doc.name);
                      setAppointment({ ...appointment, doctor: doc.name });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {doc.name} - {doc.specialty}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="date" className="form-label text-left w-100">
              Choisir une date
            </label>
            <input
              type="date"
              id="date"
              className="form-control rounded-pill py-2"
              value={appointment.date}
              onChange={(e) =>
                setAppointment({ ...appointment, date: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="time" className="form-label text-left w-100">
              Choisir une heure
            </label>
            <input
              type="time"
              id="time"
              className="form-control rounded-pill py-2"
              value={appointment.time}
              onChange={(e) =>
                setAppointment({ ...appointment, time: e.target.value })
              }
              required
            />
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
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Date</th>
                <th>Heure</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsHistory.map((app, idx) => {
                const doctor = doctors.find((d) => d.name === app.doctor);
                return (
                  <tr key={idx}>
                    <td>{app.doctor}</td>
                    <td>{doctor?.specialty}</td>
                    <td>{app.date}</td>
                    <td>{app.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RendezVous;
