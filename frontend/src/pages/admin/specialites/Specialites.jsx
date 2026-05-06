import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { Plus, Scissors, Heart, Stethoscope } from 'lucide-react';

const Specialites = () => {
    const specs = [
        { name: "Dentisterie", icon: <Scissors />, count: 12 },
        { name: "Cardiologie", icon: <Heart />, count: 8 },
        { name: "Généraliste", icon: <Stethoscope />, count: 45 }
    ];

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Spécialités Médicales</h1>
                    <button className="bg-[#00a5a8] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition">
                        <Plus size={18} /> Ajouter
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {specs.map((s, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border text-center shadow-sm hover:shadow-md transition cursor-pointer">
                            <div className="w-14 h-14 bg-[#00a5a8]/10 text-[#00a5a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                {s.icon}
                            </div>
                            <h3 className="font-bold text-gray-800">{s.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{s.count} Médecins</p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Specialites;