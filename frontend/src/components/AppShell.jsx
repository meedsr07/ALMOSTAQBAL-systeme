"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// The frame around every page: sidebar on the right (RTL), topbar on top.
export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="app-content">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <main className="main-content">{children}</main>
      </div>

      {menuOpen && (
        <button
          aria-label="إغلاق القائمة"
          onClick={() => setMenuOpen(false)}
          className="sidebar-overlay"
        />
      )}
    </div>
  );
}
