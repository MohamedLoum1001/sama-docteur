import React from "react";
import DashboardLayout from "./DashboardLayout"; // Votre layout
import {
    Users, UserCheck, Stethoscope,
    CreditCard, Calendar, Activity
} from "lucide-react";

const AdminDashboard = () => {
    // Données fictives pour l'exemple
    const stats = [
        { title: "Total Utilisateurs", value: "1,254", icon: <Users />, color: "bg-blue-500" },
        { title: "Médecins Validés", value: "482", icon: <UserCheck />, color: "bg-teal-500" },
        { title: "Rendez-vous", value: "8,940", icon: <Calendar />, color: "bg-indigo-500" },
        { title: "Revenus (Mensuel)", value: "12,450€", icon: <CreditCard />, color: "bg-emerald-500" },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Tableau de bord Admin</h1>
                    <p className="text-gray-500">Bienvenue sur votre espace de gestion SamaDocteur.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart / Area Placeholder */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="text-blue-600" size={20} />
                                Activité des inscriptions
                            </h3>
                            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 outline-none">
                                <option>7 derniers jours</option>
                                <option>30 derniers jours</option>
                            </select>
                        </div>
                        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">[ Espace pour un Graphique Chart.js / Recharts ]</p>
                        </div>
                    </div>

                    {/* Recent Validations */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6">Médecins à valider</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            DR
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Dr. Jean Dupont</p>
                                            <p className="text-xs text-gray-500">Cardiologue</p>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                                        <i className="fas fa-chevron-right text-xs"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-gray-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition">
                            Voir toutes les demandes
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;