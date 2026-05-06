import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, } from "firebase/firestore";
import DashboardLayout from "../dashboard/DashboardLayout";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, Calendar, TrendingUp, Loader2 } from "lucide-react";

const Rapports = () => {
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [specialtyData, setSpecialtyData] = useState([]);
    const [visitData, setVisitData] = useState([]);

    const COLORS = ["#00a5a8", "#6366f1", "#f43f5e", "#eab308", "#8b5cf6", "#ec4899"];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Récupération des Utilisateurs pour Inscriptions & Spécialités
                const userSnapshot = await getDocs(collection(db, "users"));
                const allUsers = userSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));

                // --- Logique Inscriptions ---
                const dailyMap = {};
                let currentMonthCount = 0;
                const now = new Date();

                allUsers.forEach(user => {
                    const dateStr = user.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;

                    if (user.createdAt.getMonth() === now.getMonth() && user.createdAt.getFullYear() === now.getFullYear()) {
                        currentMonthCount++;
                    }
                });

                const formattedDaily = Object.keys(dailyMap).map(date => ({
                    date,
                    count: dailyMap[date]
                })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

                setUserStats(formattedDaily);
                setMonthlyTotal(currentMonthCount);

                // --- Logique Spécialités (Cercle) ---
                const specMap = {};
                allUsers.filter(u => u.role === "medecin").forEach(m => {
                    const s = m.specialite || "Généraliste";
                    specMap[s] = (specMap[s] || 0) + 1;
                });

                const formattedSpec = Object.keys(specMap)
                    .map(name => ({ name, value: specMap[name] }))
                    .sort((a, b) => b.value - a.value);

                setSpecialtyData(formattedSpec);

                // 2. Récupération des Visites (Dynamique si tu as une collection 'visites')
                // Note: Si tu n'as pas encore cette collection, voici comment simuler une structure 
                // que tu pourras alimenter plus tard avec un useEffect sur ton App.js
                const visitSnapshot = await getDocs(collection(db, "stats_visites"));
                if (!visitSnapshot.empty) {
                    const visits = visitSnapshot.docs.map(doc => doc.data());
                    setVisitData(visits);
                } else {
                    // Fallback si vide pour la démo, mais prêt pour le dynamique
                    setVisitData([
                        { day: "Lun", visits: 10 }, { day: "Mar", visits: 25 }, { day: "Mer", visits: 45 },
                        { day: "Jeu", visits: 30 }, { day: "Ven", visits: 55 }, { day: "Sam", visits: 70 }, { day: "Dim", visits: 40 }
                    ]);
                }

            } catch (error) {
                console.error("Erreur rapports détaillés:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-[#00a5a8]">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-bold">Génération des rapports dynamiques...</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="p-6 bg-[#F8FAFC] min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">📈 Rapports & Analytics</h1>
                    <p className="text-gray-500 text-sm">Données extraites en temps réel de SamaDocteur</p>
                </div>

                {/* KPI Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-md-6">
                        <div className="bg-white p-4 rounded-4 shadow-sm border-0 card h-100 border-l-4 border-[#00a5a8]">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00a5a8]/10 p-3 rounded-3 text-[#00a5a8]">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-0">Nouveaux ce mois-ci</p>
                                    <h2 className="text-2xl font-black text-gray-800">{monthlyTotal} Inscriptions</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Graphique Inscriptions */}
                    <div className="col-lg-8">
                        <div className="bg-white p-5 rounded-4 shadow-sm h-100 border border-gray-100">
                            <h5 className="font-bold mb-6 flex items-center gap-2 text-gray-700">
                                <Users size={20} className="text-[#6366f1]" /> Flux des Inscriptions
                            </h5>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={userStats}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Spécialités */}
                    <div className="col-lg-4">
                        <div className="bg-white p-5 rounded-4 shadow-sm h-100 border border-gray-100">
                            <h5 className="font-bold mb-6 text-gray-700">Parts de Marché / Spécialité</h5>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={specialtyData}
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {specialtyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Trafic */}
                    <div className="col-12 mt-4">
                        <div className="bg-white p-5 rounded-4 shadow-sm border border-gray-100">
                            <h5 className="font-bold mb-6 flex items-center gap-2 text-gray-700">
                                <Calendar size={20} className="text-[#00a5a8]" /> Activité du Site (Visites)
                            </h5>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={visitData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="visits" stroke="#00a5a8" strokeWidth={4} dot={{ r: 6, fill: "#00a5a8", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Rapports;