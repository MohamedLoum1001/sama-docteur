// src/components/Layout.jsx
import React from "react";
// import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Nabar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-20">
        {" "}
        {/* padding top pour navbar fixe */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
