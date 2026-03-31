import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { FaPhone, FaMapMarkerAlt, FaStethoscope, FaArrowLeft, FaEnvelope } from "react-icons/fa";

const DoctorProfile = () => {
    const { id } = useParams(); // ID du docteur
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const docRef = doc(db, "users", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctor(docSnap.data());
                }
            } catch (error) {
                console.error("Erreur récupération:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    // Fonction pour rediriger vers la messagerie
    const handleContactClick = () => {
        if (!storedUser) {
            navigate("/login");
            return;
        }

        // Si c'est un patient qui regarde le profil, on le redirige vers le chat
        // On peut passer l'ID du docteur dans l'URL ou via l'état
        navigate("/messages", { state: { contactId: id, contactName: `Dr. ${doctor.prenom} ${doctor.nom}` } });
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-teal-600 font-bold">Chargement...</div>;
    if (!doctor) return <div className="flex justify-center items-center h-screen text-red-500">Introuvable.</div>;

    return (
        <div className="container mx-auto px-4 py-10 mt-16 relative text-left">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-teal-600 font-semibold bg-transparent border-none cursor-pointer">
                <FaArrowLeft className="mr-2" /> Retour
            </button>

            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-teal-600 p-8 text-center text-white">
                    <img
                        src={doctor.photo || `https://ui-avatars.com/api/?name=${doctor.prenom}+${doctor.nom}&background=fff&color=00a5a8`}
                        alt="Profil"
                        className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover mb-4"
                    />
                    <h2 className="text-3xl font-bold uppercase">Dr. {doctor.prenom} {doctor.nom}</h2>
                    <p className="text-teal-100 text-lg">{doctor.specialite || "Médecin Généraliste"}</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-start">
                            <div className="bg-teal-50 p-3 rounded-xl mr-4 text-teal-600"><FaStethoscope /></div>
                            <div>
                                <p className="text-gray-400 text-sm italic m-0">Spécialité</p>
                                <p className="font-semibold m-0">{doctor.specialite || "Non spécifiée"}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-teal-50 p-3 rounded-xl mr-4 text-teal-600"><FaPhone /></div>
                            <div>
                                <p className="text-gray-400 text-sm italic m-0">Téléphone</p>
                                <p className="font-semibold m-0">{doctor.telephone || "Non renseigné"}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-teal-50 p-3 rounded-xl mr-4 text-teal-600"><FaMapMarkerAlt /></div>
                            <div>
                                <p className="text-gray-400 text-sm italic m-0">Adresse du cabinet</p>
                                <p className="font-semibold m-0">{doctor.adresse || "Non disponible"}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-teal-50 p-3 rounded-xl mr-4 text-teal-600"><FaEnvelope /></div>
                            <div>
                                <p className="text-gray-400 text-sm italic m-0">Email</p>
                                <p className="font-semibold m-0">{doctor.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        {/* BOUTON CONTACTER : REDIRECTION VERS MESSAGERIE */}
                        <button
                            className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-[#00a5a8] border-none cursor-pointer hover:opacity-90 transition-all"
                            onClick={handleContactClick}
                        >
                            <FaEnvelope /> Contacter
                        </button>

                        <button
                            className="flex-1 py-4 border-2 border-teal-600 text-teal-600 rounded-2xl font-bold bg-white cursor-pointer hover:bg-teal-50 transition-all"
                            onClick={() => navigate(`/rendez-vous/${id}`)}
                        >
                            Prendre RDV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;