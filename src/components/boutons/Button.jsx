// src/components/Button.js
import React from "react";

export default function Button({ children, type = "button", onClick, color }) {
  // color = background color
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ backgroundColor: color }}
      className="text-white font-bold py-2 px-4 rounded-md w-full hover:opacity-90 transition-opacity"
    >
      {children}
    </button>
  );
}
