import React from "react";
import { FaPhone, FaPhoneSlash, FaVideo } from "react-icons/fa";
import "./IncomingCallModal.css";

const IncomingCallModal = ({ callData, onAccept, onReject }) => {
    return (
        <div className="call-modal-overlay">
            <div className="call-modal-card shadow-lg">
                <div className="call-modal-body text-center">
                    <div className="caller-avatar-container mb-3">
                        <img
                            src={`https://ui-avatars.com/api/?name=${callData.callerName}&background=00a5a8&color=fff`}
                            alt="caller"
                            className="caller-avatar pulse-animation"
                        />
                        <div className="video-icon-badge">
                            <FaVideo size={12} />
                        </div>
                    </div>
                    <h5 className="fw-bold mb-1">{callData.callerName}</h5>
                    <p className="text-muted small mb-4">Appel vidéo entrant...</p>

                    <div className="d-flex justify-content-around w-100">
                        <button className="btn-call reject" onClick={onReject}>
                            <FaPhoneSlash />
                        </button>
                        <button className="btn-call accept" onClick={onAccept}>
                            <FaPhone />
                        </button>
                    </div>
                </div>
            </div>
            {/* Audio de sonnerie */}
            <audio src="/assets/sounds/ringtone.mp3" autoPlay loop />
        </div>
    );
};

export default IncomingCallModal;