// src/components/Register.jsx
import React, { useState } from "react";
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
    password: "",
    confirmPassword: "",
    role: "patient",
    specialite: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccessMessage("");
    setSuccessMessage("Inscription réussie ✅");
    setFormData({
      prenom: "",
      nom: "",
      email: "",
      adresse: "",
      telephone: "",
      password: "",
      confirmPassword: "",
      role: "patient",
      specialite: "",
    });
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

              {/* Email et Adresse */}
              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label text-start w-100">Email</label>
                  <div className={inputGroupClass("email")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Entrez votre email"
                      className={inputClass}
                    />
                  </div>
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-start w-100">Adresse</label>
                  <div className={inputGroupClass("adresse")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-map"></i>
                    </span>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Entrez votre adresse"
                      className={inputClass}
                    />
                  </div>
                  {errors.adresse && (
                    <small className="text-danger">{errors.adresse}</small>
                  )}
                </div>
              </div>

              {/* Téléphone */}
              <div className="mb-2">
                <label className="form-label text-start w-100">Téléphone</label>
                <div className={inputGroupClass("telephone")}>
                  <span className="input-group-text bg-white rounded-start-pill">
                    <i className="fa fa-phone"></i>
                  </span>
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="Entrez votre téléphone"
                    className={inputClass}
                  />
                </div>
                {errors.telephone && (
                  <small className="text-danger">{errors.telephone}</small>
                )}
              </div>

              {/* Rôle */}
              <div className="mb-2">
                <label className="form-label text-start w-100">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`form-select ${errors.role ? "border border-danger rounded-pill" : ""}`}
                >
                  <option value="admin">Admin</option>
                  <option value="patient">Patient</option>
                  <option value="medecin">Médecin</option>
                </select>
                {errors.role && (
                  <small className="text-danger">{errors.role}</small>
                )}
              </div>

              {/* Spécialité (affiché si rôle = médecin) */}
              {formData.role === "medecin" && (
                <div className="mb-2">
                  <label className="form-label text-start w-100">Spécialité</label>
                  <input
                    type="text"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    placeholder="Entrez la spécialité"
                    className={`form-control border-0 px-3 py-2 ${errors.specialite ? "border border-danger rounded-pill" : ""}`}
                  />
                  {errors.specialite && (
                    <small className="text-danger">{errors.specialite}</small>
                  )}
                </div>
              )}

              {/* Mot de passe et Confirmation */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-start w-100">
                    Mot de passe
                  </label>
                  <div className={inputGroupClass("password")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mot de passe"
                      className={inputClass}
                    />
                    <span
                      className="input-group-text bg-white rounded-end-pill"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`fa ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </span>
                  </div>
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-start w-100">
                    Confirmer le mot de passe
                  </label>
                  <div className={inputGroupClass("confirmPassword")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-lock"></i>
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmer le mot de passe"
                      className={inputClass}
                    />
                    <span
                      className="input-group-text bg-white rounded-end-pill"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <i
                        className={`fa ${
                          showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <small className="text-danger">
                      {errors.confirmPassword}
                    </small>
                  )}
                </div>
              </div>

              {/* Message de succès */}
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}

              {/* Boutons */}
              <button
                type="submit"
                className="btn w-100 mb-3 rounded-pill text-white"
                style={{ backgroundColor: "#00a5a8" }}
              >
                S'inscrire
              </button>

              <a
                href="/login"
                className="btn w-100 rounded-pill text-white"
                style={{ backgroundColor: "#0b89c4" }}
              >
                Se connecter
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
