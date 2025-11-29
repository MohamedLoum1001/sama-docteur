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
    if (formData.role === "medecin" && !formData.specialite)
      tempErrors.specialite = "Spécialité requise pour le médecin";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    <div className="mt-3 text-center">
      <button
        className="btn btn-outline-primary rounded-pill"
        onClick={() => navigate('/login')}
      >
        Se connecter
      </button>
    </div>
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

      setTimeout(() => navigate("/login"), 1200);
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
    `input-group mb-3 ${errors[field] ? "border border-danger rounded-pill" : ""
    }`;
  const inputClass = "form-control border-0 px-3 py-2";

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <h3 className="mt-2 fw-bold text-primary">Inscription</h3>
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
          </div>
          <div className="card shadow-lg p-4 border-0 rounded-4">
            <form onSubmit={handleSubmit}>
              {/* Prénom et Nom */}
              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label">Prénom</label>
                  <div className={inputGroupClass("prenom")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-user"></i>
                    </span>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Prénom"
                      className={inputClass}
                    />
                  </div>
                  {errors.prenom && (
                    <small className="text-danger">{errors.prenom}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nom</label>
                  <div className={inputGroupClass("nom")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-user"></i>
                    </span>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Nom"
                      className={inputClass}
                    />
                  </div>
                  {errors.nom && (
                    <small className="text-danger">{errors.nom}</small>
                  )}
                </div>
              </div>

              {/* Date et Lieu de naissance */}
              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label">Date de naissance</label>
                  <div className={inputGroupClass("dateNaissance")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-calendar"></i>
                    </span>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  {errors.dateNaissance && (
                    <small className="text-danger">
                      {errors.dateNaissance}
                    </small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Lieu de naissance</label>
                  <div className={inputGroupClass("lieuNaissance")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-map-marker"></i>
                    </span>
                    <input
                      type="text"
                      name="lieuNaissance"
                      value={formData.lieuNaissance}
                      onChange={handleChange}
                      placeholder="Lieu de naissance"
                      className={inputClass}
                    />
                  </div>
                  {errors.lieuNaissance && (
                    <small className="text-danger">
                      {errors.lieuNaissance}
                    </small>
                  )}
                </div>
              </div>

              {/* Email et Téléphone sur la même ligne */}
              <div className="row mb-2">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <div className={inputGroupClass("email")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className={inputClass}
                    />
                  </div>
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Téléphone</label>
                  <div className={inputGroupClass("telephone")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-phone"></i>
                    </span>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="Téléphone"
                      className={inputClass}
                    />
                  </div>
                  {errors.telephone && (
                    <small className="text-danger">{errors.telephone}</small>
                  )}
                </div>
              </div>

              {/* Adresse */}
              <div className="mb-2">
                <label className="form-label">Adresse</label>
                <div className={inputGroupClass("adresse")}>
                  <span className="input-group-text bg-white rounded-start-pill">
                    <i className="fa fa-map"></i>
                  </span>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="Adresse"
                    className={inputClass}
                  />
                </div>
                {errors.adresse && (
                  <small className="text-danger">{errors.adresse}</small>
                )}
              </div>

              {/* Rôle et Spécialité */}
              <div className="row mb-2">
                <div className="col-12">
                  <label className="form-label">Rôle</label>
                  <div className={inputGroupClass("role")}>
                    <span className="input-group-text bg-white rounded-start-pill">
                      <i className="fa fa-user-circle"></i>
                    </span>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="patient">Patient</option>
                      <option value="medecin">Médecin</option>
                    </select>
                  </div>
                  {errors.role && (
                    <small className="text-danger">{errors.role}</small>
                  )}
                </div>

                {formData.role === "medecin" && (
                  <div className="col-12">
                    <label className="form-label">Spécialité</label>
                    <div className={inputGroupClass("specialite")}>
                      <span className="input-group-text bg-white rounded-start-pill">
                        <i className="fa fa-stethoscope"></i>
                      </span>
                      <input
                        type="text"
                        name="specialite"
                        value={formData.specialite}
                        onChange={handleChange}
                        placeholder="Spécialité"
                        className={inputClass}
                      />
                    </div>
                    {errors.specialite && (
                      <small className="text-danger">{errors.specialite}</small>
                    )}
                  </div>
                )}
              </div>

              {/* Mot de passe et confirmation avec œil */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Mot de passe</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mot de passe"
                      className={`form-control ${errors.password
                          ? "border border-danger rounded-pill"
                          : ""
                        }`}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                      ></i>
                    </button>
                  </div>
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmer le mot de passe"
                      className={`form-control ${errors.confirmPassword
                          ? "border border-danger rounded-pill"
                          : ""
                        }`}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <i
                        className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                      ></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <small className="text-danger">
                      {errors.confirmPassword}
                    </small>
                  )}
                </div>
              </div>

              {/* Bouton Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                >
                  S'inscrire
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;