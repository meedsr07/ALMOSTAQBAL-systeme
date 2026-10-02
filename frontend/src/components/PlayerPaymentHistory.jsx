"use client";
import { useEffect, useState } from "react";
import { getPlayerSubscriptions } from "@/lib/api";
import { formatMonth, formatMoney } from "@/lib/format";
export default function PlayerPaymentHistory({ playerID }) {
  const [subscriptions, setSubscriptions] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { getPlayerSubscriptions(playerID).then(setSubscriptions).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, [playerID]);
  return <section className="payment-history"><h3>سجل الدفعات</h3>{loading ? <p className="muted">جاري تحميل السجل...</p> : error ? <p className="error-message">{error}</p> : subscriptions.length === 0 ? <p className="muted">لا توجد دفعات مسجلة.</p> : <ul className="payment-list">{subscriptions.map((item) => <li key={item.id}><span>{formatMonth(item.month)} {item.year}</span><span>{formatMoney(item.amount)}</span><span className={`status ${item.status === "PAID" ? "paid" : "unpaid"}`}>{item.status === "PAID" ? "مدفوع" : "غير مدفوع"}</span></li>)}</ul>}</section>;
}
