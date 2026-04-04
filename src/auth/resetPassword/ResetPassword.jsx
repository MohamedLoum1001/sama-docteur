import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { confirmPasswordReset } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Récupération du code 'oobCode' envoyé par Firebase dans l'URL
  const oobCode = searchParams.get("oobCode");

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", msg: "" });

  // Vérifier si le code est valide dès le chargement
  useEffect(() => {
    if (!oobCode) {
      setStatus({ type: "danger", msg: "Lien de réinitialisation invalide ou expiré." });
    }
  }, [oobCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation locale
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Les mots de passe ne correspondent pas" });
      return;
    }

    try {
      // 1. Envoyer le nouveau mot de passe à Firebase avec le code de vérification
      await confirmPasswordReset(auth, oobCode, formData.password);

      setStatus({ type: "success", msg: "Mot de passe réinitialisé avec succès ! ✅" });

      // Redirection après 3 secondes
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error(error);
      setStatus({ type: "danger", msg: "Erreur : le lien a expiré ou a déjà été utilisé." });
    }
  };

  // ... (Gardez vos fonctions de classes dynamiques ici)

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">Réinitialiser le mot de passe</h3>
          </div>

          <div className="card shadow-lg p-4 border-0 rounded-4">
            {status.msg && <div className={`alert alert-${status.type} mb-3`}>{status.msg}</div>}

            <form onSubmit={handleResetPassword}>
              {/* Nouveau mot de passe */}
              <div className="mb-3 text-start">
                <label className="form-label ms-2">Nouveau mot de passe</label>
                <div className="input-group rounded-pill border border-secondary overflow-hidden">
                  <span className="input-group-text bg-white border-0"><i className="fa fa-lock"></i></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control border-0"
                    placeholder="Entrer votre mot de passe"
                    required
                  />
                  <span className="input-group-text bg-white border-0" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
              </div>

              {/* Confirmation */}
              <div className="mb-4 text-start">
                <label className="form-label ms-2">Confirmer le mot de passe</label>
                <div className="input-group rounded-pill border border-secondary overflow-hidden">
                  <span className="input-group-text bg-white border-0"><i className="fa fa-lock"></i></span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control border-0"
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                  <span className="input-group-text bg-white border-0" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
                {errors.confirmPassword && <small className="text-danger ms-2">{errors.confirmPassword}</small>}
              </div>

              <button type="submit" className="btn w-100 rounded-pill text-white" style={{ backgroundColor: "#00a5a8" }}>
                Mettre à jour
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;