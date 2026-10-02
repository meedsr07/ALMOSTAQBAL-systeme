"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "لوحة التحكم" },
  { href: "/players", label: "اللاعبون" },
  { href: "/subscriptions", label: "الاشتراكات" },
  { href: "/players/create", label: "إضافة لاعب" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <aside
      className={`sidebar ${open ? "open" : ""}`}
    >
      <div className="sidebar-brand">
        <Image src="/logo.jpg" alt="شعار النادي" width={40} height={40} className="brand-logo" />
        <div>
          <p className="brand-title">AL MOSTAQBAL</p><p className="brand-subtitle">نظام إدارة اللاعبين</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`nav-link ${active ? "active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer"><p>الإصدار 1.0</p>
      </div>
    </aside>
  );
}
