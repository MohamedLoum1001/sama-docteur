import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { db } from "../../../firebase";
import { collection, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Star, Trash2, MessageSquare, Loader2, User, Calendar } from 'lucide-react';

const AvisAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, total: 0 });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcul de la moyenne
            if (data.length > 0) {
                const sum = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
                setStats({
                    average: (sum / data.length).toFixed(1),
                    total: data.length
                });
            }

            setReviews(data);
        } catch (error) {
            console.error("Erreur avis:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDeleteReview = async (id, patientName) => {
        if (window.confirm(`Supprimer l'avis de ${patientName} ?`)) {
            try {
                await deleteDoc(doc(db, "reviews", id));
                setReviews(reviews.filter(r => r.id !== id));
                // Recalculer les stats après suppression
                fetchReviews();
            } catch (error) {
                console.error("Erreur suppression avis:", error);
            }
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
        ));
    };

    return (
        <DashboardLayout>
            <div className="p-6 text-[#1a1c23]">
                <h1 className="text-2xl font-bold mb-6">Avis & Retours Clients</h1>

                {/* Dashboard de Statistiques Avis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                        <div className="bg-yellow-100 p-4 rounded-full text-yellow-600">
                            <Star size={32} className="fill-current" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Note Moyenne</p>
                            <h2 className="text-3xl font-black text-gray-800">{stats.average}/5</h2>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                        <div className="bg-[#00a5a8]/10 p-4 rounded-full text-[#00a5a8]">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total des avis</p>
                            <h2 className="text-3xl font-black text-gray-800">{stats.total} retours</h2>
                        </div>
                    </div>
                </div>

                {/* Liste des avis */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-20 text-gray-400">
                            <Loader2 className="animate-spin mb-2" />
                            <p>Chargement des avis...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-800">{review.patientName}</h4>
                                            <div className="flex gap-1 mt-0.5">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteReview(review.id, review.patientName)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer cet avis"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <p className="text-gray-600 text-sm italic leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-[#00a5a8]">
                                    "{review.comment || "Aucun commentaire laissé."}"
                                </p>

                                <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : "Date inconnue"}
                                    </div>
                                    <div className="text-[#00a5a8]">
                                        Docteur : {review.doctorName}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-xl border text-center text-gray-400 border-dashed">
                            <MessageSquare className="mx-auto mb-4 opacity-20" size={48} />
                            <p>Aucun avis n'a encore été publié sur la plateforme.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AvisAdmin;