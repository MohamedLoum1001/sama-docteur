// src/pages/admin/dashboard/DashboardLayout.jsx
import React from "react";
import Sidebar from "../sidebar/Sidebar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar fixe à gauche */}
            <Sidebar />

            {/* Zone de contenu à droite */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Espace de travail avec défilement propre */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;