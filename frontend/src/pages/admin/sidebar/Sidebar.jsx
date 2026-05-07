import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    CreditCard, MessageSquare, CalendarCheck, Bell,
    ChevronLeft, Menu, X
} from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    // Gérer le redimensionnement pour le style responsive
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/users', label: 'Utilisateurs', icon: <Users size={20} /> },
        { path: '/paiements', label: 'Paiements', icon: <CreditCard size={20} /> },
        { path: '/avis-admin', label: 'Avis', icon: <MessageSquare size={20} /> },
        { path: '/rapports', label: 'Rapports', icon: <CalendarCheck size={20} /> },
        { path: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    ];

    const sidebarStyle = {
        position: isMobile ? 'fixed' : 'relative',
        left: 0,
        top: isMobile ? 0 : '80px',
        height: isMobile ? '100vh' : 'calc(100vh - 80px)',
        backgroundColor: '#111319', // Un noir plus profond et moderne
        zIndex: isMobile ? 1050 : 900,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Animation plus fluide
        transform: (isMobile && !isOpen) ? 'translateX(-100%)' : 'translateX(0)',
        width: isCollapsed ? '85px' : '280px',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <>
            {/* BOUTON HAMBURGER MOBILE FLOTTANT */}
            {isMobile && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn shadow-lg d-lg-none"
                    style={{
                        position: 'fixed', top: '18px', left: '18px', zIndex: 1100,
                        backgroundColor: '#00a5a8', color: 'white', borderRadius: '12px',
                        padding: '10px', border: 'none', display: 'flex', alignItems: 'center'
                    }}
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            )}

            {/* OVERLAY AVEC EFFET FLOU */}
            {isOpen && isMobile && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1040
                    }}
                />
            )}

            {/* SIDEBAR */}
            <div style={sidebarStyle}>
                {/* HEADER SIDEBAR (Desktop) */}
                <div className="d-none d-lg-flex align-items-center justify-content-between px-4" style={{ height: '70px' }}>
                    {!isCollapsed && (
                        <span style={{
                            fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.5px',
                            background: 'linear-gradient(45deg, #00a5a8, #4fd1d3)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            SAMA ADMIN
                        </span>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="btn border-0 p-1"
                        style={{ color: '#00a5a8', backgroundColor: 'rgba(0, 165, 168, 0.1)', borderRadius: '8px' }}
                    >
                        <ChevronLeft size={18} style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                    </button>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-grow-1 px-3 mt-4 mt-lg-2 overflow-auto">
                    <ul className="list-unstyled">
                        {menuItems.map((item) => (
                            <li key={item.path} className="mb-2">
                                <NavLink
                                    to={item.path}
                                    onClick={() => isMobile && setIsOpen(false)}
                                    className={({ isActive }) => `
                                        d-flex align-items-center px-3 py-3 rounded-3 text-decoration-none transition-all
                                        ${isActive ? 'active-link' : 'inactive-link'}
                                    `}
                                    style={({ isActive }) => ({
                                        backgroundColor: isActive ? 'rgba(0, 165, 168, 0.15)' : 'transparent',
                                        color: isActive ? '#00a5a8' : '#94a3b8',
                                        borderLeft: isActive ? '4px solid #00a5a8' : '4px solid transparent',
                                        transition: '0.2s all ease'
                                    })}
                                >
                                    <div style={{ minWidth: '24px' }}>{item.icon}</div>
                                    {(!isCollapsed || isMobile) && (
                                        <span className="ms-3" style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                                            {item.label}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* FOOTER SIDEBAR (Profil ou Déconnexion rapide) */}
                {!isCollapsed && (
                    <div className="p-3 m-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-secondary" style={{ width: '32px', height: '32px' }}></div>
                            <div className="ms-2 overflow-hidden">
                                <p className="mb-0 text-white small text-truncate" style={{ fontWeight: '600' }}>Admin Sama</p>
                                <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>En ligne</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS ADDITIONNEL (À mettre dans ton fichier .css ou via style tag) */}
            <style>
                {`
                    .inactive-link:hover {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        color: #ffffff !important;
                        transform: translateX(5px);
                    }
                    .active-link {
                        box-shadow: inset 0 0 10px rgba(0, 165, 168, 0.05);
                    }
                    nav::-webkit-scrollbar {
                        width: 4px;
                    }
                    nav::-webkit-scrollbar-thumb {
                        background: rgba(0, 165, 168, 0.2);
                        border-radius: 10px;
                    }
                `}
            </style>
        </>
    );
};

export default Sidebar;