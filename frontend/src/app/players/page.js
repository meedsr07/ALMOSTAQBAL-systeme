"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayers } from "@/lib/api";
import PlayerCard from "@/components/PlayerCard";
import PlayerTable from "@/components/PlayerTable";
import PlayerFormModal from "@/components/PlayerFormModal";
import PlayerDetailsPanel from "@/components/PlayerDetailsPanel";

const fieldClass =
  "w-full rounded-xl border border-field bg-panel px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-crimson";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // the player whose details panel is open
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("");
  const [foot, setFoot] = useState("");

  const [view, setView] = useState("cards");

  useEffect(() => {
    getPlayers()
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // the filter options come from the players we already loaded (no new endpoint)
  const positions = [...new Set(players.map((p) => p.position))].filter(Boolean).sort();
  const categories = [...new Set(players.map((p) => p.category))].filter(Boolean).sort();
  const feet = [...new Set(players.map((p) => p.preferred_foot))].filter(Boolean).sort();

  // every filter must match at the same time
  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();

    if (search && !fullName.includes(search.trim().toLowerCase())) return false;
    if (position && player.position !== position) return false;
    if (category && player.category !== category) return false;
    if (foot && player.preferred_foot !== foot) return false;

    return true;
  });

  const hasFilters = search || position || category || foot;

  function clearFilters() {
    setSearch("");
    setPosition("");
    setCategory("");
    setFoot("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-body">
          عرض <span className="font-bold text-ink">{filteredPlayers.length}</span> من{" "}
          {players.length} لاعب
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("cards")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              view === "cards"
                ? "bg-crimson/10 text-crimson ring-1 ring-crimson/30"
                : "text-body hover:text-ink"
            }`}
          >
            بطاقات
          </button>
          <button
            onClick={() => setView("table")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              view === "table"
                ? "bg-crimson/10 text-crimson ring-1 ring-crimson/30"
                : "text-body hover:text-ink"
            }`}
          >
            جدول
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-crimson px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-crimson/90"
          >
            + إضافة لاعب
          </button>
        </div>
      </div>

      {/* filters */}
      <section className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث بالاسم الأول أو الأخير"
          className={fieldClass}
        />

        <select
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          className={fieldClass}
        >
          <option value="">كل المراكز</option>
          {positions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={fieldClass}
        >
          <option value="">كل الفئات</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={foot}
          onChange={(event) => setFoot(event.target.value)}
          className={fieldClass}
        >
          <option value="">كل الأقدام</option>
          {feet.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-body transition hover:border-crimson/50 hover:text-crimson sm:col-span-2 lg:col-span-4"
          >
            مسح الفلاتر
          </button>
        )}
      </section>

      {error && (
        <p className="rounded-xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm font-medium text-crimson">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-muted">جاري تحميل اللاعبين...</p>
      ) : players.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface py-16 text-center">
          <p className="text-sm text-body">لا يوجد لاعبون بعد.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-block rounded-xl bg-crimson px-5 py-2.5 text-sm font-bold text-white"
          >
            + إضافة أول لاعب
          </button>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-16 text-center text-sm text-muted">
          لا يوجد لاعبون مطابقون للفلاتر.
        </p>
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      ) : (
        <PlayerTable players={filteredPlayers} onSelect={setSelectedPlayer} />
      )}

      {selectedPlayer && (
        <PlayerDetailsPanel
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onDeleted={(player) =>
            setPlayers((old) => old.filter((item) => item.player_id !== player.player_id))
          }
        />
      )}

      {modalOpen && (
        <PlayerFormModal
          onClose={() => setModalOpen(false)}
          onCreated={(player) => setPlayers((old) => [...old, player])}
        />
      )}
    </div>
  );
}
