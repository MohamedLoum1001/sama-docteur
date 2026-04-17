import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { confirmPasswordReset } from "firebase/auth";
import Button from "../../components/boutons/Button"; // Utilisation de ton composant Button
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./ResetPassword.css"; // Assure-toi de créer ce CSS ou d'utiliser Login.css

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
  const [loading, setLoading] = useState(false);

  // Vérifier si le code est présent dès le chargement
  useEffect(() => {
    if (!oobCode) {
      setStatus({
        type: "danger",
        msg: "Lien de réinitialisation invalide. Veuillez recommencer la procédure."
      });
    }
  }, [oobCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!oobCode) return;

    // Validation locale
    if (formData.password.length < 6) {
      setErrors({ password: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Les mots de passe ne correspondent pas" });
      return;
    }

    setLoading(true);
    try {
      // Envoyer le nouveau mot de passe à Firebase
      await confirmPasswordReset(auth, oobCode, formData.password);

      setStatus({ type: "success", msg: "Mot de passe réinitialisé avec succès ! ✅" });

      // Redirection vers login
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      console.error(error);
      let errorMsg = "Erreur : le lien a expiré ou a déjà été utilisé.";
      if (error.code === "auth/weak-password") errorMsg = "Mot de passe trop faible.";

      setStatus({ type: "danger", msg: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="login-main-container"> {/* Réutilisation de la classe container du Login */}
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

            <div className="text-center mb-4">
              <h3 className="fw-bold login-title">Nouveau mot de passe</h3>
              <p className="text-muted small">Sécurisez l'accès à votre compte</p>
            </div>

            <div className="card login-card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {status.msg && (
                  <div className={`alert alert-${status.type} py-2 small text-center`}>
                    {status.msg}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  {/* Nouveau mot de passe */}
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold">Mot de passe</label>
                    <div className="input-group custom-input-group">
                      <span className="input-group-text bg-white border-0"><i className="fa fa-lock"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control border-0"
                        placeholder="Nouveau mot de passe"
                        required
                        disabled={!oobCode || loading}
                      />
                      <span
                        className="input-group-text bg-white border-0"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </span>
                    </div>
                    {errors.password && <small className="text-danger small">{errors.password}</small>}
                  </div>

                  {/* Confirmation */}
                  <div className="mb-4 text-start">
                    <label className="form-label small fw-bold">Confirmation</label>
                    <div className="input-group custom-input-group">
                      <span className="input-group-text bg-white border-0"><i className="fa fa-lock"></i></span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-control border-0"
                        placeholder="Confirmer le mot de passe"
                        required
                        disabled={!oobCode || loading}
                      />
                      <span
                        className="input-group-text bg-white border-0"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </span>
                    </div>
                    {errors.confirmPassword && <small className="text-danger small">{errors.confirmPassword}</small>}
                  </div>

                  <Button
                    type="submit"
                    label="Mettre à jour"
                    variant="login"
                    loading={loading}
                    disabled={!oobCode}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;