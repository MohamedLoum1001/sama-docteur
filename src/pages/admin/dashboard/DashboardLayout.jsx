import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { icon: "fa-tachometer-alt", text: "Dashboard", link: "/dashboard" },
        { icon: "fa-users", text: "Utilisateurs", link: "/users" },
        { icon: "fa-check-circle", text: "Validation", link: "/validations" },
        { icon: "fa-stethoscope", text: "Spécialités", link: "/specialites" },
        { icon: "fa-credit-card", text: "Paiements", link: "/paiements" },
        { icon: "fa-comments", text: "Avis", link: "/avis" },
        { icon: "fa-calendar-check", text: "Plannings", link: "/plannings" },
        { icon: "fa-bell", text: "Notifications", link: "/notifications" },
        { icon: "fa-cogs", text: "Modération", link: "/moderation" },
        { icon: "fa-user-plus", text: "Ajout Users", link: "/add-users" },
    ];

    return (
        <div className="flex h-screen bg-gray-100">

            {/* SIDEBAR */}
            <aside
                className={`relative shadow-xl bg-white border-r transition-all duration-300
                ${sidebarOpen ? "w-64" : "w-20"}`}
            >
                {/* Toggle Button */}
                <div className="absolute -right-3 top-5">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>

                {/* Logo */}
                <div className="p-6 flex items-center gap-3 border-b">
                    <div className="bg-blue-600 text-white rounded-xl p-2 shadow">
                        <i className="fas fa-hospital fs-4"></i>
                    </div>
                    {sidebarOpen && (
                        <h2 className="text-xl font-bold text-gray-800">SamaDocteur</h2>
                    )}
                </div>

                {/* MENU */}
                <nav className="mt-6 px-3">
                    <ul className="space-y-2">
                        {menuItems.map((item, index) => {
                            const active = location.pathname.startsWith(item.link);

                            return (
                                <li key={index}>
                                    <Link
                                        to={item.link}
                                        className={`
                                            flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer
                                            transition-all duration-200
                                            ${active
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                                            }
                                        `}
                                    >
                                        <i className={`fas ${item.icon} text-lg`}></i>
                                        {sidebarOpen && <span>{item.text}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
