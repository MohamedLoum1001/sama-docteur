import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importations Firebase pour la déconnexion forcée si besoin
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Button from "../../components/boutons/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./Login.css";

// URL de l'API pointant vers ton serveur Azure avec le port 8000
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : "http://4.233.208.186:8000";

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

    // 🔥 FIX SÉCURITÉ ORAL : On vide le cache local des anciennes sessions pour éviter les conflits 401
    localStorage.removeItem("user");
    sessionStorage.clear();

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // VÉRIFICATION CRITIQUE DU STATUT (blocked / archived)
        if (data.user && (data.user.status === 'blocked' || data.user.status === 'archived')) {
          await signOut(auth);
          localStorage.removeItem("user");
          setLoading(false);

          const msg = data.user.status === 'blocked'
            ? "Votre compte a été suspendu par l'administrateur."
            : "Ce compte est archivé. Veuillez contacter le support.";

          setErrorMessage(msg);
          return;
        }

        // LOGIQUE DE CONNEXION RÉUSSIE
        console.log(`Connecté sur Azure : ${data.user.prenom} ${data.user.nom}`);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "patient") navigate("/patient");
        else if (data.user.role === "medecin") navigate("/medecin");
        else if (data.user.role === "admin") navigate("/admin");
        else navigate("/");

      } else {
        // 🔥 Affiche l'erreur explicite retournée par ton contrôleur Node.js
        setErrorMessage(data.error || "Identifiants ou rôle incorrects.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorMessage("Impossible de contacter le serveur (Azure API).");
      setLoading(false);
    }
  };

  return (
    <div className="login-main-container">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

            <div className="text-center mb-4">
              <h3 className="fw-bold login-title" style={{ color: "#00a5a8" }}>Connexion</h3>
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
                    <span className="text-muted small pointer" onClick={() => navigate("/forget-password")} style={{ cursor: "pointer" }}>
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