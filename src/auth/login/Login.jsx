import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) tempErrors.email = "Email requis";
    if (!formData.password) tempErrors.password = "Mot de passe requis";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Connecté en tant que :", data.user.role);

        if (data.user.role === "patient") navigate("/patient");
        else if (data.user.role === "medecin") navigate("/medecin");
        else if (data.user.role === "admin") navigate("/admin");
        else setErrorMessage("Rôle non reconnu.");
      } else {
        setErrorMessage(data.error || "Identifiants incorrects.");
      }
    } catch (error) {
      setErrorMessage("Impossible de contacter le serveur backend.");
    } finally {
      setLoading(false);
    }
  };

  const groupClass = (field) => `input-group rounded-pill ${errors[field] ? "border border-danger" : ""}`;
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
              <div className="mb-3 text-start">
                <label className="form-label ms-2">Email</label>
                <div className={groupClass("email")}>
                  <span className="input-group-text bg-white border-0 rounded-start-pill"><i className="fa fa-envelope"></i></span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputClass} />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="mb-2 text-start">
                <label className="form-label ms-2">Mot de passe</label>
                <div className={groupClass("password")}>
                  <span className="input-group-text bg-white border-0 rounded-start-pill"><i className="fa fa-lock"></i></span>
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe" className={inputClass} />
                  <span className="input-group-text bg-white border-0 rounded-end-pill" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
              </div>

              {/* LIEN MOT DE PASSE OUBLIÉ */}
              <div className="text-end mb-3">
                <span
                  className="text-muted small"
                  style={{ cursor: "pointer", textDecoration: "none" }}
                  onClick={() => navigate("/forget-password")}
                >
                  Mot de passe oublié ?
                </span>
              </div>

              {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}

              <button type="submit" className="btn w-100 mb-2 rounded-pill text-white shadow-sm" style={{ backgroundColor: "#00a5a8" }} disabled={loading}>
                {loading ? "Vérification..." : "Se connecter"}
              </button>

              <button type="button" onClick={() => navigate("/register")} className="btn w-100 rounded-pill text-white shadow-sm" style={{ backgroundColor: "#0b89c4" }}>
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;