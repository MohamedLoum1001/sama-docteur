import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc,
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
  const [userInfo, setUserInfo] = useState({ prenom: "", nom: "", photo: "" });
  const [notifications, setNotifications] = useState([]);

  // 1. AJOUT DES ÉTATS POUR LES MESSAGES
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // 2. AJOUT DE LA RÉFÉRENCE POUR LES MESSAGES
  const msgRef = useRef(null);

  const navigate = useNavigate();

  const logout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user ? `${user.prenom} ${user.nom}` : "Utilisateur";

    try {
      await fetch("http://localhost:5000/api/auth/logout-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.uid) {
      // ÉCOUTE DU PROFIL
      const unsubscribeUser = onSnapshot(doc(db, "users", storedUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        }
      });

      // ÉCOUTE DES NOTIFICATIONS
      const notifQuery = query(
        collection(db, "notifications"),
        where("userId", "==", storedUser.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // 3. ÉCOUTE DES MESSAGES EN TEMPS RÉEL
      const msgQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", storedUser.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribeMsgs = onSnapshot(msgQuery, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Garder un seul message par personne (le dernier)
        const uniqueMsgs = Array.from(new Map(msgs.map(m => [m.senderId, m])).values());
        setMessages(uniqueMsgs);
      });

      return () => {
        unsubscribeUser();
        unsubscribeNotifs();
        unsubscribeMsgs();
      };
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // GESTION DU CLIC EXTÉRIEUR
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (msgRef.current && !msgRef.current.contains(event.target)) setShowMessages(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 4. CALCUL DU NOMBRE DE MESSAGES NON LUS
  const unreadMsgs = messages.filter((m) => !m.isRead).length;

  const formatDateTime = (timestamp) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch { return "Date invalide"; }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4 py-2 fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" style={{ width: "40px", height: "40px", marginRight: "8px" }} />
          <h3 className="fs-5 fw-bold m-0 d-none d-md-block text-primary">Sama Docteur</h3>
        </Link>

        <div className="ms-auto d-flex align-items-center">

          {/* ✉️ SECTION MESSAGES */}
          <div className="position-relative me-3" ref={msgRef}>
            <button className="btn btn-link position-relative" onClick={() => setShowMessages(!showMessages)}>
              <i className="bi bi-chat-dots fs-5 text-dark"></i>
              {unreadMsgs > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '0.6rem' }}>
                  {unreadMsgs}
                </span>
              )}
            </button>

            {showMessages && (
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 p-2" style={{ width: "300px", maxHeight: "400px", overflowY: "auto" }}>
                <h6 className="px-2 py-1 fw-bold border-bottom">Messages</h6>
                {messages.length === 0 ? (
                  <p className="text-center text-muted p-3 small">Aucun message</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded mb-1 d-flex align-items-center ${!msg.isRead ? "bg-light fw-bold" : ""}`}
                      style={{ cursor: "pointer", borderBottom: '1px solid #f8f9fa' }}
                      onClick={() => {
                        const storedUser = JSON.parse(localStorage.getItem("user"));
                        const path = storedUser.role === "medecin" ? "/doctor-messages" : `/doctor-profile/${msg.senderId}`;
                        navigate(path);
                        setShowMessages(false);
                      }}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${msg.senderName}&background=random`}
                        className="rounded-circle me-2" style={{ width: '35px' }} alt="avatar"
                      />
                      <div className="overflow-hidden">
                        <div className="small text-dark text-truncate">{msg.senderName}</div>
                        <div className="small text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 🔔 SECTION NOTIFICATIONS */}
          <div className="position-relative me-3" ref={notifRef}>
            <button className="btn btn-link position-relative" onClick={() => setShowNotif(!showNotif)}>
              <i className="bi bi-bell fs-5 text-dark"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 p-2" style={{ width: "320px", maxHeight: "450px", overflowY: "auto" }}>
                <div className="d-flex justify-content-between align-items-center p-2 border-bottom mb-2">
                  <h6 className="m-0 fw-bold">Notifications</h6>
                  {unreadCount > 0 && <small className="badge bg-danger-subtle text-danger">{unreadCount} nouvelles</small>}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-center text-muted m-0 p-3">Aucune notification</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded mb-2 border-bottom ${notif.isRead ? "bg-light opacity-75" : "bg-white border-start border-primary border-4 shadow-sm"}`}
                      style={{ cursor: "pointer", position: "relative" }}
                      onClick={async () => {
                        if (!notif.isRead) {
                          await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
                        }
                        if (notif.link) navigate(notif.link);
                        setShowNotif(false);
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {formatDateTime(notif.createdAt)}
                        </small>
                        {notif.isRead ? (
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: "0.65rem" }}>Lue</span>
                        ) : (
                          <span className="badge bg-primary rounded-pill" style={{ fontSize: "0.65rem" }}>Nouveau</span>
                        )}
                      </div>
                      <div className={`mt-1 ${notif.isRead ? "text-muted" : "fw-bold text-dark"}`} style={{ fontSize: "0.85rem" }}>
                        {notif.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 👤 PROFIL */}
          <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
            <div className="text-end me-2 d-none d-sm-block">
              <span className="d-block fw-bold text-dark small" style={{ lineHeight: "1.2" }}>
                {userInfo.prenom} {userInfo.nom}
              </span>
            </div>

            <img
              src={userInfo.photo || `https://ui-avatars.com/api/?name=${userInfo.prenom}+${userInfo.nom}&background=00a5a8&color=fff`}
              className="rounded-circle border"
              style={{ width: "38px", height: "38px", cursor: "pointer", objectFit: "cover" }}
              alt="Profile"
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 py-2 bg-white" style={{ minWidth: "200px", zIndex: 1000 }}>
                <div className="px-3 py-2 border-bottom d-sm-none text-center">
                  <p className="m-0 fw-bold text-truncate">{userInfo.prenom} {userInfo.nom}</p>
                </div>
                <button className="dropdown-item d-flex align-items-center py-2" onClick={() => { navigate("/profil"); setShowDropdown(false); }}>
                  <i className="bi bi-person me-2"></i> Mon Profil
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger d-flex align-items-center py-2" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;