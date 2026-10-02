import PlayerAvatar from "./PlayerAvatar";
import { formatDate, formatValue } from "@/lib/format";

export default function PlayerTable({ players, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[900px] text-right text-sm">
        <thead className="border-b border-line bg-page text-xs text-body">
          <tr>
            <th className="px-4 py-3 font-semibold">اللاعب</th>
            <th className="px-4 py-3 font-semibold">المركز</th>
            <th className="px-4 py-3 font-semibold">الفئة</th>
            <th className="px-4 py-3 font-semibold">الطول</th>
            <th className="px-4 py-3 font-semibold">الوزن</th>
            <th className="px-4 py-3 font-semibold">القدم المفضلة</th>
            <th className="px-4 py-3 font-semibold">الفريق السابق</th>
            <th className="px-4 py-3 font-semibold">تاريخ الميلاد</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-line">
          {players.map((player) => (
            <tr
              key={player.player_id}
              onClick={() => onSelect?.(player)}
              className="cursor-pointer transition hover:bg-page"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <PlayerAvatar player={player} className="h-10 w-10 text-sm" />
                  <span className="font-bold text-ink">
                    {player.first_name} {player.last_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-crimson">
                {formatValue(player.position)}
              </td>
              <td className="px-4 py-3 text-body">{formatValue(player.category)}</td>
              <td className="px-4 py-3 text-body">
                {player.height_cm ? `${player.height_cm} سم` : "—"}
              </td>
              <td className="px-4 py-3 text-body">
                {player.weight_kg ? `${player.weight_kg} كجم` : "—"}
              </td>
              <td className="px-4 py-3 text-body">{formatValue(player.preferred_foot)}</td>
              <td className="px-4 py-3 text-body">{formatValue(player.previous_team)}</td>
              <td className="px-4 py-3 text-muted">{formatDate(player.date_of_birth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
