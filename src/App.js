import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./App.css";

import Register from "./auth/register/Register";
import Login from "./auth/login/Login";
import ResetPassword from "./auth/resetPassword/ResetPassword";

// Patients
import HomePatient from "./patients/home/HomePatient";
import Profil from "./components/profil/Profil";
import RendezVous from "./patients/rendezVous/RendezVous";
import PaiementTicket from "./patients/paiementTicket/PaiementTicket";
import TicketAcheter from "./patients/ticketAcheter/TicketAcheter";
import Notifications from "./components/Notifications/Notifications";
import Ordonnances from "./patients/ordonnance/Ordonnances";
import DossierMedical from "./patients/dossierMedical/DossierMedical";
import RecommandationsPatient from "./patients/recommandation/RecommandationsPatient";
import Avis from "./patients/avis/Avis";

// Médecins
import HomeMedecin from "./medecins/home/HomeMedecine";
import ListeRendezVous from "./medecins/rendezVous/ListRendzVous";
import ProfilMedecin from "./medecins/profil/ProfilMedecin";
import Prescription from "./medecins/prescription/Prescription";
import Recommandation from "./medecins/recommendation/Recommendation";
import DossiersMedicaux from "./medecins/dossiersMedicaux/DossiersMedicaux";
import Disponibilites from "./medecins/disponibilites/Disponibilites";

// Pages patient par ID
import OrdonnancesPatient from "./patients/OrdonnancesPatient/OrdonnancesPatient";
import ExamensPatient from "./patients/ExamensPatient/ExamensPatient";
import ConsultationsPatient from "./patients/ConsultationsPatient/ConsultationsPatient";
import RecommandationsPatientById from "./patients/RecommandationsPatientById/RecommandationsPatientById";
// Layout
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Redirection racine */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pages sans navbar */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Pages avec navbar protégées */}
        <Route element={<Layout />}>
          {/* Patient */}
          <Route path="/home-patient" element={<ProtectedRoute><HomePatient /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="/rendez-vous" element={<ProtectedRoute><RendezVous /></ProtectedRoute>} />
          <Route path="/paiement-ticket" element={<ProtectedRoute><PaiementTicket /></ProtectedRoute>} />
          <Route path="/ticket-acheter" element={<ProtectedRoute><TicketAcheter /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/ordonnances" element={<ProtectedRoute><Ordonnances /></ProtectedRoute>} />
          <Route path="/dossier-medical" element={<ProtectedRoute><DossierMedical /></ProtectedRoute>} />
          <Route path="/recommandation-patient" element={<ProtectedRoute><RecommandationsPatient /></ProtectedRoute>} />
          <Route path="/avis" element={<ProtectedRoute><Avis /></ProtectedRoute>} />

          {/* Médecin */}
          <Route path="/home-medecin" element={<ProtectedRoute><HomeMedecin /></ProtectedRoute>} />
          <Route path="/liste-rendez-vous" element={<ProtectedRoute><ListeRendezVous /></ProtectedRoute>} />
          <Route path="/profil-medecin" element={<ProtectedRoute><ProfilMedecin /></ProtectedRoute>} />
          <Route path="/disponibilites" element={<ProtectedRoute><Disponibilites /></ProtectedRoute>} />
          <Route path="/prescription" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
          <Route path="/dossiers-medicaux" element={<ProtectedRoute><DossiersMedicaux /></ProtectedRoute>} />
          <Route path="/recommandation" element={<ProtectedRoute><Recommandation /></ProtectedRoute>} />

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
        </Route>
      </Routes>
    </div>
  );
}

export default App;
