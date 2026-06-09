import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { db } from "../../../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Search, Archive, Ban, Trash2, RotateCcw, UserPlus, X } from 'lucide-react';
import Button from "../../../components/boutons/Button";

const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://4.233.208.186:8000";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newUser, setNewUser] = useState({
        prenom: "", nom: "", email: "", telephone: "",
        adresse: "", dateNaissance: "", role: "medecin", specialite: ""
    });

    const logAdminAction = async (userName, action) => {
        try {
            const admin = JSON.parse(localStorage.getItem("user"));
            await fetch(`${API_URL}/api/auth/admin-log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminName: admin ? `${admin.prenom} ${admin.nom}` : "Admin Inconnu",
                    userName: userName,
                    action: action
                }),
            });
        } catch (error) { console.error("Erreur log terminal:", error); }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) { console.error("Erreur récupération:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            if (response.ok) {
                alert("Compte créé Mail envoyé.");
                setShowAddForm(false);
                setNewUser({ prenom: "", nom: "", email: "", telephone: "", adresse: "", dateNaissance: "", role: "medecin", specialite: "" });
                fetchUsers();
            }
        } catch (error) { alert("Erreur de connexion Azure."); }
        finally { setSubmitting(false); }
    };

    const handleUpdateStatus = async (user, newStatus) => {
        try {
            await updateDoc(doc(db, "users", user.id), { status: newStatus });
            await logAdminAction(`${user.prenom} ${user.nom}`, newStatus);
            fetchUsers();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) {
            try {
                await deleteDoc(doc(db, "users", user.id));
                await logAdminAction(`${user.prenom} ${user.nom}`, "deleted");
                fetchUsers();
            } catch (error) { console.error(error); }
        }
    };

    const filteredUsers = users.filter(u =>
        `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-3 md:p-6">
                <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">Gestion des Utilisateurs</h1>
                </div>

                {/* Barre de recherche et Bouton Ajout */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00a5a8] outline-none shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full md:w-auto">
                        <Button
                            type="button"
                            label="Ajouter un membre"
                            variant="register"
                            onClick={() => setShowAddForm(true)}
                            icon={<UserPlus size={18} />}
                            className="w-full md:w-auto"
                        />
                    </div>
                </div>

                {/* MODAL FORMULAIRE RESPONSIVE */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="bg-[#1a1c23] p-4 text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold">Nouveau Membre</h2>
                                <button onClick={() => setShowAddForm(false)} className="hover:text-red-400 transition-colors"><X /></button>
                            </div>
                            <form onSubmit={handleAddUser} className="p-4 md:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                                <p className="text-[10px] md:text-xs text-gray-500 italic">* Mot de passe envoyé par mail.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input type="text" placeholder="Prénom" className="w-full border p-2 rounded-lg outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })} />
                                    <input type="text" placeholder="Nom" className="w-full border p-2 rounded-lg outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-gray-400 ml-1 uppercase font-bold">Naissance</label>
                                        <input type="date" className="w-full border p-2 rounded-lg outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, dateNaissance: e.target.value })} />
                                    </div>
                                    <input type="text" placeholder="Téléphone" className="w-full border p-2 rounded-lg mt-auto outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })} />
                                </div>

                                <input type="text" placeholder="Adresse complète" className="w-full border p-2 rounded-lg outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, adresse: e.target.value })} />
                                <input type="email" placeholder="Email professionnel" className="w-full border p-2 rounded-lg outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

                                <select className="w-full border p-2 rounded-lg outline-none bg-gray-50" onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="medecin">Docteur</option>
                                    <option value="admin">Administrateur</option>
                                </select>

                                {newUser.role === "medecin" && (
                                    <input type="text" placeholder="Spécialité" className="w-full border p-2 rounded-lg outline-none focus:border-[#00a5a8]" required onChange={(e) => setNewUser({ ...newUser, specialite: e.target.value })} />
                                )}

                                <Button type="submit" label="Créer le compte" variant="login" fullWidth loading={submitting} />
                            </form>
                        </div>
                    </div>
                )}

                {/* TABLEAU RESPONSIVE */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-600">Utilisateur</th>
                                    <th className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                                    <th className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-600 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-10 text-gray-400 italic">Chargement...</td></tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#00a5a8]/10 items-center justify-center text-[#00a5a8] font-bold text-sm">
                                                    {u.prenom?.[0]}{u.nom?.[0]}
                                                </div>
                                                <div className="max-w-[150px] sm:max-w-none">
                                                    <p className="text-sm font-bold text-gray-800 m-0 truncate">{u.prenom} {u.nom}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold m-0 truncate">{u.role} {u.specialite && `| ${u.specialite}`}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <span className={`px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase ${u.status === 'blocked' ? 'bg-red-100 text-red-600' : u.status === 'archived' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                {u.status || 'actif'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex justify-center gap-1 md:gap-2">
                                                {(u.status === 'blocked' || u.status === 'archived') && (
                                                    <button onClick={() => handleUpdateStatus(u, 'actif')} className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center gap-1">
                                                        <RotateCcw size={14} />
                                                        <span className="hidden lg:inline text-[9px] font-bold">Rétablir</span>
                                                    </button>
                                                )}
                                                {u.status !== 'archived' && <button onClick={() => handleUpdateStatus(u, 'archived')} className="p-1.5 md:p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white shadow-sm transition-all"><Archive size={14} /></button>}
                                                {u.status !== 'blocked' && <button onClick={() => handleUpdateStatus(u, 'blocked')} className="p-1.5 md:p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-sm transition-all"><Ban size={14} /></button>}
                                                <button onClick={() => handleDelete(u)} className="p-1.5 md:p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-black hover:text-white shadow-sm transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Users;