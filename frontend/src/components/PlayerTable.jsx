import PlayerAvatar from "./PlayerAvatar";
import { formatDate, formatValue } from "@/lib/format";

export default function PlayerTable({ players, onSelect }) {
  return (
    <div className="table-panel"><table className="data-table"><thead>
          <tr>
            <th>اللاعب</th><th>المركز</th><th>الفئة</th><th>الطول</th><th>الوزن</th><th>القدم المفضلة</th><th>الفريق السابق</th><th>رقم الهاتف</th><th>تاريخ الميلاد</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player) => (
            <tr
              key={player.player_id}
              onClick={() => onSelect?.(player)}
              className="clickable-row"
            >
              <td><div className="row-player"><PlayerAvatar player={player} className="avatar-sm" /><span className="player-name">
                    {player.first_name} {player.last_name}
                  </span>
                </div>
              </td>
              <td>
                {formatValue(player.position)}
              </td>
              <td>{formatValue(player.category)}</td><td>
                {player.height_cm ? `${player.height_cm} سم` : "—"}
              </td>
              <td>
                {player.weight_kg ? `${player.weight_kg} كجم` : "—"}
              </td>
              <td>{formatValue(player.preferred_foot)}</td><td>{formatValue(player.previous_team)}</td><td dir="ltr">
                {formatValue(player.phone)}
              </td><td>{formatDate(player.date_of_birth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
