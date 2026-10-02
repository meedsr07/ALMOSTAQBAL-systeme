// Small display helpers shared by the player components.

// Shows the date as 21 مايو 2010 (Arabic month, Latin digits)
export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ar-EG-u-nu-latn", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Shows an empty value as a dash instead of nothing
export function formatValue(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

// Turns a date coming from the API (2012-05-14T00:00:00Z) into the
// YYYY-MM-DD value an <input type="date"> expects
export function formatDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("ar-EG-u-nu-latn")} DH`;
}

export function formatMonth(month) {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { month: "long" }).format(
    new Date(2026, Number(month) - 1, 1),
  );
}
