import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    CreditCard, MessageSquare, CalendarCheck, Bell,
    ChevronLeft, Menu, X
} from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Pour le menu mobile

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
        { path: '/users', label: 'Utilisateurs', icon: <Users size={22} /> },
        { path: '/paiements', label: 'Paiements', icon: <CreditCard size={22} /> },
        { path: '/avis-admin', label: 'Avis', icon: <MessageSquare size={22} /> },
        { path: '/rapports', label: 'Rapports', icon: <CalendarCheck size={22} /> },
        { path: '/notifications', label: 'Notifications', icon: <Bell size={22} /> },
    ];

    return (
        <>
            {/* Bouton Hamburger Mobile (visible uniquement sur mobile) */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-[#1a1c23] text-white rounded-lg shadow-lg">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay Mobile (cliquer à côté pour fermer) */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:relative z-40 flex flex-col bg-[#1a1c23] text-gray-300 transition-all duration-300 min-h-screen shadow-xl 
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}>

                <div className="hidden lg:flex items-center justify-between h-20 px-6 border-b border-gray-700">
                    {!isCollapsed && <span className="font-bold text-[#00a5a8]">Sama Docteur</span>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-[#00a5a8] text-white transition-colors"
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 py-10 lg:py-6 overflow-y-auto mt-10 lg:mt-0">
                    <ul className="list-none p-0 m-0">
                        {menuItems.map((item) => (
                            <li key={item.path} className="mb-2 list-none">
                                <NavLink
                                    to={item.path}
                                    onClick={() => setIsOpen(false)} // Ferme le menu au clic sur mobile
                                    className={({ isActive }) => `flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#00a5a8] text-white' : 'hover:bg-gray-800'}`}
                                >
                                    <div className="flex-shrink-0">{item.icon}</div>
                                    <span className={`${isCollapsed ? 'lg:hidden' : 'block'} ml-4 font-medium whitespace-nowrap`}>
                                        {item.label}
                                    </span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;