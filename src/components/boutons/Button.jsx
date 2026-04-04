import React from "react";

const Button = ({
  label,
  onClick,
  type = "button",
  variant = "login", // "login" (teal) ou "register" (bleu)
  loading = false,
  disabled = false,
  className = ""
}) => {
  // Déterminer la classe CSS en fonction de la variante
  const variantClass = variant === "login" ? "btn-login" : "btn-register";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${variantClass} py-2 rounded-pill text-white shadow-sm ${className}`}
      disabled={loading || disabled}
      // ✅ Ajout du style pour forcer l'alignement horizontal de l'icône et du texte
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px' // Espace constant entre l'icône et le texte
      }}
    >
      {loading ? (
        <>
          <i className="fa fa-spinner fa-spin me-2"></i>
          Vérification...
        </>
      ) : (
        label
      )}
    </button>
  );
};

export default Button;