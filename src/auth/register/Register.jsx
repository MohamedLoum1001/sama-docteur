import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      tempErrors.specialite = "Spécialité requise pour le médecin";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Tentative d'envoi du formulaire...", formData);

    if (!validate()) {
      console.log("Validation échouée. Erreurs :", errors);
      return;
    }

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
        console.log("Inscription réussie côté serveur");
        setSuccessMessage("Inscription réussie ✅");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        console.error("Erreur serveur :", data.error);
        setErrors({ ...errors, server: data.error || "Erreur lors de l'inscription" });
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setErrors({ ...errors, server: "Impossible de contacter le serveur. Vérifiez que votre backend Node.js est lancé." });
    } finally {
      setIsLoading(false);
    }
  };

  const inputGroupClass = (field) =>
    `input-group mb-1 ${errors[field] ? "border border-danger rounded-pill" : ""}`;
  const inputClass = "form-control border-0 px-3 py-2";

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">Créer un compte</h3>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errors.server && <div className="alert alert-danger">{errors.server}</div>}
          </div>

          <div className="card shadow-lg p-4 border-0 rounded-4">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Prénom & Nom */}
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Prénom</label>
                  <div className={inputGroupClass("prenom")}>
                    <span className="input-group-text bg-white border-0"><i className="fa fa-user text-muted"></i></span>
                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={inputClass} placeholder="Ex: Mohamed" />
                  </div>
                  {errors.prenom && <small className="text-danger ms-3">{errors.prenom}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Nom</label>
                  <div className={inputGroupClass("nom")}>
                    <span className="input-group-text bg-white border-0"><i className="fa fa-user text-muted"></i></span>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className={inputClass} placeholder="Ex: Loum" />
                  </div>
                  {errors.nom && <small className="text-danger ms-3">{errors.nom}</small>}
                </div>

                {/* Date & Lieu Naissance */}
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Date de naissance</label>
                  <div className={inputGroupClass("dateNaissance")}>
                    <span className="input-group-text bg-white border-0"><i className="fa fa-calendar text-muted"></i></span>
                    <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Lieu de naissance</label>
                  <div className={inputGroupClass("lieuNaissance")}>
                    <span className="input-group-text bg-white border-0"><i className="fa fa-map-marker text-muted"></i></span>
                    <input type="text" name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} className={inputClass} placeholder="Ex: Dakar" />
                  </div>
                </div>

                {/* Email & Téléphone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">E-mail</label>
                  <div className={inputGroupClass("email")}>
                    <span className="input-group-text bg-white border-0"><i className="fa fa-envelope text-muted"></i></span>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="doctest@gmail.com" />
                  </div>
                  {errors.email && <small className="text-danger ms-3">{errors.email}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Téléphone</label>
                  <div className={inputGroupClass("telephone")}>
                    <span className="input-group-text bg-white border-0"><i className="fa fa-phone text-muted"></i></span>
                    <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className={inputClass} placeholder="776452606" />
                  </div>
                </div>

                {/* Champ Adresse inséré ici */}
                <div className="col-12 mb-3">
                  <label className="form-label font-weight-bold">Adresse</label>
                  <div className={inputGroupClass("adresse")}>
                    <span className="input-group-text bg-white border-0">
                      <i className="fa fa-home text-muted"></i>
                    </span>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ex: Scat Urbam, Dakar"
                    />
                  </div>
                  {errors.adresse && <small className="text-danger ms-3">{errors.adresse}</small>}
                </div>

                {/* Rôle & Spécialité */}
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Rôle</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="form-select rounded-pill px-3 py-2">
                    <option value="patient">Patient</option>
                    <option value="medecin">Médecin</option>
                  </select>
                </div>
                {formData.role === "medecin" && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label font-weight-bold">Spécialité</label>
                    <input type="text" name="specialite" value={formData.specialite} onChange={handleChange} className="form-control rounded-pill px-3 py-2" placeholder="Ex: Dentiste" />
                  </div>
                )}

                {/* Mots de passe */}
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Mot de passe</label>
                  <div className="input-group border rounded-pill overflow-hidden">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-control border-0" placeholder="********" />
                    <button type="button" className="btn bg-white border-0" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">Confirmation</label>
                  <div className="input-group border rounded-pill overflow-hidden">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control border-0" placeholder="********" />
                    <button type="button" className="btn bg-white border-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <small className="text-danger ms-3">{errors.confirmPassword}</small>}
                </div>
              </div>

              <div className="text-center mt-4 d-grid">
                <button type="submit" className="btn btn-primary btn-lg rounded-pill shadow-sm" disabled={isLoading}>
                  {isLoading ? "Chargement..." : "S'inscrire"}
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="text-muted">Déjà un compte ? <span className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Se connecter</span></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;