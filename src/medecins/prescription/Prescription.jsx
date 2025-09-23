// src/pages/Prescription.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
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

// 🔹 Import du cachet médical
import cachetImage from "../../assets/cachet.png";

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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
          collection(db, "tickets"),
          where("doctorId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const patientIds = [
          ...new Set(snapshot.docs.map((d) => d.data().patientId)),
        ];
        if (patientIds.length === 0) return;

        const usersSnapshot = await getDocs(collection(db, "users"));
        const patientsList = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (user) => patientIds.includes(user.id) && user.role === "patient"
          );

        setPatients(patientsList);
      } catch (error) {
        console.error("Erreur récupération patients :", error);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✍️ Gestion signature manuscrite
  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };
  const endDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const envoyerOrdonnance = async (e) => {
    e.preventDefault();
    const { patientId, medicaments, instructions } = formData;

    if (!patientId || !medicaments || !instructions) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      const patientDoc = await getDoc(doc(db, "users", patientId));
      if (!patientDoc.exists()) {
        alert("Patient introuvable.");
        setLoading(false);
        return;
      }
      const patientData = patientDoc.data();

      // ✍️ Signature manuscrite en base64
      const signatureBase64 = canvasRef.current.toDataURL("image/png");

      // 🔹 Convertir cachet en base64
      const cachetBase64 = await fetch(cachetImage)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );

      // 🔹 Sauvegarde Firestore
      await addDoc(collection(db, "ordonnances"), {
        createdAt: serverTimestamp(),
        doctorId: currentUser.uid,
        doctorName: currentUser.displayName || "Médecin",
        patientId,
        prenom: patientData.prenom,
        nom: patientData.nom,
        medicaments,
        instructions,
        signature: signatureBase64,
        cachet: cachetBase64, // ✅ Ajout du cachet
      });

      await addDoc(collection(db, "notifications"), {
        userId: patientId,
        title: "Nouvelle ordonnance reçue",
        message: `Vous avez reçu une nouvelle ordonnance du Dr ${
          currentUser.displayName || "Médecin"
        }.`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      alert("Ordonnance envoyée ✅");
      setFormData({ patientId: "", medicaments: "", instructions: "" });
      clearSignature();
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur lors de l'envoi de l'ordonnance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-3">
        <button
          className="btn btn-custom rounded-pill"
          onClick={() => navigate("/home-medecin")}
        >
          <i className="bi bi-arrow-left me-2"></i> Retour à l'accueil
        </button>
      </div>

      <h3 className="text-center text-primary mb-3">
        📄 Prescrire une ordonnance électronique
      </h3>

      <form onSubmit={envoyerOrdonnance}>
        <div className="mb-3">
          <label className="form-label">Sélectionner un patient</label>
          <select
            className="form-select rounded-pill"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          >
            <option value="">Choisissez un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Médicaments prescrits</label>
          <textarea
            className="form-control"
            rows="4"
            name="medicaments"
            value={formData.medicaments}
            onChange={handleChange}
            placeholder="Liste des médicaments prescrits"
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Instructions</label>
          <textarea
            className="form-control"
            rows="3"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Instructions supplémentaires"
            required
          ></textarea>
        </div>

        {/* ✍️ Zone de signature */}
        <div className="mb-3">
          <label className="form-label">Signature du médecin</label>
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseOut={endDrawing}
            onMouseMove={draw}
          />
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={clearSignature}
            >
              Effacer la signature
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="btn btn-custom w-100 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              "Envoi en cours..."
            ) : (
              <>
                <i className="bi bi-send"></i> Envoyer l’ordonnance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Prescription;
