import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    CreditCard, MessageSquare, CalendarCheck, Bell,
    ChevronLeft, Menu
} from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
        { path: '/users', label: 'Utilisateurs', icon: <Users size={22} /> },
        { path: '/paiements', label: 'Paiements', icon: <CreditCard size={22} /> },
        { path: '/avis-admin', label: 'Avis', icon: <MessageSquare size={22} /> },
        { path: '/rapports', label: 'Rapports', icon: <CalendarCheck size={22} /> },
        { path: '/notifications', label: 'Notifications', icon: <Bell size={22} /> },
    ];

    return (
        <div className={`relative flex flex-col bg-[#1a1c23] text-gray-300 transition-all duration-300 min-h-screen shadow-xl ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-[#00a5a8] text-white transition-colors"
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.path} style={{ listStyleType: 'none' }} className="mb-2">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#00a5a8] text-white' : 'hover:bg-gray-800'}`}
                            >
                                <div className="flex-shrink-0">{item.icon}</div>
                                {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;