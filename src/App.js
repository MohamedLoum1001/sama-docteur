// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./App.css";
import Register from "./auth/register/Register";
import Login from "./auth/login/Login";
import ResetPassword from "./auth/resetPassword/ResetPassword";
import HomePatient from "./patients/home/HomePatient";
import Profil from "./components/profil/Profil";
import Layout from "./components/Layout/Layout";
import RendezVous from "./patients/rendezVous/RendezVous";
// import Ticket from "./patients/ticketAcheter/TicketAcheter";
import PaiementTicket from "./patients/paiementTicket/PaiementTicket";
import TicketAcheter from "./patients/ticketAcheter/TicketAcheter";
import Notifications from "./components/Notifications/Notifications";
import Ordonnances from "./patients/ordonnance/Ordonnances";
import DossierMedical from "./patients/dossierMedical/DossierMedical";
import Avis from "./patients/avis/Avis";
import HomeMedecin from "./medecins/home/HomeMedecine";
import ListeRendezVous from "./medecins/rendezVous/ListRendzVous";
import ProfilMedecin from "./medecins/profil/ProfilMedecin";
import Prescription from "./medecins/prescription/Prescription";
import Recommandation from "./medecins/recommendation/Recommendation";
import DossiersMedicaux from "./medecins/dossiersMedicaux/DossiersMedicaux";
import Disponibilites from "./medecins/disponibilites/Disponibilites";
// import Disponibilites from "./medecins/disponibilites/Disponibilites";
// import Layout from "./components/Layout";

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
          <Route
            path="/home-patient"
            element={
              <ProtectedRoute>
                <HomePatient />
              </ProtectedRoute>
            }
          />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="/rendez-vous" element={<ProtectedRoute><RendezVous /></ProtectedRoute>} />
          <Route path="/paiement-ticket" element={<ProtectedRoute><PaiementTicket /></ProtectedRoute>} />
          <Route path="/ticket-acheter" element={<ProtectedRoute><TicketAcheter /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/ordonnances" element={<ProtectedRoute><Ordonnances /></ProtectedRoute>} />
          <Route path="/dossier-medical" element={<ProtectedRoute><DossierMedical /></ProtectedRoute>} />
          <Route path="/avis" element={<ProtectedRoute><Avis /></ProtectedRoute>} />
          {/* Routes pour l'interface médecin */}
          <Route path="/home-medecin" element={<ProtectedRoute><HomeMedecin /></ProtectedRoute>} />
          <Route path="/liste-rendez-vous" element={<ProtectedRoute><ListeRendezVous /></ProtectedRoute>} />
          <Route path="/profil-medecin" element={<ProtectedRoute><ProfilMedecin /></ProtectedRoute>} />
          <Route path="/disponibilites" element={<ProtectedRoute><Disponibilites /></ProtectedRoute>} />
          <Route path="/prescription" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
          <Route path="/dossiers-medicaux" element={<ProtectedRoute><DossiersMedicaux /></ProtectedRoute>} />
          <Route path="/recommandation" element={<ProtectedRoute><Recommandation /></ProtectedRoute>} />

          {/* tu peux ajouter d'autres pages ici */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
