// src/auth/ProtectedRoute.jsx
/* eslint-disable react/prop-types */
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // On récupère l'utilisateur stocké dans le localStorage par Login.jsx
  const user = JSON.parse(localStorage.getItem("user"));

  // Si aucun utilisateur n'est trouvé dans le stockage local
  if (!user) {
    console.log("Accès refusé : Aucun utilisateur en session.");
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est présent, on autorise l'affichage de la page
  return children;
};

export default ProtectedRoute;