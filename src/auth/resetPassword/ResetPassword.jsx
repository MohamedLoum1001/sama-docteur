// src/components/ResetPassword.jsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" }); // Supprime l'erreur dès que l'utilisateur tape
    }
  };

  const validate = () => {
    let tempErrors = {};
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
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!validate()) return;
    alert("Mot de passe réinitialisé ✅");
    setFormData({ password: "", confirmPassword: "" });
  };

  // Classes dynamiques
  const inputGroupClass = (field) =>
    `input-group rounded-pill border ${
      errors[field] ? "border-danger" : "border-secondary"
    }`;

  const inputClass = "form-control border-0 px-3 py-2";

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">
              Réinitialiser le mot de passe
            </h3>
          </div>

          <div className="card shadow-lg p-4 border-0 rounded-4">
            <form onSubmit={handleResetPassword}>
              {/* Nouveau mot de passe */}
              <div className="mb-3">
                <label className="form-label text-start w-100">
                  Nouveau mot de passe
                </label>
                <div className={inputGroupClass("password")}>
                  <span className="input-group-text bg-white rounded-start-pill border-0">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Entrer votre mot de passe"
                  />
                  <span
                    className="input-group-text bg-white rounded-end-pill border-0"
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
                  <small className="text-danger text-start w-100">
                    {errors.password}
                  </small>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="mb-4">
                <label className="form-label text-start w-100">
                  Confirmer le mot de passe
                </label>
                <div className={inputGroupClass("confirmPassword")}>
                  <span className="input-group-text bg-white rounded-start-pill border-0">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Confirmer le mot de passe"
                  />
                  <span
                    className="input-group-text bg-white rounded-end-pill border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`fa ${
                        showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </span>
                </div>
                {errors.confirmPassword && (
                  <small className="text-danger text-start w-100">
                    {errors.confirmPassword}
                  </small>
                )}
              </div>

              <button
                type="submit"
                className="btn w-100 rounded-pill text-white"
                style={{ backgroundColor: "#00a5a8" }}
              >
                Réinitialiser
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
