import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { FaPhone, FaStethoscope, FaArrowLeft, FaEnvelope } from "react-icons/fa";
// ✅ Importation du composant réutilisable
import Button from "../../../components/boutons/Button";

const DoctorProfile = () => {
    const { id } = useParams();
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
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    const handleContactClick = () => {
        if (!storedUser) {
            navigate("/login");
            return;
        }
        navigate("/messages", {
            state: {
                contactId: id,
                contactName: `Dr. ${doctor.prenom} ${doctor.nom}`,
                contactPhoto: doctor.photo || ""
            }
        });
    };

    if (loading) return <div className="text-center mt-20 text-teal-600">Chargement du profil...</div>;
    if (!doctor) return <div className="text-center mt-20 text-red-500">Docteur introuvable.</div>;

    return (
        <div className="container mx-auto px-4 py-10 mt-16 text-left">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-teal-600 font-semibold bg-transparent border-0">
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
                    <p className="text-teal-100 text-lg">{doctor.specialite || "Médecin"}</p>
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
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        {/* ✅ Utilisation du composant Button pour Contacter */}
                        <Button
                            variant="login"
                            className="flex-1 py-4"
                            onClick={handleContactClick}
                            label={
                                <>
                                    <FaEnvelope className="mr-2" /> Contacter
                                </>
                            }
                        />

                        {/* ✅ Utilisation du composant Button pour Prendre RDV */}
                        <Button
                            variant="register" // Utilise le bleu pour différencier les deux actions
                            className="flex-1 py-4"
                            onClick={() => navigate(`/rendez-vous/${id}`)}
                            label="Prendre RDV"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;