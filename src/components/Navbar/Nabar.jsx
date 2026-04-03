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
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
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

      // MESSAGES (Écoute des messages reçus)
      const msgQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", storedUser.uid),
        orderBy("createdAt", "desc")
      );
      onSnapshot(msgQuery, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Un seul message par expéditeur pour la liste de survol
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
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 p-2" style={{ width: "300px", maxHeight: "400px", overflowY: "auto" }}>
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
                        // Marquer comme lu
                        if (!msg.isRead) {
                          await updateDoc(doc(db, "messages", msg.id), { isRead: true });
                        }
                        // Redirection vers le chat spécifique
                        navigate("/messages", {
                          state: {
                            contactId: msg.senderId,
                            contactName: msg.senderName
                          }
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
                        {/* Aperçu du contenu (texte ou vocal) */}
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

          {/* 🔔 SECTION NOTIFICATIONS */}
          <div className="position-relative me-3" ref={notifRef}>
            <button className="btn btn-link position-relative" onClick={() => setShowNotif(!showNotif)}>
              <i className="bi bi-bell fs-5 text-dark"></i>
              {unreadNotifs > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{unreadNotifs}</span>}
            </button>
            {showNotif && (
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 p-2" style={{ width: "320px", maxHeight: "450px", overflowY: "auto" }}>
                <h6 className="m-0 fw-bold p-2 border-bottom">Notifications</h6>
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 border-bottom small" onClick={() => updateDoc(doc(db, "notifications", notif.id), { isRead: true })}>
                    {notif.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 👤 PROFIL */}
          <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
            <img
              src={userInfo.photo || `https://ui-avatars.com/api/?name=${userInfo.prenom}+${userInfo.nom}&background=00a5a8&color=fff`}
              className="rounded-circle border"
              style={{ width: "38px", height: "38px", cursor: "pointer", objectFit: "cover" }}
              alt="Profile"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 py-2 bg-white" style={{ minWidth: "200px" }}>
                <button className="dropdown-item" onClick={() => navigate("/profil")}>Mon Profil</button>
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