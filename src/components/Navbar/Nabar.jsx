// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../../assets/logo-sama-docteur.png";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userInfo, setUserInfo] = useState({ prenom: "", nom: "" });
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Déconnexion
  const logout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setShowDropdown(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // 🔹 Charger infos utilisateur et notifications en temps réel
  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Récupérer prénom/nom
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserInfo({ prenom: data.prenom || "", nom: data.nom || "" });
      }

      // Notifications en temps réel
      const notifQuery = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notifs);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchUserAndNotifications();

    // Fermer dropdowns si clic en dehors
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (unsubscribe && typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // 🔹 Nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 🔹 Formater date et heure
  const formatDateTime = (timestamp) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString(
        "fr-FR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`;
    } catch {
      return "Date invalide";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4 py-2 fixed-top">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Logo Sama Docteur"
            className="d-block d-md-none"
            style={{ width: "40px", height: "40px", marginRight: "8px" }}
          />
          <h3 className="fs-5 fw-bold m-0 d-none d-md-block">Sama Docteur</h3>
        </Link>

        <div className="ms-auto d-flex align-items-center">
          {/* 🔔 Notifications */}
          <div className="position-relative me-3" ref={notifRef}>
            <button
              className="btn btn-link position-relative"
              onClick={() => setShowNotif(!showNotif)}
            >
              <i className="bi bi-bell fs-5 text-dark"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown notifications */}
            {showNotif && (
              <div
                className="dropdown-menu dropdown-menu-end show shadow rounded p-2"
                style={{
                  width: "300px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {notifications.length === 0 ? (
                  <p className="text-center text-muted m-0">
                    Aucune notification
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded mb-1 ${
                        notif.isRead ? "bg-light" : "bg-white border"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={async () => {
                        if (!notif.isRead) {
                          await updateDoc(doc(db, "notifications", notif.id), {
                            isRead: true,
                          });
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === notif.id ? { ...n, isRead: true } : n
                            )
                          );
                        }
                        if (notif.link) navigate(notif.link);
                        setShowNotif(false);
                      }}
                    >
                      <small className="text-muted d-block">
                        {formatDateTime(notif.createdAt)}
                      </small>
                      <span>{notif.message}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 👤 Profil */}
          {isLoggedIn && (
            <div
              className="d-flex align-items-center position-relative"
              ref={dropdownRef}
            >
              <span className="me-2 fw-bold text-dark">
                {userInfo.prenom} {userInfo.nom}
              </span>
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
