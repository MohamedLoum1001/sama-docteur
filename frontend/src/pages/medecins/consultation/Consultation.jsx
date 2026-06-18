import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../configuration/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDocs
} from "firebase/firestore";
import {
    FaArrowLeft, FaPaperPlane, FaMicrophone, FaStop, FaUserCircle, FaSearch
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./Consultation.css"; 

const Consultation = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const scrollRef = useRef();

    // Infos Médecin
    const userString = localStorage.getItem("user");
    const userMedecin = userString ? JSON.parse(userString) : null;
    const medecinId = userMedecin?.uid || userMedecin?.id;

    // Charger la liste des patients
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "patient"));
                const snap = await getDocs(q);
                setPatients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) { console.error(err); }
        };
        fetchPatients();
    }, []);

    // Écouter les messages en temps réel quand un patient est sélectionné
    useEffect(() => {
        if (!selectedPatient || !medecinId) return;

        const chatId = [medecinId, selectedPatient.id].sort().join("_");
        const q = query(
            collection(db, "messages"),
            where("chatId", "==", chatId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return () => unsubscribe();
    }, [selectedPatient, medecinId]);

    // LOGIQUE VOCALE
    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Micro non supporté");

        const recognition = new SpeechRecognition();
        recognition.lang = "fr-FR";
        recognition.interimResults = true;

        if (isListening) {
            setIsListening(false);
            return;
        }

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join("");
            setNewMessage(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPatient) return;

        const chatId = [medecinId, selectedPatient.id].sort().join("_");
        try {
            await addDoc(collection(db, "messages"), {
                chatId,
                senderId: medecinId,
                receiverId: selectedPatient.id,
                text: newMessage,
                createdAt: serverTimestamp(),
            });
            setNewMessage("");
        } catch (err) { console.error(err); }
    };

    const filteredPatients = patients.filter(p =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="chat-container">
            {/* Barre latérale : Liste des Patients */}
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <button onClick={() => navigate("/medecin")} className="back-circle">
                        <FaArrowLeft />
                    </button>
                    <h3>Mes Patients</h3>
                </div>

                <div className="sidebar-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="patient-list">
                    {filteredPatients.map(p => (
                        <div
                            key={p.id}
                            className={`patient-item ${selectedPatient?.id === p.id ? "active" : ""}`}
                            onClick={() => setSelectedPatient(p)}
                        >
                            <div className="avatar-small">{p.prenom ? p.prenom[0] : "?"}{p.nom ? p.nom[0] : "?"}</div>
                            <div className="patient-meta">
                                <span className="name">{p.prenom} {p.nom}</span>
                                <span className="status">Patient</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Zone de Chat */}
            <div className="chat-main">
                {selectedPatient ? (
                    <>
                        <div className="chat-header">
                            <FaUserCircle size={35} className="text-teal" />
                            <div>
                                <h4 className="m-0">{selectedPatient.prenom} {selectedPatient.nom}</h4>
                                <small className="text-success">En ligne</small>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map((m) => (
                                <div key={m.id} className={`message-wrapper ${m.senderId === medecinId ? "sent" : "received"}`}>
                                    <div className="message-bubble">
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <button
                                type="button"
                                className={`voice-btn ${isListening ? "active" : ""}`}
                                onClick={toggleListening}
                            >
                                {isListening ? <FaStop /> : <FaMicrophone />}
                            </button>
                            <input
                                type="text"
                                placeholder="Écrivez votre message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="send-btn">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat">
                        <FaUserCircle size={80} className="opacity-25" />
                        <p>Sélectionnez un patient pour démarrer la discussion</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Consultation;