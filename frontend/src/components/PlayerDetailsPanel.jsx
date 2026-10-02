"use client";

import { useEffect } from "react";
import PlayerAvatar from "./PlayerAvatar";
import { formatDate, formatValue } from "@/lib/format";

// Sliding side panel with all the data of one player.
// Slides in from the left, which is the mirrored side in a RTL layout.
export default function PlayerDetailsPanel({ player, onClose }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!player) return null;

  const rows = [
    { label: "رقم اللاعب", value: player.player_id },
    { label: "الاسم الأول", value: formatValue(player.first_name) },
    { label: "اسم العائلة", value: formatValue(player.last_name) },
    { label: "تاريخ الميلاد", value: formatDate(player.date_of_birth) },
    { label: "المركز", value: formatValue(player.position) },
    { label: "الفئة", value: formatValue(player.category) },
    {
      label: "الطول",
      value: player.height_cm ? `${player.height_cm} سم` : "—",
    },
    {
      label: "الوزن",
      value: player.weight_kg ? `${player.weight_kg} كجم` : "—",
    },
    { label: "القدم المفضلة", value: formatValue(player.preferred_foot) },
    { label: "الفريق السابق", value: formatValue(player.previous_team) },
    { label: "الصورة", value: formatValue(player.profile_image) },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="إغلاق التفاصيل"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#212529]/45"
      />

      <aside className="absolute top-0 bottom-0 left-0 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl shadow-[#212529]/20">
        <div className="flex items-start gap-4 border-b border-line p-5">
          <PlayerAvatar player={player} className="h-20 w-20 text-xl" />

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-ink">
              {player.first_name} {player.last_name}
            </h2>
            <p className="mt-1 text-xs text-muted">تفاصيل اللاعب</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {player.position && (
                <span className="rounded-lg bg-crimson/10 px-2 py-0.5 text-xs font-semibold text-crimson">
                  {player.position}
                </span>
              )}
              {player.category && (
                <span className="rounded-lg bg-panel px-2 py-0.5 text-xs font-semibold text-body">
                  {player.category}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-bold text-body transition hover:bg-page hover:text-ink"
          >
            ✕
          </button>
        </div>

        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="text-sm font-bold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto border-t border-line p-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#343a40] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#212529]"
          >
            إغلاق
          </button>
        </div>
      </aside>
    </div>
  );
}
