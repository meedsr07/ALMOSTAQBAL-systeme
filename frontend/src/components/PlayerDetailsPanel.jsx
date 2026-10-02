"use client";

import { useEffect, useState } from "react";
import PlayerAvatar from "./PlayerAvatar";
import { deletePlayer } from "@/lib/api";
import { formatDate, formatValue } from "@/lib/format";
import PlayerPaymentHistory from "./PlayerPaymentHistory";

// Sliding side panel with all the data of one player.
// Slides in from the left, which is the mirrored side in a RTL layout.
export default function PlayerDetailsPanel({ player, onClose, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      await deletePlayer(player.player_id);
      onDeleted?.(player);
      onClose();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

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
    <div className="modal-backdrop"><button aria-label="إغلاق التفاصيل" onClick={onClose} className="sidebar-overlay" />
      <aside className="drawer"><div className="drawer-header">
          <PlayerAvatar player={player} className="avatar-lg" />
          <div><h2>
              {player.first_name} {player.last_name}
            </h2>
            <p className="muted">تفاصيل اللاعب</p><div className="card-tags">
              {player.position && (
                <span className="tag brand">
                  {player.position}
                </span>
              )}
              {player.category && (
                <span className="tag">
                  {player.category}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="close-button drawer-close"
          >
            ✕
          </button>
        </div>

        <dl className="details-list">
          {rows.map((row) => (
            <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <PlayerPaymentHistory key={player.player_id} playerID={player.player_id} />

        <div className="drawer-actions">
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {confirming ? (
            <>
              <p className="muted">
                سيتم حذف اللاعب وصورته نهائياً. هل أنت متأكد؟
              </p>
              <div className="button-group">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="button button-danger"
                >
                  {deleting ? "جاري الحذف..." : "نعم، احذف"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="button button-secondary"
                >
                  تراجع
                </button>
              </div>
            </>
          ) : (
            <div className="button-group">
              <button
                onClick={() => setConfirming(true)}
                className="button button-danger"
              >
                حذف اللاعب
              </button>
              <button
                onClick={onClose}
                className="button button-secondary"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
