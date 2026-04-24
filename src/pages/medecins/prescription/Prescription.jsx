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
import { FaArrowLeft, FaPrescription, FaEraser } from "react-icons/fa";
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
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ✅ Récupération du médecin depuis le localStorage
  const userString = localStorage.getItem("user");
  const userMedecin = userString ? JSON.parse(userString) : null;
  const doctorId = userMedecin?.uid || userMedecin?.id || userMedecin?._id;

  useEffect(() => {
    const fetchPatientsConsultee = async () => {
      if (!doctorId) return;
      try {
        const q = query(
          collection(db, "rendezvous"),
          where("doctorId", "==", doctorId)
        );
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  // ✅ FONCTION MISE À JOUR : DOUBLE ENREGISTREMENT ET NOTIFICATION
  const envoyerOrdonnance = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.medicaments) {
      alert("Veuillez remplir les champs obligatoires (Patient et Médicaments).");
      return;
    }

    setLoading(true);
    try {
      const patient = patients.find(p => p.id === formData.patientId);
      const signatureBase64 = canvasRef.current.toDataURL("image/png");

      // Objet de données commun pour assurer la cohérence
      const prescriptionData = {
        createdAt: serverTimestamp(),
        doctorId: doctorId,
        doctorName: `Dr ${userMedecin.prenom} ${userMedecin.nom}`,
        patientId: formData.patientId,
        prenom: patient.prenom, // ✅ Crucial pour l'affichage patient
        nom: patient.nom,       // ✅ Crucial pour l'affichage patient
        medicaments: formData.medicaments,
        instructions: formData.instructions,
        signature: signatureBase64,
        statut: "envoyé"
      };

      // 1️⃣ Enregistrement dans la collection "ordonnances"
      await addDoc(collection(db, "ordonnances"), prescriptionData);

      // 2️⃣ Enregistrement dans la collection "prescriptions"
      await addDoc(collection(db, "prescriptions"), prescriptionData);

      // 3️⃣ Envoi de la notification au patient
      await addDoc(collection(db, "notifications"), {
        userId: formData.patientId,
        title: "Nouvelle ordonnance 🧾",
        message: `Dr ${userMedecin.nom} vous a prescrit une ordonnance. Vous pouvez la consulter dans votre espace.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      alert("Ordonnance envoyée avec succès au patient ! ✅");
      navigate("/medecin");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'ordonnance :", error);
      alert("Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <button onClick={() => navigate("/medecin")} className="btn btn-link text-teal-600 p-0 mb-4 text-decoration-none fw-bold">
        <FaArrowLeft className="me-2" /> Retour au tableau de bord
      </button>

      <div className="card shadow-lg border-0 rounded-4 p-4">
        <div className="text-center mb-4">
          <FaPrescription size={40} className="text-teal-600 mb-2" />
          <h2 className="fw-bold">Prescrire une Ordonnance</h2>
          <p className="text-muted small">Sélectionnez un patient consulté pour lui envoyer une prescription.</p>
        </div>

        <form onSubmit={envoyerOrdonnance}>
          <div className="mb-4">
            <label className="form-label fw-bold">Patient</label>
            <select className="form-select border-2 rounded-3" name="patientId" onChange={handleChange} value={formData.patientId} required>
              <option value="">-- Sélectionner le patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Médicaments & Posologie</label>
            <textarea
              className="form-control border-2 rounded-3"
              name="medicaments"
              rows="5"
              placeholder="Ex: Paracétamol 1g - 1 comprimé 3 fois par jour"
              value={formData.medicaments}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Instructions supplémentaires</label>
            <textarea
              className="form-control border-2 rounded-3"
              name="instructions"
              rows="2"
              placeholder="Ex: À prendre à la fin des repas"
              value={formData.instructions}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold d-block">Signature manuscrite</label>
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="bg-light border rounded-3 w-100"
              style={{ cursor: "crosshair", touchAction: "none" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={() => setIsDrawing(false)}
              onMouseOut={() => setIsDrawing(false)}
            />
            <button type="button" onClick={clearSignature} className="btn btn-sm btn-outline-danger mt-2">
              <FaEraser className="me-1" /> Effacer la signature
            </button>
          </div>

          <div className="d-grid mt-5">
            <Button
              type="submit"
              label={loading ? "Envoi en cours..." : "Signer et Envoyer l'ordonnance"}
              variant="login"
              loading={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Prescription;