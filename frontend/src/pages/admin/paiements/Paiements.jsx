import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { db } from "../../../configuration/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Download, CreditCard, Loader2 } from 'lucide-react';

const Paiements = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Récupération des paiements triés par date décroissante
            const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcul du chiffre d'affaires total (en supposant que tu stockes 'amount')
            const total = data.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            setTransactions(data);
            setTotalRevenue(total);
        } catch (error) {
            console.error("Erreur récupération transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Formater les dates Firestore
    const formatDate = (timestamp) => {
        if (!timestamp) return "Date inconnue";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <div className="p-6 text-[#1a1c23]">
                <h1 className="text-2xl font-bold mb-6">Transactions & Revenus</h1>

                {/* Carte du Chiffre d'Affaires Dynamique */}
                <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8 flex justify-between items-center transition-all hover:shadow-md">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Chiffre d'affaires total</p>
                        <h2 className="text-3xl font-black text-[#00a5a8]">
                            {loading ? "Chargement..." : `${totalRevenue.toLocaleString()} FCFA`}
                        </h2>
                    </div>
                    <div className="bg-[#00a5a8]/10 p-4 rounded-full">
                        <CreditCard size={32} className="text-[#00a5a8]" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Dernières transactions</h3>

                    {loading ? (
                        <div className="flex flex-col items-center py-10 text-gray-400">
                            <Loader2 className="animate-spin mb-2" />
                            <p>Récupération des transactions...</p>
                        </div>
                    ) : transactions.length > 0 ? (
                        transactions.map((t) => (
                            <div key={t.id} className="bg-white p-4 rounded-xl border flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${t.status === 'succeeded' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <CreditCard size={20} className={t.status === 'succeeded' ? 'text-green-600' : 'text-gray-400'} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Consultation - {t.doctorName || "Médecin"}</p>
                                        <p className="text-[11px] text-gray-400">
                                            {formatDate(t.createdAt)} • {t.patientName || "Patient"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">+{t.amount?.toLocaleString()} FCFA</p>
                                    <button
                                        className="flex items-center gap-1 text-[10px] font-bold text-[#00a5a8] hover:underline ml-auto mt-1"
                                        onClick={() => window.print()} // Ou une fonction de génération de reçu PDF
                                    >
                                        <Download size={12} /> REÇU
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-10 rounded-xl border text-center text-gray-400">
                            Aucune transaction trouvée.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Paiements;