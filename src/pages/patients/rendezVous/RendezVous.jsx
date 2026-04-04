// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaCalendarAlt, FaChevronLeft, FaSearch } from "react-icons/fa";
import "./RendezVous.css";

// 🔹 Générateur de créneaux horaires
const generateTimeSlots = (start, end) => {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h += 1; m = 0; }
  }
  return slots;
};

const RendezVous = () => {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Charger les médecins depuis Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "medecin"));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMedecins(list);
      } catch (error) {
        console.error("Erreur lors du chargement des médecins:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 🔎 Filtrage dynamique des médecins
  const filteredMedecins = useMemo(() => {
    return medecins.filter(med =>
      `${med.prenom} ${med.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.specialite && med.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, medecins]);

  // 🔹 Charger les créneaux quand un médecin est sélectionné
  const fetchSlotsForDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    const today = new Date().toISOString().split("T")[0];
    const slots = generateTimeSlots("08:30", "17:30");
    setAvailableSlots({ [today]: slots });
  };

  // 🔹 Logique de réservation mise à jour
  const handleBooking = async (date, time) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("Veuillez vous connecter pour réserver");
      navigate("/login");
      return;
    }

    // Extraction de l'ID utilisateur (clé uid, id ou _id)
    const patientId = storedUser.id || storedUser._id || storedUser.uid;

    if (!patientId) {
      alert("Erreur : ID utilisateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    try {
      const finalPatientName = `${storedUser.prenom} ${storedUser.nom}`;
      // On prépare le nom complet du docteur avec le préfixe
      const fullDoctorName = `Dr ${selectedDoctor.prenom} ${selectedDoctor.nom}`;

      const docRef = await addDoc(collection(db, "rendezvous"), {
        patientId: patientId,
        patientName: finalPatientName,
        doctorId: selectedDoctor.id,
        doctorName: fullDoctorName,
        specialty: selectedDoctor.specialite || "Généraliste",
        date: date,
        time: time,
        statut: "en attente",
        createdAt: serverTimestamp(),
      });

      alert("Rendez-vous réservé avec succès ! ✅");

      // ✅ TRANSMISSION DES DONNÉES VERS LE PAIEMENT (Noms de clés alignés avec PaiementTicket)
      navigate("/paiement-ticket", {
        state: {
          rendezvousId: docRef.id,
          patientName: finalPatientName,
          doctorName: fullDoctorName,
          specialty: selectedDoctor.specialite || "Généraliste",
          date: date,
          time: time,
          doctorId: selectedDoctor.id
        }
      });

    } catch (e) {
      console.error("Erreur détails Firestore:", e);
      alert("Erreur lors de la réservation. Veuillez réessayer.");
    }
  };

  return (
    <div className="docto-container">
      <header className="docto-header">
        <button onClick={() => navigate("/patient")} className="back-btn">
          <FaChevronLeft /> Retour
        </button>
        <h2>Prendre un rendez-vous</h2>
      </header>

      <div className="docto-content">
        <aside className="doctor-list-container">
          <div className="search-box-wrapper">
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Nom, spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="doctor-search-input"
              />
            </div>
            <small className="results-count">
              {filteredMedecins.length} praticien(s) trouvé(s)
            </small>
          </div>

          <div className="doctor-scroll-list">
            {loading ? (
              <p className="text-center p-4">Chargement...</p>
            ) : filteredMedecins.length > 0 ? (
              filteredMedecins.map(med => (
                <div
                  key={med.id}
                  className={`doctor-card-mini ${selectedDoctor?.id === med.id ? 'active' : ''}`}
                  onClick={() => fetchSlotsForDoctor(med)}
                >
                  <img
                    src={med.photo || `https://ui-avatars.com/api/?name=${med.prenom}+${med.nom}&background=00a5a8&color=fff`}
                    alt="avatar"
                  />
                  <div className="doc-info">
                    <h5>Dr {med.prenom} {med.nom}</h5>
                    <span className="spec-tag">{med.specialite || "Généraliste"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">Aucun médecin trouvé</p>
            )}
          </div>
        </aside>

        <main className="slots-selection">
          {selectedDoctor ? (
            <div className="booking-grid">
              <div className="doc-profile-header">
                <FaUserMd size={40} color="#00a5a8" />
                <div>
                  <h3>Réserver avec Dr {selectedDoctor.nom}</h3>
                  <p className="text-muted">{selectedDoctor.specialite}</p>
                </div>
              </div>

              <div className="time-grid-container">
                <div className="day-column">
                  <div className="day-header">Aujourd'hui</div>
                  <div className="slots-list">
                    {Object.values(availableSlots)[0]?.map(slot => (
                      <button
                        key={slot}
                        className="slot-btn"
                        onClick={() => handleBooking(new Date().toISOString().split("T")[0], slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FaCalendarAlt size={50} />
              <p>Sélectionnez un médecin à gauche pour voir ses disponibilités</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RendezVous;