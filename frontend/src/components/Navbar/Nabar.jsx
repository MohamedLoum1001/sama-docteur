import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
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
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const navigate = useNavigate();

  // URL de l'API Dynamique (Local vs Production)
  const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://sama-docteur.vercel.app";

  // Logique de déconnexion avec appel API
  const logout = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user ? `${user.prenom} ${user.nom}` : "Utilisateur Inconnu";

    try {
      // Appel au backend pour logguer la déconnexion
      await fetch(`${API_URL}/api/auth/logout-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });
    } catch (error) {
      console.error("Impossible d'envoyer le log de déconnexion", error);
    } finally {
      // Dans tous les cas (succès ou échec de l'API), on nettoie le client
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.uid) {
      // PROFIL
      onSnapshot(doc(db, "users", storedUser.uid), (docSnap) => {
        if (docSnap.exists()) setUserInfo(docSnap.data());
      });

      // NOTIFICATIONS
      const notifQuery = query(
        collection(db, "notifications"),
        where("userId", "==", storedUser.uid),
        orderBy("createdAt", "desc")
      );
      onSnapshot(notifQuery, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // MESSAGES
      const msgQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", storedUser.uid),
        orderBy("createdAt", "desc")
      );
      onSnapshot(msgQuery, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const uniqueMsgs = Array.from(new Map(msgs.map(m => [m.senderId, m])).values());
        setMessages(uniqueMsgs);
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (msgRef.current && !msgRef.current.contains(event.target)) setShowMessages(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
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
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 p-2" style={{ width: "300px", maxHeight: "400px", overflowY: "auto", position: 'absolute', right: 0 }}>
                <h6 className="px-2 py-1 fw-bold border-bottom">Messages récents</h6>
                {messages.length === 0 ? (
                  <p className="text-center text-muted p-3 small">Aucun message</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded mb-1 d-flex align-items-center ${!msg.isRead ? "bg-light fw-bold" : ""}`}
                      style={{ cursor: "pointer", borderBottom: '1px solid #f8f9fa' }}
                      onClick={async () => {
                        if (!msg.isRead) {
                          await updateDoc(doc(db, "messages", msg.id), { isRead: true });
                        }
                        navigate("/messages", {
                          state: { contactId: msg.senderId, contactName: msg.senderName }
                        });
                        setShowMessages(false);
                      }}
                    >
                      <img src={`https://ui-avatars.com/api/?name=${msg.senderName}&background=random`} className="rounded-circle me-2" style={{ width: '35px' }} alt="avatar" />
                      <div className="overflow-hidden w-100">
                        <div className="d-flex justify-content-between">
                          <span className="small text-dark text-truncate">{msg.senderName}</span>
                          <span style={{ fontSize: '0.6rem' }} className="text-muted">{formatDateTime(msg.createdAt)}</span>
                        </div>
                        <div className="small text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                          {msg.type === "audio" ? "🎤 Message vocal" : msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* SECTION NOTIFICATIONS */}
          <div className="position-relative me-3" ref={notifRef}>
            <button className="btn btn-link position-relative p-0" onClick={() => setShowNotif(!showNotif)}>
              <i className="bi bi-bell fs-5 text-dark"></i>
              {unreadNotifs > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {unreadNotifs}
                </span>
              )}
            </button>

            {showNotif && (
              <NotificationDropdown
                notifications={notifications}
                unreadNotifs={unreadNotifs}
                formatDateTime={formatDateTime}
                setShowNotif={setShowNotif}
              />
            )}
          </div>

          {/* PROFIL */}
          <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
            <img
              src={userInfo.photo || `https://ui-avatars.com/api/?name=${userInfo.prenom}+${userInfo.nom}&background=00a5a8&color=fff`}
              className="rounded-circle border"
              style={{ width: "38px", height: "38px", cursor: "pointer", objectFit: "cover" }}
              alt="Profile"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 py-2 bg-white" style={{ minWidth: "200px", position: 'absolute', right: 0 }}>
                {/* <button className="dropdown-item" onClick={() => navigate("/profil")}>Mon Profil</button> */}
                <button className="dropdown-item text-danger" onClick={logout}>Déconnexion</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;