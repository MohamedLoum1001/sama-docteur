// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate(); // ✅ Hook pour navigation
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Supprime l'erreur dès que l'utilisateur tape
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email requis";
    if (!formData.password) tempErrors.password = "Mot de passe requis";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      if (formData.email === "" || formData.password === "") {
        setErrorMessage("Veuillez remplir tous les champs.");
      } else {
        alert("Connexion réussie ✅");
         // ✅ Redirection vers HomePatient
        navigate("/home-patient");
        // ✅ Redirection vers HomeMédecin
        // navigate("/home-medecin");
         

      }
      setLoading(false);
    }, 1500);
  };

  // Classe pour envelopper tout l'input-group avec la bordure rouge si erreur
  const groupClass = (field) =>
    `input-group rounded-pill ${errors[field] ? "border border-danger" : ""}`;

  const inputClass = "form-control border-0 rounded-end-pill px-3 py-2";

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">Connexion</h3>
          </div>

          <div className="card shadow-lg p-4 border-0 rounded-4">
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-start w-100">Email</label>
                <div className={groupClass("email")}>
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

              {/* Mot de passe */}
              <div className="mb-3">
                <label className="form-label text-start w-100">
                  Mot de passe
                </label>
                <div className={groupClass("password")}>
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

              {/* Mot de passe oublié */}
              <div className="mb-3 text-end">
                <a
                  href="/reset-password"
                  className="text-decoration-none text-secondary"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Message d'erreur général */}
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}

              {/* Boutons */}
              <button
                type="submit"
                className="btn w-100 mb-2 rounded-pill text-white"
                style={{ backgroundColor: "#00a5a8" }}
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <a
                href="/register"
                className="btn w-100 rounded-pill text-white text-center"
                style={{ backgroundColor: "#0b89c4" }}
              >
                S'inscrire
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
