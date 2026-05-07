import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    CreditCard, MessageSquare, CalendarCheck, Bell,
    ChevronLeft, Menu, X
} from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
        { path: '/users', label: 'Utilisateurs', icon: <Users size={22} /> },
        { path: '/paiements', label: 'Paiements', icon: <CreditCard size={22} /> },
        { path: '/avis-admin', label: 'Avis', icon: <MessageSquare size={22} /> },
        { path: '/rapports', label: 'Rapports', icon: <CalendarCheck size={22} /> },
        { path: '/notifications', label: 'Notifications', icon: <Bell size={22} /> },
    ];

    // ✅ Styles mis à jour pour corriger la superposition avec la Navbar
    const sidebarStyle = {
        position: window.innerWidth < 992 ? 'fixed' : 'relative',
        left: 0,
        // SUR ORDINATEUR : On descend le sidebar sous la navbar (80px)
        // SUR MOBILE : On reste à 0 pour couvrir tout l'écran
        top: window.innerWidth < 992 ? 0 : '80px',
        height: window.innerWidth < 992 ? '100vh' : 'calc(100vh - 80px)',
        backgroundColor: '#1a1c23',
        // ON DIMINUE LE Z-INDEX SUR PC : pour qu'il passe sous la navbar
        zIndex: window.innerWidth < 992 ? 1050 : 900,
        transition: 'transform 0.3s ease, width 0.3s ease',
        transform: (window.innerWidth < 992 && !isOpen) ? 'translateX(-100%)' : 'translateX(0)',
        width: isCollapsed ? '80px' : '260px',
        overflow: 'hidden'
    };

    return (
        <>
            {/* BOUTON HAMBURGER (Visible uniquement sur Mobile/Tablette) */}
            <div className="d-lg-none" style={{ position: 'fixed', top: '15px', left: '15px', zIndex: 1100 }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn border-0 shadow-lg text-white"
                    style={{ backgroundColor: '#1a1c23', padding: '10px' }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* OVERLAY (Floute le fond sur mobile quand le menu est ouvert) */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040
                    }}
                />
            )}

            {/* SIDEBAR */}
            <div style={sidebarStyle} className="shadow-xl flex flex-col">

                {/* Logo & Toggle (Desktop uniquement) */}
                <div className="d-none d-lg-flex align-items-center justify-content-between border-bottom border-secondary px-4" style={{ height: '80px' }}>
                    {!isCollapsed && <span className="fw-bold text-white" style={{ color: '#00a5a8' }}>Sama Docteur</span>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="btn btn-dark btn-sm text-info border-0"
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 mt-5 mt-lg-0 overflow-auto flex-grow-1">
                    <ul className="list-unstyled p-0 m-0">
                        {menuItems.map((item) => (
                            <li key={item.path} className="mb-2">
                                <NavLink
                                    to={item.path}
                                    onClick={() => setIsOpen(false)} // FERME LE MENU APRÈS CLIC SUR MOBILE
                                    className={({ isActive }) =>
                                        `d-flex align-items-center px-3 py-3 rounded-3 text-decoration-none transition-all ${isActive ? 'bg-info text-white' : 'text-secondary bg-transparent'
                                        }`
                                    }
                                    style={({ isActive }) => ({
                                        backgroundColor: isActive ? '#00a5a8' : 'transparent',
                                        color: isActive ? '#ffffff' : '#a0aec0'
                                    })}
                                >
                                    <div className="flex-shrink-0">{item.icon}</div>
                                    {(!isCollapsed || window.innerWidth < 992) && (
                                        <span className="ms-3 fw-medium">{item.label}</span>
                                    )}
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