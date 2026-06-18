import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../configuration/firebase";
import {
    collection, query, onSnapshot, orderBy,
    addDoc, serverTimestamp, doc
} from "firebase/firestore";
import { FaPaperPlane, FaArrowLeft, FaMicrophone, FaStop, FaTrash, FaCheckDouble, FaVideo } from "react-icons/fa";
import "./Messages.css";

const Messages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef();

    const contactId = location.state?.contactId;
    const contactName = location.state?.contactName || "Discussion";

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);

    const [currentUserData, setCurrentUserData] = useState(null);
    const [contactData, setContactData] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!contactId) navigate("/");
    }, [contactId, navigate]);

    useEffect(() => {
        if (!user?.uid) return;
        const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) setCurrentUserData(docSnap.data());
        });
        return () => unsub();
    }, [user?.uid]);

    useEffect(() => {
        if (!contactId) return;
        const unsub = onSnapshot(doc(db, "users", contactId), (docSnap) => {
            if (docSnap.exists()) setContactData(docSnap.data());
        });
        return () => unsub();
    }, [contactId]);

    useEffect(() => {
        if (!user?.uid || !contactId) return;
        const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filtered = allMsgs.filter(m =>
                (m.senderId === user.uid && m.receiverId === contactId) ||
                (m.senderId === contactId && m.receiverId === user.uid)
            );
            setMessages(filtered);
        }, (error) => console.error("Erreur Firestore :", error));
        return () => unsubscribe();
    }, [contactId, user.uid]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startVideoCall = async () => {
        try {
            const callRef = await addDoc(collection(db, "calls"), {
                callerId: user.uid,
                callerName: currentUserData?.prenom || "Un utilisateur",
                receiverId: contactId,
                status: "ringing",
                type: "video",
                createdAt: serverTimestamp(),
            });

            navigate(`/video-call/${callRef.id}`, {
                state: { isCaller: true, contactName: contactData ? `Dr. ${contactData.prenom} ${contactData.nom}` : contactName }
            });
        } catch (err) {
            console.error("Erreur appel:", err);
            alert("Impossible de lancer l'appel.");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) { alert("Micro non supporté."); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const sendAudioMessage = async () => {
        if (!audioBlob) return;
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            await addDoc(collection(db, "messages"), {
                senderId: user.uid,
                receiverId: contactId,
                audioData: reader.result,
                type: "audio",
                createdAt: serverTimestamp(),
            });
            setAudioBlob(null);
        };
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        await addDoc(collection(db, "messages"), {
            senderId: user.uid,
            receiverId: contactId,
            content: input.trim(),
            type: "text",
            createdAt: serverTimestamp(),
        });
        setInput("");
    };

    return (
        <div className="chat-wrapper mx-auto px-3">
            <div className="chat-card shadow-lg mt-10 mb-0">

                {/* Header WhatsApp-style corrigé */}
                <div className="chat-header-custom d-flex align-items-center justify-content-between px-3">
                    <div className="d-flex align-items-center flex-grow-1">
                        <button onClick={() => navigate(-1)} className="btn-back me-2">
                            <FaArrowLeft />
                        </button>

                        <div className="user-profile-info d-flex align-items-center" style={{ cursor: 'pointer' }}>
                            <img
                                src={contactData?.photo || `https://ui-avatars.com/api/?name=${contactName}&background=ccc&color=fff`}
                                alt="avatar"
                                className="avatar-img"
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            />
                            <div className="ms-2 d-flex flex-column justify-content-center">
                                <h6 className="m-0 text-white font-bold header-name">
                                    {contactData ? `Dr. ${contactData.prenom} ${contactData.nom}` : contactName}
                                </h6>
                                <small className="online-status" style={{ color: '#e0e0e0', fontSize: '0.75rem' }}>en ligne</small>
                            </div>
                        </div>
                    </div>

                    {/* SECTION ACTIONS (Icône Vidéo) */}
                    <div className="header-actions">
                        <button
                            className="btn-call-video"
                            onClick={startVideoCall}
                            title="Lancer un appel vidéo"
                            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', padding: '10px' }}
                        >
                            <FaVideo />
                        </button>
                    </div>
                </div>

                <div className="chat-body">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user.uid;
                        const profilePic = isMe ? currentUserData?.photo : contactData?.photo;
                        const nameToDisplay = isMe ? 'Moi' : contactName;
                        const defaultAvatar = `https://ui-avatars.com/api/?name=${nameToDisplay}&background=${isMe ? '00a5a8' : 'ccc'}&color=fff`;

                        return (
                            <div key={msg.id} className={`msg-container ${isMe ? "msg-sent" : "msg-received"}`}>
                                <div className="msg-bubble">
                                    {msg.type === "audio" ? (
                                        <div className="whatsapp-audio-container">
                                            <div className="audio-avatar-wrapper">
                                                <img src={profilePic || defaultAvatar} alt="avatar" className="audio-inline-pic" />
                                                <div className="mic-badge">
                                                    <FaMicrophone size={8} color="#00a5a8" />
                                                </div>
                                            </div>
                                            <audio src={msg.audioData} controls className="audio-mini" />
                                        </div>
                                    ) : (
                                        <span className="msg-text">{msg.content}</span>
                                    )}
                                    <div className="msg-meta">
                                        {msg.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <FaCheckDouble className="ms-1 read-icon" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>

                <div className="chat-footer-custom">
                    {audioBlob ? (
                        <div className="audio-preview-bar">
                            <button className="btn-action trash" onClick={() => setAudioBlob(null)}><FaTrash /></button>
                            <span className="flex-grow-1 text-center small text-muted">Audio prêt...</span>
                            <button className="btn-action send-vocal" onClick={sendAudioMessage}><FaPaperPlane /></button>
                        </div>
                    ) : (
                        <form className="chat-form" onSubmit={sendMessage}>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder={isRecording ? "Enregistrement..." : "Écrivez un message..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isRecording}
                            />
                            <button type={input.trim() ? "submit" : "button"}
                                className={`btn-main ${isRecording ? 'recording' : ''}`}
                                onClick={!input.trim() ? (isRecording ? stopRecording : startRecording) : undefined}>
                                {input.trim() ? <FaPaperPlane /> : (isRecording ? <FaStop /> : <FaMicrophone />)}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;