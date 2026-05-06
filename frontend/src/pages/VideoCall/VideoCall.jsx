import React, { useState, useEffect, useCallback } from "react"; // Ajout de useCallback
import { useParams, useNavigate } from "react-router-dom"; // Retrait de useLocation
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

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const VideoCallContent = () => {
    const { callId } = useParams();
    const navigate = useNavigate();
    // ✅ Suppression de useLocation (warning Line 26:11)

    const [active, setActive] = useState(true);
    const [micOn, setMic] = useState(true);
    const [videoOn, setVideo] = useState(true);

    useJoin({ appid: APP_ID, channel: callId, token: null }, active);

    // ✅ Correction du warning Line 35:13 (Retrait de la variable inutilisée)
    useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(videoOn);
    const remoteUsers = useRemoteUsers();

    // ✅ Définition de handleCleanExit avec useCallback pour stabiliser la référence
    const handleCleanExit = useCallback(() => {
        setActive(false);
        navigate(-1);
    }, [navigate]);

    // ✅ Correction du warning Line 48:8 (Ajout de handleCleanExit dans les dépendances)
    useEffect(() => {
        if (!callId) return;
        const unsub = onSnapshot(doc(db, "calls", callId), (docSnap) => {
            if (docSnap.exists() && (docSnap.data().status === "ended" || docSnap.data().status === "rejected")) {
                handleCleanExit();
            }
        });
        return () => unsub();
    }, [callId, handleCleanExit]);

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

            <div className="local-video-pip shadow">
                <LocalVideoTrack track={localCameraTrack} play={true} />
            </div>

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

const VideoCall = () => (
    <AgoraRTCProvider client={client}>
        <VideoCallContent />
    </AgoraRTCProvider>
);

export default VideoCall;