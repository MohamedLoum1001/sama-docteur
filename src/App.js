import { useEffect } from "react"; // ✅ Ajout de useEffect
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./App.css";

// ✅ Import du script d'injection (assure-toi que le fichier est au bon endroit)
import { injectNationalData } from "./utils/seedData";

import Register from "./auth/register/Register";
import Login from "./auth/login/Login";
import ResetPassword from "./auth/resetPassword/ResetPassword";
import ForgetPassword from "./auth/forgetPassword/ForgetPassword";

// Patients
import HomePatient from "./pages/patients/home/HomePatient";
import Profil from "./components/profil/Profil";
import RendezVous from "./pages/patients/rendezVous/RendezVous";
import PaiementTicket from "./pages/patients/paiementTicket/PaiementTicket";
import TicketAcheter from "./pages/patients/ticketAcheter/TicketAcheter";
import Notifications from "./components/Notifications/Notifications";
import Ordonnances from "./pages/patients/ordonnance/Ordonnances";
import DossierMedical from "./pages/patients/dossierMedical/DossierMedical";
import RecommandationsPatient from "./pages/patients/recommandation/RecommandationsPatient";
import Avis from "./pages/patients/avis/Avis";
import Pharmacie from "./pages/patients/Pharmacie/Pharmacie";

// Pages patient par ID
import OrdonnancesPatient from "./pages/patients/OrdonnancesPatient/OrdonnancesPatient";
import ExamensPatient from "./pages/patients/ExamensPatient/ExamensPatient";
import ConsultationsPatient from "./pages/patients/ConsultationsPatient/ConsultationsPatient";
import RecommandationsPatientById from "./pages/patients/RecommandationsPatientById/RecommandationsPatientById";

// Médecins
import HomeMedecin from "./pages/medecins/home/HomeMedecine";
import ListeRendezVous from "./pages/medecins/rendezVous/ListRendzVous";
import ProfilMedecin from "./pages/medecins/profil/Profil";
import Prescription from "./pages/medecins/prescription/Prescription";
import Recommandation from "./pages/medecins/recommendation/Recommendation";
import DossiersMedicaux from "./pages/medecins/dossiersMedicaux/DossiersMedicaux";
import Disponibilites from "./pages/medecins/disponibilites/Disponibilites";

// Layout
import Layout from "./components/Layout/Layout";

// Admin
import Dashboard from "./pages/admin/dashboard/Dasboard";
import DoctorProfile from "./pages/medecins/doctorProfile/DoctorProfile";
import Messages from "./components/messages/Messages";

// Vidéo
import VideoCall from "./pages/VideoCall/VideoCall";

function App() {

  // ✅ LOGIQUE D'INJECTION NATIONALE
  useEffect(() => {
    // On décommente la ligne pour lancer le script
    injectNationalData();
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* Redirection racine */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pages sans navbar */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forget-password" element={<ForgetPassword />} />

        {/* ROUTE APPEL VIDÉO */}
        <Route
          path="/video-call/:callId"
          element={<ProtectedRoute><VideoCall /></ProtectedRoute>}
        />

        {/* Pages avec navbar protégées */}
        <Route element={<Layout />}>
          {/* Patient */}
          <Route path="/patient" element={<ProtectedRoute><HomePatient /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="/rendez-vous" element={<ProtectedRoute><RendezVous /></ProtectedRoute>} />

          {/* Pharmacie */}
          <Route path="/pharmacie" element={<ProtectedRoute><Pharmacie /></ProtectedRoute>} />

          <Route path="/paiement-ticket" element={<ProtectedRoute><PaiementTicket /></ProtectedRoute>} />
          <Route path="/ticket-acheter" element={<ProtectedRoute><TicketAcheter /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/ordonnances" element={<ProtectedRoute><Ordonnances /></ProtectedRoute>} />
          <Route path="/dossier-medical" element={<ProtectedRoute><DossierMedical /></ProtectedRoute>} />
          <Route path="/recommandation-patient" element={<ProtectedRoute><RecommandationsPatient /></ProtectedRoute>} />
          <Route path="/avis" element={<ProtectedRoute><Avis /></ProtectedRoute>} />

          {/* Médecin */}
          <Route path="/medecin" element={<ProtectedRoute><HomeMedecin /></ProtectedRoute>} />
          <Route path="/liste-rendez-vous" element={<ProtectedRoute><ListeRendezVous /></ProtectedRoute>} />
          <Route path="/profil-medecin" element={<ProtectedRoute><ProfilMedecin /></ProtectedRoute>} />
          <Route path="/disponibilites" element={<ProtectedRoute><Disponibilites /></ProtectedRoute>} />
          <Route path="/prescription" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
          <Route path="/dossiers-medicaux" element={<ProtectedRoute><DossiersMedicaux /></ProtectedRoute>} />
          <Route path="/recommandation" element={<ProtectedRoute><Recommandation /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Messagerie */}
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

          {/* Pages patient par ID */}
          <Route
            path="/ordonnances-patient/:patientId"
            element={<ProtectedRoute><OrdonnancesPatient /></ProtectedRoute>}
          />
          <Route
            path="/examens-patient/:patientId"
            element={<ProtectedRoute><ExamensPatient /></ProtectedRoute>}
          />
          <Route
            path="/consultations-patient/:patientId"
            element={<ProtectedRoute><ConsultationsPatient /></ProtectedRoute>}
          />
          <Route
            path="/recommandations-patient/:patientId"
            element={<ProtectedRoute><RecommandationsPatientById /></ProtectedRoute>}
          />
          <Route path="/doctor-profile/:id" element={<DoctorProfile />} />
          <Route path="/rendez-vous/:id" element={<RendezVous />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;