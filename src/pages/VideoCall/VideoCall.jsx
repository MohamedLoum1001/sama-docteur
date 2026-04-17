import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AgoraRTC, {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    useRemoteUsers,
    RemoteUser,
    LocalVideoTrack,
} from "agora-rtc-react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import "./VideoCall.css";

// ✅ Récupération de l'ID depuis le fichier .env (préfixe REACT_APP obligatoire)
const APP_ID = process.env.REACT_APP_AGORA_APP_ID;

// Initialisation du client Agora
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const VideoCallContent = () => {
    const { callId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(true);
    const [micOn, setMic] = useState(true);
    const [videoOn, setVideo] = useState(true);

    // 1. Rejoindre le canal Agora (on utilise callId comme nom de salon)
    useJoin({ appid: APP_ID, channel: callId, token: null }, active);

    // 2. Création des flux locaux (caméra et micro)
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(videoOn);
    const remoteUsers = useRemoteUsers();

    // 3. Écouter si l'autre personne raccroche via Firestore
    useEffect(() => {
        if (!callId) return;
        const unsub = onSnapshot(doc(db, "calls", callId), (docSnap) => {
            if (docSnap.exists() && (docSnap.data().status === "ended" || docSnap.data().status === "rejected")) {
                handleCleanExit();
            }
        });
        return () => unsub();
    }, [callId]);

    const handleCleanExit = () => {
        setActive(false);
        navigate(-1);
    };

    const endCall = async () => {
        try {
            await updateDoc(doc(db, "calls", callId), { status: "ended" });
            handleCleanExit();
        } catch (error) {
            console.error("Erreur lors de la fermeture de l'appel:", error);
            handleCleanExit();
        }
    };

    return (
        <div className="video-call-container">
            {/* Vidéo de l'autre personne (Grand écran) */}
            <div className="remote-video-wrapper">
                {remoteUsers.length > 0 ? (
                    remoteUsers.map((user) => (
                        <RemoteUser key={user.uid} user={user} />
                    ))
                ) : (
                    <div className="waiting-screen">
                        <div className="text-center">
                            <div className="spinner-border text-light mb-3" role="status"></div>
                            <p>En attente du correspondant...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Ma vidéo (Petit écran flottant) */}
            <div className="local-video-pip shadow">
                <LocalVideoTrack track={localCameraTrack} play={true} />
            </div>

            {/* Barre de contrôle type WhatsApp */}
            <div className="call-controls shadow-lg">
                <button
                    className={`control-btn ${!micOn ? "off" : ""}`}
                    onClick={() => setMic(prev => !prev)}
                >
                    {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>

                <button className="control-btn end-call" onClick={endCall}>
                    <FaPhoneSlash />
                </button>

                <button
                    className={`control-btn ${!videoOn ? "off" : ""}`}
                    onClick={() => setVideo(prev => !prev)}
                >
                    {videoOn ? <FaVideo /> : <FaVideoSlash />}
                </button>
            </div>
        </div>
    );
};

// Wrapper avec le Provider Agora
const VideoCall = () => (
    <AgoraRTCProvider client={client}>
        <VideoCallContent />
    </AgoraRTCProvider>
);

export default VideoCall;