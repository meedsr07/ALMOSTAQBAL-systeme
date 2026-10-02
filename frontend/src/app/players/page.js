"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayers } from "@/lib/api";
import PlayerCard from "@/components/PlayerCard";
import PlayerTable from "@/components/PlayerTable";
import PlayerFormModal from "@/components/PlayerFormModal";
import PlayerDetailsPanel from "@/components/PlayerDetailsPanel";

const fieldClass = "field";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // the player whose details panel is open
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // the player being edited in the modal, null when the modal is closed
  const [editingPlayer, setEditingPlayer] = useState(null);

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

  // Called by the form modal for both a creation and an edit.
  function handlePlayerSaved(player, isEditing) {
    setPlayers((old) =>
      isEditing
        ? old.map((item) =>
            item.player_id === player.player_id ? player : item,
          )
        : [...old, player],
    );

    // keep the open details panel showing the new values
    if (isEditing) setSelectedPlayer(player);
  }

  return (
    <div className="dashboard-page"><div className="page-header"><p className="muted">
          عرض <strong>{filteredPlayers.length}</strong> من{" "}
          {players.length} لاعب
        </p>

        <div className="button-group">
          <button
            onClick={() => setView("cards")}
            className={`button button-toggle ${view === "cards" ? "active" : ""}`}
          >
            بطاقات
          </button>
          <button
            onClick={() => setView("table")}
            className={`button button-toggle ${view === "table" ? "active" : ""}`}
          >
            جدول
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="button button-primary"
          >
            + إضافة لاعب
          </button>
        </div>
      </div>

      {/* filters */}
      <section className="panel filters">
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
            className="button button-secondary"
          >
            مسح الفلاتر
          </button>
        )}
      </section>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {loading ? (
        <p className="loading-state">جاري تحميل اللاعبين...</p>
      ) : players.length === 0 ? (
        <div className="panel empty-state"><p>لا يوجد لاعبون بعد.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="button button-primary"
          >
            + إضافة أول لاعب
          </button>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <p className="panel empty-state">
          لا يوجد لاعبون مطابقون للفلاتر.
        </p>
      ) : view === "cards" ? (
        <div className="player-grid">
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
          onEdit={(player) => setEditingPlayer(player)}
        />
      )}

      {editingPlayer && (
        <PlayerFormModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSaved={handlePlayerSaved}
        />
      )}

      {modalOpen && (
        <PlayerFormModal
          onClose={() => setModalOpen(false)}
          onSaved={handlePlayerSaved}
        />
      )}
    </div>
  );
}
