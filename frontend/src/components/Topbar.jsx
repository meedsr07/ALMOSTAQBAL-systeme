"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const titles = {
  "/": "لوحة التحكم",
  "/players": "اللاعبون",
  "/players/create": "إضافة لاعب جديد",
};

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const title = titles[pathname] || "AL MOSTAQBAL";

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-line bg-white px-4 sm:px-6 lg:px-8">
      {/* logo: first child, so it sits on the far right in RTL */}
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0b0b0b] ring-1 ring-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="شعار AL MOSTAQBAL"
            className="h-full w-full object-cover"
          />
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-extrabold tracking-wide text-ink">
            AL MOSTAQBAL
          </span>
          <span className="block text-xs text-muted">نظام إدارة اللاعبين</span>
        </span>
      </Link>

      <button
        onClick={onMenuClick}
        aria-label="فتح القائمة"
        className="rounded-lg border border-line p-2 text-body lg:hidden"
      >
        <span className="block h-0.5 w-5 bg-current" />
        <span className="mt-1 block h-0.5 w-5 bg-current" />
        <span className="mt-1 block h-0.5 w-5 bg-current" />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-bold text-ink sm:text-xl">{title}</h1>
      </div>

      <Link
        href="/players/create"
        className="rounded-xl bg-crimson px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-crimson/90"
      >
        + لاعب جديد
      </Link>
    </header>
  );
}
