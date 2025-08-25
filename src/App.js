// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Register from "./auth/register/Register";
import Login from "./auth/login/Login";
import ResetPassword from "./auth/resetPassword/ResetPassword";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Redirection de la racine vers /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </div>
  );
}

export default App;
