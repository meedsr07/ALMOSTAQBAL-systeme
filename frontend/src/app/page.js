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

  // every value below comes from the backend data, nothing is hardcoded
  const playersWithHeight = players.filter((player) => player.height_cm > 0);
  const playersWithWeight = players.filter((player) => player.weight_kg > 0);

  const totalPlayersCount = players.length;

  const centersCount = [...new Set(players.map((player) => player.position))].filter(
    Boolean,
  ).length;

  const avgHeight = playersWithHeight.length
    ? Math.round(
        playersWithHeight.reduce((total, player) => total + player.height_cm, 0) /
          playersWithHeight.length,
      )
    : 0;

  const avgWeight = playersWithWeight.length
    ? (
        playersWithWeight.reduce((total, player) => total + player.weight_kg, 0) /
        playersWithWeight.length
      ).toFixed(1)
    : 0;

  // the four statistic cards
  const stats = [
    { label: "إجمالي اللاعبين", value: totalPlayersCount },
    { label: "المراكز", value: centersCount },
    { label: "متوسط الطول (سم)", value: avgHeight },
    { label: "متوسط الوزن (كجم)", value: avgWeight },
  ];

  const recentPlayers = [...players].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-gradient-to-l from-crimson/10 via-white to-white p-6">
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
          مرحبا بك في نظام{" "}
          <span className="text-crimson">AL MOSTAQBAL</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-body">
          أضف لاعبيك، تابع بياناتهم، واسترجعهم في أي وقت من مكان واحد.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="mt-5 rounded-xl bg-crimson px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-crimson/90"
        >
          + إضافة لاعب
        </button>
      </section>

      {error && (
        <p className="rounded-xl border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm font-medium text-crimson">
          {error}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm font-medium text-body">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-crimson">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">أحدث اللاعبين</h3>
          <Link href="/players" className="text-xs font-semibold text-crimson hover:underline">
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted">جاري التحميل...</p>
        ) : recentPlayers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            لا يوجد لاعبون بعد. ابدأ بإضافة أول لاعب.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recentPlayers.map((player) => (
              <li key={player.player_id}>
                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="flex w-full cursor-pointer items-center gap-3 py-3 text-right transition hover:bg-page"
                >
                  <PlayerAvatar player={player} className="h-11 w-11 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-muted">
                      {player.position || "بدون مركز"} •{" "}
                      {player.category || "بدون فئة"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
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
