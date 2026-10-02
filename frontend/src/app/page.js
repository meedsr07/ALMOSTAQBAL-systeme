"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayers } from "@/lib/api";
import PlayerAvatar from "@/components/PlayerAvatar";
import PlayerFormModal from "@/components/PlayerFormModal";
import PlayerDetailsPanel from "@/components/PlayerDetailsPanel";
import { formatDate } from "@/lib/format";

export default function DashboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // the player whose details panel is open
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    getPlayers()
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const recentPlayers = [...players].reverse().slice(0, 6);
  const playersWithHeight = players.filter((player) => Number(player.height_cm) > 0);
  const playersWithWeight = players.filter((player) => Number(player.weight_kg) > 0);
  const averageHeight = playersWithHeight.length
    ? Math.round(playersWithHeight.reduce((sum, player) => sum + Number(player.height_cm), 0) / playersWithHeight.length)
    : 0;
  const averageWeight = playersWithWeight.length
    ? (playersWithWeight.reduce((sum, player) => sum + Number(player.weight_kg), 0) / playersWithWeight.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-page"><section className="panel hero"><div>
          <h2>
            مرحبا بك في نظام{" "}
            <span className="brand-text">AL MOSTAQBAL</span>
          </h2>
          <p>
            أضف لاعبيك، تابع بياناتهم، واسترجعهم في أي وقت من مكان واحد.
          </p>
        </div>

        <div className="actions">
          <button
            onClick={() => setModalOpen(true)}
            className="button button-primary"
          >
            + إضافة لاعب
          </button>

          <Link
            href="/players"
            className="button button-secondary"
          >
            عرض كل اللاعبين
          </Link>
        </div>
      </section>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <section className="stats-grid">
        <article className="stat-card"><p className="stat-label">إجمالي اللاعبين</p><p className="stat-value accent">{players.length}</p></article>
        <article className="stat-card"><p className="stat-label">متوسط الطول</p><p className="stat-value">{averageHeight} سم</p></article>
        <article className="stat-card"><p className="stat-label">متوسط الوزن</p><p className="stat-value">{averageWeight} كجم</p></article>
      </section>

      <section className="panel"><div className="section-header"><h3>أحدث اللاعبين</h3><Link href="/players" className="button-link">
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <p className="loading-state">جاري التحميل...</p>
        ) : recentPlayers.length === 0 ? (
          <p className="empty-state">
            لا يوجد لاعبون بعد. ابدأ بإضافة أول لاعب.
          </p>
        ) : (
          <ul className="payment-list">
            {recentPlayers.map((player) => (
              <li key={player.player_id}>
                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="row-player"
                >
                  <PlayerAvatar player={player} /><div><p className="player-name">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="muted">
                      {player.position || "بدون مركز"} •{" "}
                      {player.category || "بدون فئة"}
                    </p>
                  </div>
                  <span className="muted">
                    {formatDate(player.date_of_birth)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

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
