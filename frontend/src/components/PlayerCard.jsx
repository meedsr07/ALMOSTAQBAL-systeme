import PlayerAvatar from "./PlayerAvatar";
import { formatDate, formatValue } from "@/lib/format";

export default function PlayerCard({ player, onClick }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="cursor-pointer rounded-2xl border border-line bg-white p-4 transition hover:border-crimson/40 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <PlayerAvatar player={player} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink">
            {player.first_name} {player.last_name}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {formatDate(player.date_of_birth)}
          </p>

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
            {player.preferred_foot && (
              <span className="rounded-lg bg-panel px-2 py-0.5 text-xs font-semibold text-body">
                القدم: {player.preferred_foot}
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-page px-3 py-2">
          <dt className="text-muted">الطول</dt>
          <dd className="font-bold text-ink">
            {player.height_cm ? `${player.height_cm} سم` : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-page px-3 py-2">
          <dt className="text-muted">الوزن</dt>
          <dd className="font-bold text-ink">
            {player.weight_kg ? `${player.weight_kg} كجم` : "—"}
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-page px-3 py-2">
          <dt className="text-muted">الفريق السابق</dt>
          <dd className="truncate font-bold text-ink">
            {formatValue(player.previous_team)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
