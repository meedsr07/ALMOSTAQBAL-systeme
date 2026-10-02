"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "لوحة التحكم" },
  { href: "/players", label: "اللاعبون" },
  { href: "/players/create", label: "إضافة لاعب" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-full w-64 border-l border-line bg-surface transition-transform lg:translate-x-0 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-20 items-center gap-3 border-b border-line px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson text-lg font-extrabold text-white shadow-lg shadow-crimson/30">
          A
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-wide text-ink">AL MOSTAQBAL</p>
          <p className="text-xs text-muted">نظام إدارة اللاعبين</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-crimson/15 text-crimson ring-1 ring-crimson/40"
                  : "text-body hover:bg-white/5 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
        <p className="text-xs text-muted">الإصدار 1.0</p>
      </div>
    </aside>
  );
}
