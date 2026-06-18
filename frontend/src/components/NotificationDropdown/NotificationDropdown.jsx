import React from "react";
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../configuration/firebase";

const NotificationDropdown = ({ notifications, unreadNotifs, formatDateTime }) => {

    // Fonction pour marquer toutes les notifications comme lues
    const markAllAsRead = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        const batch = writeBatch(db);
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            where("isRead", "==", false)
        );

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((document) => {
                batch.update(doc(db, "notifications", document.id), { isRead: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Erreur lors du marquage comme lu :", error);
        }
    };

    return (
        <div
            className="dropdown-menu dropdown-menu-end show shadow border-0 mt-2 p-0"
            style={{
                // --- STYLES RESPONSIVES ---
                width: window.innerWidth < 576 ? "90vw" : "320px",
                position: window.innerWidth < 576 ? "fixed" : "absolute",
                right: window.innerWidth < 576 ? "5vw" : 0,
                left: window.innerWidth < 576 ? "5vw" : "auto",
                top: window.innerWidth < 576 ? "75px" : "auto",
                zIndex: 2000,
                // --------------------------
                maxHeight: "450px",
                overflowY: "auto",
                display: "block",
                borderRadius: "12px",
            }}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light rounded-top">
                <h6 className="m-0 fw-bold text-dark">Notifications</h6>
                {unreadNotifs > 0 && (
                    <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>
                        {unreadNotifs} nouvelles
                    </span>
                )}
            </div>

            {/* Liste des notifications */}
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center">
                        <i className="bi bi-bell-slash text-muted fs-2"></i>
                        <p className="text-muted small mt-2">Aucune notification</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-3 border-bottom small position-relative ${!notif.isRead ? "bg-white fw-bold" : "bg-light text-muted"}`}
                            style={{ cursor: "pointer", transition: "0.2s" }}
                            onClick={() => !notif.isRead && updateDoc(doc(db, "notifications", notif.id), { isRead: true })}
                        >
                            <div className="d-flex align-items-start">
                                {!notif.isRead && (
                                    <div
                                        className="bg-primary rounded-circle me-2"
                                        style={{ width: '8px', height: '8px', marginTop: '6px', flexShrink: 0 }}
                                    ></div>
                                )}
                                <div className="flex-grow-1">
                                    <p className="mb-1 text-dark" style={{ lineHeight: '1.4' }}>{notif.message}</p>
                                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                        <i className="bi bi-clock me-1"></i>
                                        {formatDateTime(notif.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Action */}
            {notifications.length > 0 && (
                <button
                    onClick={markAllAsRead}
                    className="btn btn-link w-100 py-2 small text-decoration-none text-primary border-top"
                    style={{ fontSize: '0.8rem', fontWeight: '600', backgroundColor: '#fff' }}
                >
                    Tout marquer comme lu
                </button>
            )}
        </div>
    );
};

export default NotificationDropdown;