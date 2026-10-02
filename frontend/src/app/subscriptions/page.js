"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteSubscription,
  getPlayers,
  getSubscriptionStats,
  getSubscriptions,
  updateSubscription,
} from "@/lib/api";
import { formatDate, formatMoney, formatMonth } from "@/lib/format";
import SubscriptionFormModal from "@/components/SubscriptionFormModal";

const fieldClass = "field";
const months = Array.from({ length: 12 }, (_, index) => index + 1);

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card"><p className="stat-label">{label}</p>
      <p className={`stat-value ${accent ? "accent" : ""}`}>{value}</p>
    </div>
  );
}

export default function SubscriptionsPage() {
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: String(currentDate.getMonth() + 1),
    year: String(currentDate.getFullYear()),
    status: "",
    player_id: "",
  });
  const [players, setPlayers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [workingID, setWorkingID] = useState(null);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSubscriptions(await getSubscriptions(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await getSubscriptionStats(filters.month, filters.year));
    } catch (err) {
      setError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [filters.month, filters.year]);

  useEffect(() => {
    getPlayers().then(setPlayers).catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    let active = true;
    getSubscriptions(filters)
      .then((data) => { if (active) setSubscriptions(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters]);
  useEffect(() => {
    let active = true;
    getSubscriptionStats(filters.month, filters.year)
      .then((data) => { if (active) setStats(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setStatsLoading(false); });
    return () => { active = false; };
  }, [filters.month, filters.year]);

  const playersByID = useMemo(
    () => new Map(players.map((player) => [player.player_id, player])),
    [players],
  );
  const selectablePlayers = useMemo(() => {
    const search = playerSearch.trim().toLowerCase();
    if (!search) return players;
    return players.filter((player) => `${player.first_name} ${player.last_name}`.toLowerCase().includes(search));
  }, [players, playerSearch]);

  function changeFilter(event) {
    setLoading(true);
    if (event.target.name === "month" || event.target.name === "year") setStatsLoading(true);
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }
  async function refreshAfterChange(message) {
    await Promise.all([loadSubscriptions(), loadStats()]);
    showNotice(message);
  }
  async function toggleStatus(subscription) {
    setWorkingID(subscription.id);
    setError("");
    try {
      const status = subscription.status === "PAID" ? "UNPAID" : "PAID";
      await updateSubscription(subscription.id, { status });
      await refreshAfterChange(status === "PAID" ? "تم تسجيل الدفعة بنجاح" : "تم تحويل الاشتراك إلى غير مدفوع");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingID(null);
    }
  }
  async function remove(subscription) {
    if (!window.confirm("هل تريد حذف هذا الاشتراك؟")) return;
    setWorkingID(subscription.id);
    setError("");
    try {
      await deleteSubscription(subscription.id);
      await refreshAfterChange("تم حذف الاشتراك بنجاح");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingID(null);
    }
  }

  return (
    <div className="dashboard-page"><div className="page-header">
        <div>
          <h1 className="page-title">إدارة الاشتراكات</h1><p className="page-description">تابع دفعات اللاعبين الشهرية وسجلها.</p>
        </div>
        <button onClick={() => setModal({})} className="button button-primary">+ إضافة اشتراك</button>
      </div>

      <section className="stats-grid">
        <StatCard label="إجمالي اللاعبين" value={statsLoading ? "…" : stats?.total_players ?? 0} />
        <StatCard label="المدفوعون" value={statsLoading ? "…" : stats?.paid ?? 0} />
        <StatCard label="غير المدفوعين" value={statsLoading ? "…" : stats?.unpaid ?? 0} accent />
        <StatCard label="المبلغ المحصل" value={statsLoading ? "…" : formatMoney(stats?.total_collected)} />
        <StatCard label="المبلغ المتوقع" value={statsLoading ? "…" : formatMoney(stats?.total_expected)} />
      </section>

      <section className="panel filters">
        <select name="month" value={filters.month} onChange={changeFilter} className={fieldClass}>
          {months.map((month) => <option key={month} value={month}>{formatMonth(month)}</option>)}
        </select>
        <input name="year" type="number" min="2000" max="2100" value={filters.year} onChange={changeFilter} className={fieldClass} aria-label="السنة" />
        <select name="status" value={filters.status} onChange={changeFilter} className={fieldClass}>
          <option value="">كل الحالات</option><option value="PAID">مدفوع</option><option value="UNPAID">غير مدفوع</option>
        </select>
        <input value={playerSearch} onChange={(event) => setPlayerSearch(event.target.value)} placeholder="ابحث عن لاعب..." className={fieldClass} />
        <select name="player_id" value={filters.player_id} onChange={changeFilter} className={fieldClass}>
          <option value="">كل اللاعبين</option>
          {selectablePlayers.map((player) => <option key={player.player_id} value={player.player_id}>{player.first_name} {player.last_name}</option>)}
        </select>
      </section>

      {notice && <p role="status" className="notice">{notice}</p>}{error && <p className="error-message">{error}</p>}

      <section className="table-panel">
        {loading ? <p className="loading-state">جاري تحميل الاشتراكات...</p> : subscriptions.length === 0 ? <p className="empty-state">لا توجد اشتراكات مطابقة للفلاتر.</p> : (<table className="data-table"><thead><tr>
                {['اللاعب', 'الفئة', 'الشهر', 'السنة', 'المبلغ', 'الحالة', 'تاريخ الدفع', 'الإجراءات'].map((heading) => <th key={heading}>{heading}</th>)}
              </tr></thead>
              <tbody>
                {subscriptions.map((subscription) => {
                  const player = playersByID.get(subscription.player_id);
                  const paid = subscription.status === "PAID";
                  return <tr key={subscription.id}><td className="player-name">{player ? `${player.first_name} ${player.last_name}` : `#${subscription.player_id}`}</td><td>{player?.category || "—"}</td><td>{formatMonth(subscription.month)}</td><td>{subscription.year}</td><td>{formatMoney(subscription.amount)}</td>
                    <td><span className={`status ${paid ? "paid" : "unpaid"}`}>{paid ? "مدفوع" : "غير مدفوع"}</span></td><td>{formatDate(subscription.paid_at)}</td><td><div className="button-group">
                      <button onClick={() => setModal(subscription)} className="button-link">تعديل</button><button disabled={workingID === subscription.id} onClick={() => toggleStatus(subscription)} className="button-link">{workingID === subscription.id ? "..." : paid ? "غير مدفوع" : "تسجيل الدفع"}</button><button disabled={workingID === subscription.id} onClick={() => remove(subscription)} className="button-link">حذف</button>
                    </div></td>
                  </tr>;
                })}
              </tbody>
            </table>
        )}
      </section>

      {modal && <SubscriptionFormModal players={players} initialSubscription={modal.id ? modal : null} onClose={() => setModal(null)} onSaved={(_, message) => refreshAfterChange(message)} />}
    </div>
  );
}
