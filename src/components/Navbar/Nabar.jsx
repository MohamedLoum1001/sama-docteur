// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../../assets/logo-sama-docteur.png";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    setIsLoggedIn(false);
    alert("Déconnexion réussie ✅");
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4 py-2 fixed-top">
      <div className="container-fluid">
        {/* Logo en mobile, texte en md+ */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Logo Sama Docteur"
            className="d-block d-md-none"
            style={{ width: "40px", height: "40px", marginRight: "8px" }}
          />
          <h3 className="fs-5 fw-bold m-0 d-none d-md-block">Sama Docteur</h3>
        </Link>

        {/* Icônes côté droit */}
        <div className="ms-auto d-flex align-items-center">
          {/* Message Icon */}
          <button className="btn btn-link position-relative me-3">
            <i className="bi bi-chat-dots fs-5 text-dark"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </button>

          {/* Notification Icon */}
          <button className="btn btn-link position-relative me-3">
            <i className="bi bi-bell fs-5 text-dark"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
              5
            </span>
          </button>

          {/* Photo de profil avec dropdown */}
          {isLoggedIn && (
            <div className="position-relative" ref={dropdownRef}>
              <img
                src="https://via.placeholder.com/40"
                className="rounded-circle border border-secondary"
                style={{ width: "40px", height: "40px", cursor: "pointer" }}
                alt="Profile"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              <div
                className={`profile-dropdown shadow rounded position-absolute end-0 mt-2 py-2 bg-white ${
                  showDropdown ? "show" : ""
                }`}
                style={{ minWidth: "180px", zIndex: 1000 }}
              >
                <button
                  className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
