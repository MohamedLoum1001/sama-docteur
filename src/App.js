// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Register from "./auth/register/Register";
import Login from "./auth/login/Login";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Redirection de la racine vers /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
