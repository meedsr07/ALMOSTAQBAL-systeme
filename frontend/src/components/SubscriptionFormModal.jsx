"use client";

import { useState } from "react";
import { createSubscription, updateSubscription } from "@/lib/api";
import { formatMonth } from "@/lib/format";

const fieldClass = "field";

const months = Array.from({ length: 12 }, (_, index) => index + 1);

export default function SubscriptionFormModal({ players, initialSubscription, onClose, onSaved }) {
  const isEditing = Boolean(initialSubscription);
  const now = new Date();
  const [form, setForm] = useState({
    player_id: initialSubscription?.player_id || "",
    month: initialSubscription?.month || now.getMonth() + 1,
    year: initialSubscription?.year || now.getFullYear(),
    amount: initialSubscription?.amount ?? 200,
    status: initialSubscription?.status || "UNPAID",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = {
        ...form,
        player_id: Number(form.player_id),
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount),
      };
      const subscription = isEditing
        ? await updateSubscription(initialSubscription.id, { amount: data.amount, status: data.status })
        : await createSubscription(data);
      onSaved(subscription, isEditing ? "تم تحديث الاشتراك بنجاح" : "تمت إضافة الاشتراك بنجاح");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop"><button aria-label="إغلاق" onClick={onClose} className="sidebar-overlay" />
      <form onSubmit={submit} className="modal"><div className="modal-header">
          <h2>{isEditing ? "تعديل اشتراك" : "إضافة اشتراك"}</h2><button type="button" onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-body form-grid"><label className="field-label form-span">
            اللاعب
            <select name="player_id" value={form.player_id} onChange={change} disabled={isEditing} required className={fieldClass}>
              <option value="">اختر لاعباً</option>
              {players.map((player) => <option key={player.player_id} value={player.player_id}>{player.first_name} {player.last_name}</option>)}
            </select>
          </label>
          <label className="field-label">
            الشهر
            <select name="month" value={form.month} onChange={change} disabled={isEditing} className={fieldClass}>
              {months.map((month) => <option key={month} value={month}>{formatMonth(month)}</option>)}
            </select>
          </label>
          <label className="field-label">
            السنة
            <input name="year" type="number" min="2000" max="2100" value={form.year} onChange={change} disabled={isEditing} required className={fieldClass} />
          </label>
          <label className="field-label">
            المبلغ (DH)
            <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={change} required className={fieldClass} />
          </label>
          <label className="field-label">
            الحالة
            <select name="status" value={form.status} onChange={change} className={fieldClass}>
              <option value="UNPAID">غير مدفوع</option>
              <option value="PAID">مدفوع</option>
            </select>
          </label>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button disabled={saving} className="button button-primary">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
          <button type="button" onClick={onClose} disabled={saving} className="button button-secondary">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
