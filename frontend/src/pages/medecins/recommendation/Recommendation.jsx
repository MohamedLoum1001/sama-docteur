import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  FaArrowLeft, FaLightbulb, FaMicrophone, FaStop, FaUserInjured
} from "react-icons/fa";
import Button from "../../../components/boutons/Button";
import "./Recommendation.css";

const Recommandation = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [recommandations, setRecommandations] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Récupération de l'ID médecin via localStorage
  const userString = localStorage.getItem("user");
  const userMedecin = userString ? JSON.parse(userString) : null;
  const medecinId = userMedecin?.uid || userMedecin?.id;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "patient"));
        const snapshot = await getDocs(q);
        setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erreur récupération patients :", error);
      }
    };
    fetchPatients();
  }, []);

  // LOGIQUE VOCALE INSTANTANÉE
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const initialText = recommandations;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }

      setRecommandations((initialText ? initialText + " " : "") + finalTranscript + interimTranscript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const submitRecommandation = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !recommandations.trim()) {
      alert("Veuillez sélectionner un patient et saisir un message.");
      return;
    }

    setLoading(true);
    try {
      // Enregistrement dans la collection globale pour une meilleure visibilité
      await addDoc(collection(db, "recommandations"), {
        patientId: selectedPatient,
        medecinId: medecinId,
        medecinName: `Dr ${userMedecin?.prenom} ${userMedecin?.nom}`,
        message: recommandations,
        createdAt: serverTimestamp(),
      });

      // Notification pour le patient
      await addDoc(collection(db, "notifications"), {
        userId: selectedPatient,
        title: "Conseils médicaux",
        message: `Le Dr ${userMedecin?.nom} vous a envoyé de nouvelles recommandations.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      alert("Recommandation envoyée !");
      setRecommandations("");
      setSelectedPatient("");
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rec-wrapper bg-light min-vh-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-start mt-4 mb-4">
          <Button
            label={<><FaArrowLeft className="me-2" /> Retour</>}
            variant="register"
            onClick={() => navigate("/medecin")}
            className="px-4 fw-bold"
          />
        </div>

        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="p-4 text-white text-center" style={{ backgroundColor: '#00a5a8' }}>
            <FaLightbulb size={40} className="mb-2" />
            <h2 className="fw-bold m-0">Conseils & Recommandations</h2>
            <p className="m-0 opacity-75">Envoyez des consignes post-consultation à vos patients</p>
          </div>

          <form onSubmit={submitRecommandation} className="p-4 p-md-5">
            <div className="mb-4">
              <label className="form-label fw-bold text-secondary small">
                <FaUserInjured className="me-2 text-teal" /> PATIENT DESTINATAIRE
              </label>
              <select
                className="form-select border-2 p-3 rounded-3"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
              >
                <option value="">-- Sélectionner un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold text-secondary small m-0">MESSAGE DE RECOMMANDATION</label>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${isListening ? 'btn-danger animate-pulse' : 'btn-outline-primary'
                    }`}
                  onClick={toggleListening}
                  style={!isListening ? { color: '#00a5a8', borderColor: '#00a5a8' } : {}}
                >
                  {isListening ? <><FaStop className="me-1" /> Arrêter</> : <><FaMicrophone className="me-1" /> Vocal</>}
                </button>
              </div>
              <textarea
                className="form-control border-2 p-4 rounded-4"
                rows="6"
                value={recommandations}
                onChange={(e) => setRecommandations(e.target.value)}
                placeholder="Ex: Reposez-vous bien, évitez le sport pendant 48h et buvez beaucoup d'eau..."
                style={{ borderColor: isListening ? '#dc3545' : '#e2e8f0' }}
              ></textarea>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                label={loading ? "Envoi en cours..." : "Envoyer les conseils au patient"}
                variant="login"
                className="w-100 py-3 shadow-sm fw-bold fs-5"
                loading={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Recommandation;