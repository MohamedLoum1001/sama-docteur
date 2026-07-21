// src/components/Layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const Layout = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex flex-column bg-white p-0">
      {/* Navbar fixe en haut */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-grow-1 py-4 px-3 mx-auto w-100" style={{ maxWidth: '1140px' }}>
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
