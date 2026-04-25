// src/pages/Prescription.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { FaArrowLeft, FaPrescription, FaEraser, FaMicrophone, FaStop, FaUserCircle } from "react-icons/fa";
import Button from "../../../components/boutons/Button";

const Prescription = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    medicaments: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(null);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const userString = localStorage.getItem("user");
  const userMedecin = userString ? JSON.parse(userString) : null;
  const doctorId = userMedecin?.uid || userMedecin?.id || userMedecin?._id;

  const startListening = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée.");
      return;
    }

    if (isListening === fieldName) {
      setIsListening(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    const initialText = formData[fieldName];

    recognition.onstart = () => setIsListening(fieldName);
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }
      setFormData((prev) => ({
        ...prev,
        [fieldName]: (initialText ? initialText + " " : "") + finalTranscript + interimTranscript
      }));
    };
    recognition.onerror = () => setIsListening(null);
    recognition.onend = () => setIsListening(null);
    recognition.start();
  };

  useEffect(() => {
    const fetchPatientsConsultee = async () => {
      if (!doctorId) return;
      try {
        const q = query(collection(db, "rendezvous"), where("doctorId", "==", doctorId));
        const snapshot = await getDocs(q);
        const patientIds = [...new Set(snapshot.docs.map((d) => d.data().patientId))];
        if (patientIds.length === 0) return;
        const usersSnapshot = await getDocs(collection(db, "users"));
        const list = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((u) => patientIds.includes(u.id));
        setPatients(list);
      } catch (error) {
        console.error("Erreur récupération patients :", error);
      }
    };
    fetchPatientsConsultee();
  }, [doctorId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const envoyerOrdonnance = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.medicaments) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const patient = patients.find(p => p.id === formData.patientId);
      const signatureBase64 = canvasRef.current.toDataURL("image/png");
      const prescriptionData = {
        createdAt: serverTimestamp(),
        doctorId,
        doctorName: `Dr ${userMedecin.prenom} ${userMedecin.nom}`,
        patientId: formData.patientId,
        prenom: patient.prenom,
        nom: patient.nom,
        medicaments: formData.medicaments,
        instructions: formData.instructions,
        signature: signatureBase64,
        statut: "envoyé"
      };
      await addDoc(collection(db, "ordonnances"), prescriptionData);
      await addDoc(collection(db, "prescriptions"), prescriptionData);
      await addDoc(collection(db, "notifications"), {
        userId: formData.patientId,
        title: "Nouvelle ordonnance 🧾",
        message: `Dr ${userMedecin.nom} vous a prescrit une ordonnance.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      alert("Ordonnance envoyée avec succès ! ✅");
      navigate("/medecin");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/medecin")}
          className="flex items-center text-[#00a5a8] hover:text-[#008486] transition-colors mb-6 font-semibold"
        >
          <FaArrowLeft className="mr-2" /> Retour au tableau de bord
        </button>

        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="bg-[#00a5a8] p-6 text-white text-center">
            <FaPrescription size={40} className="mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Prescrire une Ordonnance</h2>
            <p className="text-teal-50 opacity-90">Espace de prescription sécurisé</p>
          </div>

          <form onSubmit={envoyerOrdonnance} className="p-8 space-y-6">
            {/* Sélection Patient */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-bold">
                <FaUserCircle className="mr-2 text-[#00a5a8]" /> Sélectionner le patient
              </label>
              <select
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#00a5a8] focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                name="patientId"
                onChange={handleChange}
                value={formData.patientId}
                required
              >
                <option value="">-- Choisissez un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>

            {/* Médicaments */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-bold">Médicaments & Posologie</label>
                <button
                  type="button"
                  className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isListening === 'medicaments'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-teal-50 text-[#00a5a8] hover:bg-teal-100 border border-teal-100'
                    }`}
                  onClick={() => startListening('medicaments')}
                >
                  {isListening === 'medicaments' ? <><FaStop className="mr-2" /> Arrêter</> : <><FaMicrophone className="mr-2" /> Vocal</>}
                </button>
              </div>
              <textarea
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#00a5a8] focus:bg-white outline-none transition-all min-h-[150px] resize-none"
                name="medicaments"
                placeholder="Ex: Paracétamol 1g - 1 comprimé 3 fois par jour"
                value={formData.medicaments}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-gray-700 font-bold">Instructions supplémentaires</label>
                <button
                  type="button"
                  className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isListening === 'instructions'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-teal-50 text-[#00a5a8] hover:bg-teal-100 border border-teal-100'
                    }`}
                  onClick={() => startListening('instructions')}
                >
                  {isListening === 'instructions' ? <><FaStop className="mr-2" /> Arrêter</> : <><FaMicrophone className="mr-2" /> Vocal</>}
                </button>
              </div>
              <textarea
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#00a5a8] focus:bg-white outline-none transition-all min-h-[80px] resize-none"
                name="instructions"
                placeholder="Ex: À prendre à la fin des repas"
                value={formData.instructions}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Signature */}
            <div className="space-y-3">
              <label className="text-gray-700 font-bold block text-center">Signature manuscrite</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 overflow-hidden group hover:border-[#00a5a8] transition-colors">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={180}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseOut={() => setIsDrawing(false)}
                />
                <button
                  type="button"
                  onClick={clearSignature}
                  className="absolute bottom-3 right-3 flex items-center bg-white/90 backdrop-blur shadow-sm px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-bold border border-red-100 transition-all"
                >
                  <FaEraser className="mr-1" /> Effacer
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                label={loading ? "Envoi sécurisé..." : "Signer et Envoyer l'ordonnance"}
                variant="login"
                className="w-full py-4 text-lg shadow-xl"
                loading={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Prescription;