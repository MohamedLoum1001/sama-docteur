import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", msg: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", msg: "" });

        // ✅ CORRECTION : On redirige vers ton IP Azure au lieu de Vercel
        const actionCodeSettings = {
            url: 'http://4.233.208.186/login',
            handleCodeInApp: false,
        };

        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);

            setStatus({
                type: "success",
                msg: "Un lien de réinitialisation a été envoyé ! Vérifiez votre boîte de réception. ✅"
            });

            // Redirection automatique vers le login après 4 secondes
            setTimeout(() => navigate("/login"), 4000);

        } catch (error) {
            console.error("Erreur réinitialisation:", error.code);
            let errorMsg = "Une erreur est survenue.";

            if (error.code === "auth/user-not-found") {
                errorMsg = "Aucun compte n'est associé à cet email. ❌";
            } else if (error.code === "auth/invalid-email") {
                errorMsg = "L'adresse email n'est pas valide. ❌";
            } else if (error.code === "auth/too-many-requests") {
                errorMsg = "Trop de tentatives. Veuillez réessayer plus tard. ❌";
            }

            setStatus({ type: "danger", msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold" style={{ color: "#00a5a8" }}>Récupération</h3>
                        <p className="text-muted">
                            Saisissez votre email pour recevoir les instructions de réinitialisation.
                        </p>
                    </div>

                    <div className="card shadow-lg p-4 border-0 rounded-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 text-start">
                                <label className="form-label ms-2 fw-bold">Adresse Email</label>
                                <div className="input-group rounded-pill border overflow-hidden shadow-sm">
                                    <span className="input-group-text bg-white border-0">
                                        <i className="fa fa-envelope text-muted"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control border-0 py-2"
                                        placeholder="exemple@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {status.msg && (
                                <div className={`alert alert-${status.type} py-2 small shadow-sm`}>
                                    {status.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn w-100 mb-3 rounded-pill text-white shadow"
                                style={{ backgroundColor: "#00a5a8", fontWeight: "600" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span><i className="fa fa-spinner fa-spin me-2"></i>Envoi...</span>
                                ) : (
                                    "Envoyer le lien"
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none fw-bold p-0"
                                    style={{ fontSize: "0.9rem", color: "#00a5a8" }}
                                    onClick={() => navigate("/login")}
                                >
                                    <i className="fa fa-arrow-left me-2"></i> Retour à la connexion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;