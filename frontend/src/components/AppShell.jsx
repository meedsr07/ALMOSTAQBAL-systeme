"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// The frame around every page: sidebar on the right (RTL), topbar on top.
export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pr-64">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {menuOpen && (
        <button
          aria-label="إغلاق القائمة"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
        />
      )}
    </div>
  );
}
