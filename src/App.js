// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
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

        {/* Pages avec navbar */}
        <Route element={<Layout />}>
        {/* Routes Patients */}
          <Route path="/home-patient" element={<HomePatient />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/rendez-vous" element={<RendezVous />} />
          <Route path="/paiement-ticket" element={<PaiementTicket />} />
          <Route path="/ticket-acheter" element={<TicketAcheter />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ordonnances" element={<Ordonnances />} />
          <Route path="/dossier-medical" element={<DossierMedical />} />
          <Route path="/avis" element={<Avis />} />


          {/* tu peux ajouter d'autres pages ici */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
