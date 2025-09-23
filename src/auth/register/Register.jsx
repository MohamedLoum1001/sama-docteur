// src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    adresse: "",
    telephone: "",
    dateNaissance: "",
    lieuNaissance: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialite: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telephone") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 9);
      setFormData({ ...formData, [name]: numbersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.prenom) tempErrors.prenom = "Prénom requis";
    if (!formData.nom) tempErrors.nom = "Nom requis";
    if (!formData.email) tempErrors.email = "Email requis";
    if (!formData.adresse) tempErrors.adresse = "Adresse requise";
    if (!formData.telephone) tempErrors.telephone = "Téléphone requis";
    if (!formData.dateNaissance)
      tempErrors.dateNaissance = "Date de naissance requise";
    if (!formData.lieuNaissance)
      tempErrors.lieuNaissance = "Lieu de naissance requis";
    if (!formData.password) tempErrors.password = "Mot de passe requis";
    if (!formData.confirmPassword)
      tempErrors.confirmPassword = "Confirmation requise";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      tempErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!formData.role) tempErrors.role = "Rôle requis";
    if (formData.role === "medecin" && !formData.specialite) {
      tempErrors.specialite = "Spécialité requise pour le médecin";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccessMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        adresse: formData.adresse,
        telephone: formData.telephone,
        dateNaissance: formData.dateNaissance,
        lieuNaissance: formData.lieuNaissance,
        role: formData.role,
        specialite: formData.role === "medecin" ? formData.specialite : "",
        password: formData.password,
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage("Inscription réussie ✅");
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        adresse: "",
        telephone: "",
        dateNaissance: "",
        lieuNaissance: "",
        password: "",
        confirmPassword: "",
        role: "patient",
        specialite: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setSuccessMessage("");
      if (error.code === "auth/email-already-in-use") {
        setErrors({ ...errors, email: "Cet email est déjà utilisé." });
      } else {
        setErrors({ ...errors, email: error.message });
      }
    }
  };

  const inputGroupClass = (field) =>
    `input-group ${errors[field] ? "border border-danger rounded-pill" : ""}`;
  const inputClass = "form-control border-0 px-3 py-2";

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <h3 className="mt-2 fw-bold text-primary">Inscription</h3>
          </div>
          <div className="card shadow-lg p-4 border-0 rounded-4">
            <form onSubmit={handleSubmit}>
              {/* Prénom et Nom */}
              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label text-start w-100">Prénom</label>
                  <div className={inputGroupClass("prenom")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-user"></i>
                    </span>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Entrez votre prénom"
                      className={inputClass}
                    />
                  </div>
                  {errors.prenom && (
                    <small className="text-danger">{errors.prenom}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-start w-100">Nom</label>
                  <div className={inputGroupClass("nom")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-user"></i>
                    </span>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Entrez votre nom"
                      className={inputClass}
                    />
                  </div>
                  {errors.nom && (
                    <small className="text-danger">{errors.nom}</small>
                  )}
                </div>
              </div>

              {/* Date de naissance et Lieu de naissance */}
              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label text-start w-100">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className={`form-control ${
                      errors.dateNaissance
                        ? "border border-danger rounded-pill"
                        : ""
                    }`}
                  />
                  {errors.dateNaissance && (
                    <small className="text-danger">
                      {errors.dateNaissance}
                    </small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-start w-100">
                    Lieu de naissance
                  </label>
                  <input
                    type="text"
                    name="lieuNaissance"
                    value={formData.lieuNaissance}
                    onChange={handleChange}
                    placeholder="Entrez votre lieu de naissance"
                    className={`form-control ${
                      errors.lieuNaissance
                        ? "border border-danger rounded-pill"
                        : ""
                    }`}
                  />
                  {errors.lieuNaissance && (
                    <small className="text-danger">
                      {errors.lieuNaissance}
                    </small>
                  )}
                </div>
              </div>

              {/* Reste du formulaire (Email, Adresse, Téléphone, Role, Spécialité, Mot de passe...) */}
              {/* ... Reste inchangé ... */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
