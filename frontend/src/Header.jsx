// src/Header.jsx
import React from "react";

export default function Header({ title = "PPD Agent", subtitle }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo">💛</div>
        <div>
          <div className="title">PPD Support</div>
          <div className="subtitle">{subtitle}</div>
        </div>
      </div>
      <div className="header-actions">
        <a href="#" onClick={e=>e.preventDefault()} className="link">Help</a>
      </div>
    </header>
  );
}
