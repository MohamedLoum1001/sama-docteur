import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Nabar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar fixe en haut */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Cette div enveloppe le contenu pour garder la largeur constante */}
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
