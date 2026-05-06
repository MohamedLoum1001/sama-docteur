import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * Convertit un champ "createdAt" provenant de Firestore en objet Date.
 * Supporte :
 * - Timestamp Firestore (méthode toDate)
 * - Objet { seconds } (ex: export)
 * - Nombre (millisecondes)
 * - Chaîne ISO ou format "dd/MM/yyyy" ou "dd/MM/yyyy HH:mm"
 */
const convertirDateFirestore = (ts) => {
  if (!ts) return null;

  // Timestamp Firestore
  if (typeof ts === "object" && typeof ts.toDate === "function") {
    try {
      return ts.toDate();
    } catch {
      return null;
    }
  }

  // Objet avec seconds
  if (typeof ts === "object" && typeof ts.seconds === "number") {
    return new Date(ts.seconds * 1000);
  }

  // Nombre (millisecondes)
  if (typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d) ? null : d;
  }

  // Chaîne de caractères
  if (typeof ts === "string") {
    const dIso = new Date(ts);
    if (!isNaN(dIso)) return dIso;

    // Format dd/MM/yyyy ou dd/MM/yyyy HH:mm
    const match = ts.match(
      /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?/
    );
    if (match) {
      const [, dd, mm, yyyy, hh = "00", min = "00"] = match;
      const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
      const d = new Date(iso);
      return isNaN(d) ? null : d;
    }
  }

  return null;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Charger les notifications en temps réel
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Récupérer les notifications de l'utilisateur, triées par date décroissante
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Conversion robuste en Date
          createdAtDate: convertirDateFirestore(data.createdAt),
          appointmentDateObj: data.appointmentDate
            ? convertirDateFirestore(data.appointmentDate)
            : null,
        };
      });
      setNotifications(notifs);
    });

    return () => unsub();
  }, []);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Compter le nombre de notifications non lues
  const unreadCount = notifications.filter(
    (n) => !n.isRead && !n.read && !n.seen
  ).length;

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        isRead: true,
        read: true,
        seen: true,
      });
    } catch (err) {
      console.error("Impossible de marquer comme lu :", err);
    }
  };

  // Fonction pour envoyer une notification test (optionnel)
  const sendTestNotification = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Utilisateur non connecté");
    try {
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Notification de test",
        message: `Ceci est une notification de test (${new Date().toLocaleString()})`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de la notification");
    }
  };

  // Formatage des dates pour l'affichage
  const formatDatePourAffichage = (d) => {
    if (!d) return "Date inconnue";
    return d.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="position-relative" ref={ref}>
      {/* Bouton cloche */}
      <button
        className="btn btn-link position-relative"
        onClick={() => setOpen((s) => !s)}
        aria-label="Notifications"
      >
        <i className="bi bi-bell fs-5 text-dark"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menu notifications */}
      {open && (
        <div
          className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow"
          style={{
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            zIndex: 2000,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Notifications</strong>
            <small className="text-muted">
              {notifications.length} au total
            </small>
          </div>

          {notifications.length === 0 ? (
            <p className="text-center text-muted">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 mb-1 rounded ${
                  n.isRead || n.read || n.seen ? "bg-light" : "bg-white border"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => markAsRead(n.id)}
              >
                <div className="d-flex justify-content-between">
                  <div>
                    {n.title && <div className="fw-semibold">{n.title}</div>}
                    <div>{n.message}</div>
                    {/* Afficher la date du rendez-vous si elle existe */}
                    {n.appointmentDateObj && (
                      <small className="text-muted d-block">
                        RDV : {formatDatePourAffichage(n.appointmentDateObj)}
                      </small>
                    )}
                  </div>
                  <small
                    className="text-muted ms-2"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {n.createdAtDate
                      ? formatDatePourAffichage(n.createdAtDate)
                      : "Date inconnue"}
                  </small>
                </div>
              </div>
            ))
          )}

          {/* Boutons en bas du menu */}
          <div className="d-flex justify-content-between mt-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                notifications.forEach(async (n) => {
                  if (!n.isRead && n.id) {
                    try {
                      await updateDoc(doc(db, "notifications", n.id), {
                        isRead: true,
                        read: true,
                        seen: true,
                      });
                    } catch (e) {
                      // ignorer erreur
                    }
                  }
                });
              }}
            >
              Tout marquer lu
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={sendTestNotification}
            >
              Envoyer test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
