import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../../configuration/firebase";
import { confirmPasswordReset } from "firebase/auth";
import Button from "../../components/boutons/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./ResetPassword.css";

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
        msg: "Lien de réinitialisation invalide ou expiré. Veuillez recommencer la procédure."
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

      setStatus({ type: "success", msg: "Mot de passe réinitialisé avec succès ! Redirection..." });

      // Redirection vers ton Login sur Azure après 2.5 secondes
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      console.error("Erreur Reset:", error.code);
      let errorMsg = "Le lien a expiré ou a déjà été utilisé.";
      if (error.code === "auth/weak-password") errorMsg = "Le mot de passe est trop faible.";

      setStatus({ type: "danger", msg: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="login-main-container">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

            <div className="text-center mb-4">
              <h3 className="fw-bold login-title" style={{ color: "#00a5a8" }}>Nouveau mot de passe</h3>
              <p className="text-muted small">Sécurisez l'accès à votre compte Sama Docteur</p>
            </div>

            <div className="card login-card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {status.msg && (
                  <div className={`alert alert-${status.type} py-2 small text-center rounded-pill shadow-sm mb-4`}>
                    {status.msg}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  {/* Nouveau mot de passe */}
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold ms-2">Mot de passe</label>
                    <div className={`input-group custom-input-group ${errors.password ? 'border-danger' : ''}`}>
                      <span className="input-group-text bg-white border-0"><i className="fa fa-lock text-muted"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control border-0"
                        placeholder="••••••••"
                        required
                        disabled={!oobCode || loading}
                      />
                      <span
                        className="input-group-text bg-white border-0"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                      </span>
                    </div>
                    {errors.password && <small className="text-danger small d-block mt-1 ms-2">{errors.password}</small>}
                  </div>

                  {/* Confirmation */}
                  <div className="mb-4 text-start">
                    <label className="form-label small fw-bold ms-2">Confirmation</label>
                    <div className={`input-group custom-input-group ${errors.confirmPassword ? 'border-danger' : ''}`}>
                      <span className="input-group-text bg-white border-0"><i className="fa fa-lock text-muted"></i></span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-control border-0"
                        placeholder="••••••••"
                        required
                        disabled={!oobCode || loading}
                      />
                      <span
                        className="input-group-text bg-white border-0"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                      </span>
                    </div>
                    {errors.confirmPassword && <small className="text-danger small d-block mt-1 ms-2">{errors.confirmPassword}</small>}
                  </div>

                  <Button
                    type="submit"
                    label="Mettre à jour"
                    variant="login"
                    loading={loading}
                    disabled={!oobCode}
                    className="w-100 rounded-pill shadow-sm"
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