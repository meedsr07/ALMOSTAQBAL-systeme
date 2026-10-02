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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line p-6">
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
            مرحبا بك في نظام{" "}
            <span className="text-crimson">AL MOSTAQBAL</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-body">
            أضف لاعبيك، تابع بياناتهم، واسترجعهم في أي وقت من مكان واحد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-6 pt-0">
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-crimson px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-crimson/25 transition hover:bg-crimson/90"
          >
            + إضافة لاعب
          </button>

          <Link
            href="/players"
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-body transition hover:border-white/20 hover:text-ink"
          >
            عرض كل اللاعبين
          </Link>
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-line bg-surface p-5">
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
                  className="flex w-full cursor-pointer items-center gap-3 py-3 text-right transition hover:bg-white/[0.03]"
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
