import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ Importation du composant réutilisable
import Button from "../../components/boutons/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./Login.css";

// ✅ Définition de l'URL de l'API (Local par défaut, variable d'env en production)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // ✅ Utilisation de la variable API_URL
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === "patient") {
          console.log(`Connecté en tant que Patient : ${data.user.prenom} ${data.user.nom}`);
          console.log(`ID Utilisateur : ${data.user.id || data.user._id || data.user.uid}`);
        }

        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          if (data.user.role === "patient") navigate("/patient");
          else if (data.user.role === "medecin") navigate("/medecin");
          else if (data.user.role === "admin") navigate("/admin");
          else navigate("/");
        }, 1000);

      } else {
        setErrorMessage(data.error || "Identifiants incorrects.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  return (
    <div className="login-main-container">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

            <div className="text-center mb-4">
              <h3 className="fw-bold login-title">Connexion</h3>
              <p className="text-muted small">Espace de santé Sama Docteur</p>
            </div>

            <div className="card login-card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-bold">Email</label>
                    <div className="input-group custom-input-group">
                      <span className="input-group-text"><i className="fa fa-envelope"></i></span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="form-control border-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2 text-start">
                    <label className="form-label small fw-bold">Mot de passe</label>
                    <div className="input-group custom-input-group">
                      <span className="input-group-text"><i className="fa fa-lock"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mot de passe"
                        className="form-control border-0"
                        required
                      />
                      <span className="input-group-text bg-white" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </span>
                    </div>
                  </div>

                  <div className="text-end mb-4">
                    <span className="text-muted small pointer" onClick={() => navigate("/forget-password")}>
                      Mot de passe oublié ?
                    </span>
                  </div>

                  {errorMessage && <div className="alert alert-danger py-2 small">{errorMessage}</div>}

                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      label="Se connecter"
                      variant="login"
                      loading={loading}
                    />

                    <Button
                      type="button"
                      label="Créer un compte"
                      variant="register"
                      onClick={() => navigate("/register")}
                    />
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

export default Login;