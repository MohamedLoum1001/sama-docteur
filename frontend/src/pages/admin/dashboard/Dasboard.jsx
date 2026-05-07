import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Users, Activity,
  Stethoscope, Heart, Scissors,
  ArrowUpRight, BarChart3, Pill
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalMedecins: 0,
    totalPatients: 0
  });

  const [dynamicSpecialties, setDynamicSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSpecStyles = (name) => {
    const n = name.toLowerCase();
    if (n.includes("dent") || n.includes("odonto")) return { icon: <Scissors size={20} />, color: "text-red-500", bg: "bg-red-50" };
    if (n.includes("cardio")) return { icon: <Heart size={20} />, color: "text-rose-500", bg: "bg-rose-50" };
    if (n.includes("dermato")) return { icon: <Activity size={20} />, color: "text-emerald-500", bg: "bg-emerald-50" };
    if (n.includes("pharma")) return { icon: <Pill size={20} />, color: "text-blue-500", bg: "bg-blue-50" };
    return { icon: <Stethoscope size={20} />, color: "text-[#00a5a8]", bg: "bg-[#00a5a8]/10" };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const allUsers = querySnapshot.docs.map(doc => doc.data());

        const medecins = allUsers.filter(u => u.role === "medecin");
        setCounts({
          totalUsers: allUsers.length,
          totalMedecins: medecins.length,
          totalPatients: allUsers.filter(u => u.role === "patient").length
        });

        const specMap = {};
        medecins.forEach(m => {
          const s = m.specialite || "Généraliste";
          specMap[s] = (specMap[s] || 0) + 1;
        });

        const specList = Object.keys(specMap).map(name => ({
          title: name,
          value: specMap[name],
          ...getSpecStyles(name)
        }));

        setDynamicSpecialties(specList);
      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickStats = [
    { title: "Utilisateurs", value: counts.totalUsers, icon: <Users size={20} />, color: "bg-blue-500" },
    { title: "Médecins", value: counts.totalMedecins, icon: <Stethoscope size={20} />, color: "bg-[#00a5a8]" },
    { title: "Patients", value: counts.totalPatients, icon: <Activity size={20} />, color: "bg-indigo-500" },
  ];

  const managementActions = [
    { title: "Gestion des comptes", description: "Gérez les accès patients et médecins.", icon: <Users size={32} />, iconColor: "text-primary", link: "/users", btnLabel: "Accéder", btnClass: "btn-primary", btnIcon: <ArrowUpRight size={16} /> },
    { title: "Rapports & Analytics", description: "Consultez les graphiques financiers.", icon: <BarChart3 size={32} />, iconColor: "text-indigo-500", link: "/rapports", btnLabel: "Voir les rapports", btnClass: "btn-light border", btnIcon: null }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 bg-[#F8FAFC] min-h-screen">
        {/* Header Responsive */}
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">📊 Tableau de bord Admin</h1>
          <p className="text-gray-500 text-xs md:text-sm">Données synchronisées avec SamaDocteur</p>
        </div>

        {/* Row 1: Quick Stats - 1 col mobile, 3 cols desktop */}
        <div className="row g-3 g-md-4">
          {quickStats.map((stat, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow-md transition h-100">
                <div className="d-flex align-items-center gap-3">
                  <div className={`${stat.color} text-white p-3 rounded-3 shadow-sm`}>{stat.icon}</div>
                  <div>
                    <p className="text-muted small mb-0 font-semibold uppercase tracking-wider">{stat.title}</p>
                    <h3 className="mb-0 fw-bold fs-4">{loading ? "..." : stat.value}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Specialties Breakdown - Grid adaptative */}
        <h5 className="mt-5 mb-4 fw-bold text-gray-700">Spécialistes par domaine</h5>
        <div className="row g-3 g-md-4">
          {loading ? (
            <div className="col-12 text-center py-4 text-muted">Analyse des spécialités...</div>
          ) : dynamicSpecialties.length > 0 ? (
            dynamicSpecialties.map((spec, idx) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={idx}>
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className={`${spec.bg} ${spec.color} p-2 rounded-2`}>{spec.icon}</div>
                    <span className="badge rounded-pill bg-light text-dark border small">Actifs</span>
                  </div>
                  <div className="mt-3">
                    <h4 className="fw-bold mb-1">{spec.value}</h4>
                    <p className="text-muted small mb-0">{spec.title}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-muted italic">Aucune spécialité détectée.</div>
          )}
        </div>

        {/* Row 3: Management Actions */}
        <h5 className="mt-5 mb-4 fw-bold text-gray-700">Actions de Gestion</h5>
        <div className="row g-3 g-md-4">
          {managementActions.map((action, idx) => (
            <div className="col-12 col-md-6" key={idx}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 p-md-4">
                  <div className={`mb-3 ${action.iconColor}`}>{action.icon}</div>
                  <h5 className="fw-bold fs-5">{action.title}</h5>
                  <p className="text-muted small">{action.description}</p>
                  <Link to={action.link} className={`btn rounded-pill px-4 w-100 w-md-auto d-inline-flex align-items-center justify-content-center gap-2 ${action.btnClass}`}>
                    {action.btnLabel} {action.btnIcon}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;