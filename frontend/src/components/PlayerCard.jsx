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
      className="panel player-card"
    >
      <div className="row-player">
        <PlayerAvatar player={player} />

        <div><h3 className="player-name">
            {player.first_name} {player.last_name}
          </h3>
          <p className="muted">
            {formatDate(player.date_of_birth)}
          </p>

          <div className="card-tags">
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
            {player.preferred_foot && (
                <span className="tag">
                القدم: {player.preferred_foot}
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="card-details">
        <div className="detail-box"><dt>الطول</dt><dd>
            {player.height_cm ? `${player.height_cm} سم` : "—"}
          </dd>
        </div>
        <div className="detail-box"><dt>الوزن</dt><dd>
            {player.weight_kg ? `${player.weight_kg} كجم` : "—"}
          </dd>
        </div>
        <div className="detail-box"><dt>الفريق السابق</dt><dd>
            {formatValue(player.previous_team)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
