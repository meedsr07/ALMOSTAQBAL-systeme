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
