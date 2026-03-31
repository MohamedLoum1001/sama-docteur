import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import {
    collection, query, where, onSnapshot,
    orderBy, addDoc, serverTimestamp, doc, updateDoc
} from "firebase/firestore";
import { FaPaperPlane, FaUserCircle, FaSearch, FaCircle } from "react-icons/fa";
import "./DoctorMessages.css";

const DoctorMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    const doctor = JSON.parse(localStorage.getItem("user"));

    // 1. Charger la liste des conversations uniques
    useEffect(() => {
        if (!doctor?.uid) return;

        const q = query(
            collection(db, "messages"),
            where("receiverId", "==", doctor.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Grouper par patient unique pour créer la liste de gauche
            const uniquePatients = [];
            const map = new Map();
            for (const item of allMessages) {
                if (!map.has(item.senderId)) {
                    map.set(item.senderId, true);
                    uniquePatients.push({
                        id: item.senderId,
                        name: item.senderName,
                        lastMessage: item.content,
                        date: item.createdAt,
                        isRead: item.isRead
                    });
                }
            }
            setConversations(uniquePatients);
        });

        return () => unsubscribe();
    }, [doctor.uid]);

    // 2. Charger les messages de la conversation sélectionnée
    useEffect(() => {
        if (!selectedPatient || !doctor?.uid) return;

        const q = query(
            collection(db, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const filtered = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(m =>
                    (m.senderId === doctor.uid && m.receiverId === selectedPatient.id) ||
                    (m.senderId === selectedPatient.id && m.receiverId === doctor.uid)
                );
            setMessages(filtered);
        });

        return () => unsubscribe();
    }, [selectedPatient, doctor.uid]);

    // 3. Auto-scroll vers le bas
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 4. Envoi de la réponse
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPatient) return;

        try {
            await addDoc(collection(db, "messages"), {
                senderId: doctor.uid,
                senderName: `Dr. ${doctor.prenom} ${doctor.nom}`,
                receiverId: selectedPatient.id,
                content: newMessage,
                createdAt: serverTimestamp(),
                isRead: false
            });
            setNewMessage("");
        } catch (error) {
            console.error("Erreur d'envoi:", error);
        }
    };

    return (
        <div className="container-fluid mt-20 px-4">
            <div className="row g-0 chat-wrapper shadow-lg rounded-4 overflow-hidden bg-white">

                {/* COLONNE GAUCHE : LISTE PATIENTS */}
                <div className="col-md-4 border-end bg-light">
                    <div className="p-4 bg-white border-bottom">
                        <h5 className="fw-bold text-teal-600 mb-3">Mes Patients</h5>
                        <div className="search-box position-relative">
                            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            <input type="text" className="form-control rounded-pill ps-5" placeholder="Rechercher..." />
                        </div>
                    </div>
                    <div className="overflow-auto" style={{ height: "500px" }}>
                        {conversations.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPatient(p)}
                                className={`p-3 border-bottom d-flex align-items-center cursor-pointer transition ${selectedPatient?.id === p.id ? 'bg-teal-100' : 'hover-bg-gray'}`}
                            >
                                <div className="position-relative">
                                    <FaUserCircle className="fs-1 text-teal-600" />
                                    {!p.isRead && <FaCircle className="position-absolute top-0 end-0 text-danger fs-6 border border-white rounded-circle" />}
                                </div>
                                <div className="ms-3 overflow-hidden">
                                    <div className="fw-bold text-dark">{p.name}</div>
                                    <div className="text-muted small text-truncate">{p.lastMessage}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLONNE DROITE : CHAT AREA */}
                <div className="col-md-8 d-flex flex-col bg-white">
                    {selectedPatient ? (
                        <>
                            {/* Header Chat */}
                            <div className="p-3 border-bottom bg-white d-flex align-items-center">
                                <FaUserCircle className="fs-2 text-teal-600 me-3" />
                                <h6 className="m-0 fw-bold">{selectedPatient.name}</h6>
                            </div>

                            {/* Messages List */}
                            <div className="flex-grow-1 p-4 overflow-auto bg-chat-pattern" style={{ height: "400px" }}>
                                {messages.map((m) => (
                                    <div key={m.id} className={`d-flex mb-3 ${m.senderId === doctor.uid ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-3 rounded-4 shadow-sm max-w-75 ${m.senderId === doctor.uid ? 'bg-teal-600 text-white rounded-tr-0' : 'bg-white text-dark border rounded-tl-0'}`}>
                                            <div className="small">{m.content}</div>
                                            <div className="text-end mt-1" style={{ fontSize: "10px", opacity: 0.7 }}>
                                                {m.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSend} className="p-3 border-top bg-white d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control rounded-pill py-2 px-4 outline-none border-2"
                                    placeholder="Écrivez votre réponse..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-teal rounded-circle p-3 d-flex align-items-center justify-content-center shadow" style={{ backgroundColor: "#00a5a8", color: "white" }}>
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5">
                            <i className="bi bi-chat-dots fs-1 mb-3"></i>
                            <p>Sélectionnez un patient pour démarrer la discussion</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorMessages;