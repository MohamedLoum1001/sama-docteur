// src/patients/rendezVous/RendezVous.jsx
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaCalendarAlt, FaChevronLeft, FaSearch, FaClock, FaHistory } from "react-icons/fa";
import "./RendezVous.css";

const RendezVous = () => {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [realSlots, setRealSlots] = useState([]);
  const [bookedCounts, setBookedCounts] = useState({});
  const [mesRendezVous, setMesRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const patientId = storedUser?.id || storedUser?._id || storedUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qMed = query(collection(db, "users"), where("role", "==", "medecin"));
        const snapMed = await getDocs(qMed);
        setMedecins(snapMed.docs.map(d => ({ id: d.id, ...d.data() })));

        if (patientId) {
          const qRdv = query(
            collection(db, "rendezvous"),
            where("patientId", "==", patientId)
          );
          const snapRdv = await getDocs(qRdv);

          const docsTries = snapRdv.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

          setMesRendezVous(docsTries);
        }
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  // Fonction pour gérer les couleurs dynamiques des statuts
  const getStatusStyle = (statut) => {
    const s = statut?.toLowerCase();
    if (s === "annulé") return { backgroundColor: "#ff4d4d", color: "white" };
    if (s === "confirmé") return { backgroundColor: "#00a5a8", color: "white" };
    if (s === "en attente") return { backgroundColor: "#ffcc00", color: "#333" };
    return { backgroundColor: "#eee", color: "#777" };
  };

  const filteredMedecins = useMemo(() => {
    return medecins.filter(med =>
      `${med.prenom} ${med.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.specialite && med.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, medecins]);

  const fetchSlotsForDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setLoadingSlots(true);
    try {
      const docRef = doc(db, "disponibilites", doctor.id);
      const docSnap = await getDoc(docRef);

      const qRdv = query(collection(db, "rendezvous"), where("doctorId", "==", doctor.id));
      const rdvSnap = await getDocs(qRdv);

      const counts = {};
      rdvSnap.docs.forEach(docRdv => {
        const data = docRdv.data();
        const key = `${data.date}_${data.time}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      setBookedCounts(counts);

      if (docSnap.exists()) {
        setRealSlots(docSnap.data().horaires || []);
      } else {
        setRealSlots([]);
      }
    } catch (error) {
      console.error("Erreur slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (creneau) => {
    if (!patientId) {
      alert("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    const slotKey = `${creneau.date}_${creneau.heureDebut}`;
    if ((bookedCounts[slotKey] || 0) >= 10) {
      alert("Ce créneau est complet (10/10).");
      return;
    }

    try {
      const finalPatientName = `${storedUser.prenom} ${storedUser.nom}`;
      const fullDoctorName = `Dr ${selectedDoctor.prenom} ${selectedDoctor.nom}`;

      const docRef = await addDoc(collection(db, "rendezvous"), {
        patientId,
        patientName: finalPatientName,
        doctorId: selectedDoctor.id,
        doctorName: fullDoctorName,
        specialty: selectedDoctor.specialite || "Généraliste",
        date: creneau.date,
        time: creneau.heureDebut,
        statut: "en attente",
        createdAt: serverTimestamp(),
      });

      alert("Rendez-vous réservé avec succès !");
      navigate("/paiement-ticket", {
        state: {
          rendezvousId: docRef.id,
          patientName: finalPatientName,
          doctorName: fullDoctorName,
          specialty: selectedDoctor.specialite || "Généraliste",
          date: creneau.date,
          time: creneau.heureDebut,
          doctorId: selectedDoctor.id
        }
      });
    } catch (e) {
      alert("Erreur lors de la réservation.");
    }
  };

  const groupedSlots = useMemo(() => {
    return realSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});
  }, [realSlots]);

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
                placeholder="Rechercher un médecin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="doctor-search-input"
              />
            </div>
          </div>

          <div className="doctor-scroll-list">
            {loading ? <p className="p-4">Chargement...</p> : filteredMedecins.map(med => (
              <div
                key={med.id}
                className={`doctor-card-mini ${selectedDoctor?.id === med.id ? 'active' : ''}`}
                onClick={() => fetchSlotsForDoctor(med)}
              >
                <img src={med.photo || `https://ui-avatars.com/api/?name=${med.prenom}+${med.nom}&background=00a5a8&color=fff`} alt="doc" />
                <div className="doc-info">
                  <h5>Dr {med.prenom} {med.nom}</h5>
                  <span className="spec-tag">{med.specialite || "Généraliste"}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="slots-selection">
          {selectedDoctor ? (
            <div className="booking-grid">
              <div className="doc-profile-header">
                <FaUserMd size={40} color="#00a5a8" />
                <div>
                  <h3>Disponibilités de Dr {selectedDoctor.nom}</h3>
                  <p className="text-muted">{selectedDoctor.specialite}</p>
                </div>
              </div>

              {loadingSlots ? (
                <p className="text-center p-5">Vérification des places...</p>
              ) : realSlots.length > 0 ? (
                <div className="time-grid-container">
                  {Object.keys(groupedSlots).sort().map(date => (
                    <div key={date} className="day-column">
                      <div className="day-header">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      <div className="slots-list">
                        {groupedSlots[date].map((slot, idx) => {
                          const count = bookedCounts[`${slot.date}_${slot.heureDebut}`] || 0;
                          const isFull = count >= 10;
                          return (
                            <button
                              key={idx}
                              className={`slot-btn ${isFull ? 'full' : ''}`}
                              disabled={isFull}
                              onClick={() => handleBooking(slot)}
                            >
                              <FaClock size={12} style={{ marginRight: '5px' }} />
                              {slot.heureDebut}
                              <span className="slot-badge">{isFull ? "Complet" : `${count}/10`}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="p-5 text-center">Aucun créneau disponible.</p>}
            </div>
          ) : (
            <div className="empty-state">
              <FaCalendarAlt size={50} />
              <p>Sélectionnez un médecin pour voir ses disponibilités</p>
            </div>
          )}

          <div className="patient-rdv-history mt-5">
            <h4 className="section-title"><FaHistory style={{ marginRight: '10px' }} /> Mes Rendez-vous réservés</h4>
            {mesRendezVous.length > 0 ? (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Docteur</th>
                      <th>Spécialité</th>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesRendezVous.map((rdv) => (
                      <tr key={rdv.id}>
                        <td className="fw-bold">{rdv.doctorName}</td>
                        <td><span className="spec-tag-history">{rdv.specialty}</span></td>
                        <td>{new Date(rdv.date).toLocaleDateString('fr-FR')}</td>
                        <td className="text-teal">{rdv.time}</td>
                        <td>
                          {/* Badge avec styles dynamiques */}
                          <span
                            className="status-badge"
                            style={getStatusStyle(rdv.statut)}
                          >
                            {rdv.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted italic p-3 text-center border rounded">Aucun rendez-vous enregistré.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RendezVous;