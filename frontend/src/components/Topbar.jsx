"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const titles = {
  "/": "لوحة التحكم",
  "/players": "اللاعبون",
  "/players/create": "إضافة لاعب جديد",
  "/subscriptions": "الاشتراكات",
};

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const title = titles[pathname] || "AL MOSTAQBAL";

  return (
    <header className="topbar">
      {/* logo: first child, so it sits on the far right in RTL */}
      <Link href="/" className="topbar-brand">
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="شعار AL MOSTAQBAL"
            className="brand-logo"
          />
        </span>
        <span><span className="brand-title">
            AL MOSTAQBAL
          </span>
          <span className="brand-subtitle">نظام إدارة اللاعبين</span>
        </span>
      </Link>

      <button
        onClick={onMenuClick}
        aria-label="فتح القائمة"
        className="menu-button"
      >
        ☰
      </button>

      <div className="topbar-title"><h1>{title}</h1>
      </div>

      <Link
        href="/players/create"
        className="button button-primary"
      >
        + لاعب جديد
      </Link>
    </header>
  );
}
