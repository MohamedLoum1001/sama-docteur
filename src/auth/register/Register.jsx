import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase"; // Assurez-vous du chemin
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
  const [isLoading, setIsLoading] = useState(false);
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
    if (!formData.dateNaissance) tempErrors.dateNaissance = "Date de naissance requise";
    if (!formData.lieuNaissance) tempErrors.lieuNaissance = "Lieu de naissance requis";
    if (!formData.password) tempErrors.password = "Mot de passe requis";
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (formData.role === "medecin" && !formData.specialite)
      tempErrors.specialite = "Spécialité requise";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Inscription réussie ✅");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrors({ ...errors, server: data.error || "Erreur lors de l'inscription" });
      }
    } catch (error) {
      setErrors({ ...errors, server: "Erreur de connexion au serveur." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="text-center mb-4">
              <h2 className="fw-bold title-color">Créer un compte</h2>
              <p className="text-muted">Rejoignez Sama Docteur dès aujourd'hui</p>
              {successMessage && <div className="alert alert-success rounded-pill">{successMessage}</div>}
              {errors.server && <div className="alert alert-danger rounded-pill">{errors.server}</div>}
            </div>

            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Prénom & Nom */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Prénom</label>
                      <div className={`input-group custom-input-group ${errors.prenom ? 'is-invalid-group' : ''}`}>
                        <span className="input-group-text"><i className="fa fa-user"></i></span>
                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="form-control border-0" placeholder="Mohamed" />
                      </div>
                      {errors.prenom && <small className="text-danger mt-1 d-block">{errors.prenom}</small>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Nom</label>
                      <div className={`input-group custom-input-group ${errors.nom ? 'is-invalid-group' : ''}`}>
                        <span className="input-group-text"><i className="fa fa-user"></i></span>
                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="form-control border-0" placeholder="Loum" />
                      </div>
                    </div>

                    {/* Naissance */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Date de naissance</label>
                      <div className="input-group custom-input-group">
                        <span className="input-group-text"><i className="fa fa-calendar"></i></span>
                        <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} className="form-control border-0" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Lieu de naissance</label>
                      <div className="input-group custom-input-group">
                        <span className="input-group-text"><i className="fa fa-map-marker"></i></span>
                        <input type="text" name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} className="form-control border-0" placeholder="Dakar" />
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">E-mail</label>
                      <div className="input-group custom-input-group">
                        <span className="input-group-text"><i className="fa fa-envelope"></i></span>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control border-0" placeholder="email@exemple.com" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Téléphone</label>
                      <div className="input-group custom-input-group">
                        <span className="input-group-text"><i className="fa fa-phone"></i></span>
                        <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className="form-control border-0" placeholder="77XXXXXXX" />
                      </div>
                    </div>

                    {/* Adresse */}
                    <div className="col-12">
                      <label className="form-label fw-bold small">Adresse</label>
                      <div className="input-group custom-input-group">
                        <span className="input-group-text"><i className="fa fa-home"></i></span>
                        <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="form-control border-0" placeholder="Votre adresse complète" />
                      </div>
                    </div>

                    {/* Rôle */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Je suis un</label>
                      <select name="role" value={formData.role} onChange={handleChange} className="form-select rounded-pill custom-select px-3">
                        <option value="patient">Patient</option>
                        <option value="medecin">Médecin</option>
                      </select>
                    </div>

                    {formData.role === "medecin" && (
                      <div className="col-md-6 animate__animated animate__fadeIn">
                        <label className="form-label fw-bold small">Spécialité</label>
                        <input type="text" name="specialite" value={formData.specialite} onChange={handleChange} className="form-control rounded-pill custom-input px-3" placeholder="Ex: Cardiologue" />
                      </div>
                    )}

                    {/* Passwords */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Mot de passe</label>
                      <div className="input-group custom-input-group overflow-hidden">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-control border-0" placeholder="********" />
                        <button type="button" className="btn bg-white border-0" onClick={() => setShowPassword(!showPassword)}>
                          <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Confirmation</label>
                      <div className={`input-group custom-input-group overflow-hidden ${errors.confirmPassword ? 'is-invalid-group' : ''}`}>
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control border-0" placeholder="********" />
                        <button type="button" className="btn bg-white border-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                      {errors.confirmPassword && <small className="text-danger mt-1 d-block">{errors.confirmPassword}</small>}
                    </div>
                  </div>

                  <div className="text-center mt-5">
                    <button type="submit" className="btn btn-primary-custom w-100 py-3 rounded-pill fw-bold shadow-sm" disabled={isLoading}>
                      {isLoading ? "Création en cours..." : "S'inscrire maintenant"}
                    </button>
                    <p className="mt-4 text-muted">
                      Déjà membre ? <span className="text-primary-custom fw-bold pointer" onClick={() => navigate('/login')}>Se connecter</span>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;