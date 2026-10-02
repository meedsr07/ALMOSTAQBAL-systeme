// The address of the Go backend.
// It is used for the image files, and as the target of the /api rewrite
// defined in next.config.mjs.
// Change it in .env.local if the backend runs somewhere else:
// NEXT_PUBLIC_API_URL=http://localhost:8080
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// GET /api/players -> returns the list of players
export async function getPlayers() {
  const response = await fetch("/api/players", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("تعذر تحميل اللاعبين، تأكد من تشغيل الخادم");
  }

  return response.json();
}

// POST /api/players -> FormData is sent as it is, so the browser adds the
// multipart/form-data header with the boundary itself.
// Do NOT set the Content-Type header here.
export async function createPlayer(formData) {
  const response = await fetch("/api/players", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "تعذر إنشاء اللاعب");
  }

  return data;
}

// GET /api/players/{playerID} -> returns one player
export async function getPlayer(playerID) {
  const response = await fetch(`/api/players/${playerID}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("تعذر تحميل بيانات اللاعب");
  }

  return response.json();
}

// PUT /api/players/{playerID} -> updates the sent fields of one player.
// data is JSON, only the keys it holds are saved.
export async function updatePlayer(playerID, data) {
  const response = await fetch(`/api/players/${playerID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "تعذر تحديث بيانات اللاعب");
  }

  return result;
}

// DELETE /api/players/{playerID} -> deletes one player and its image
export async function deletePlayer(playerID) {
  const response = await fetch(`/api/players/${playerID}`, { method: "DELETE" });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "تعذر حذف اللاعب");
  }

  return data;
}

async function subscriptionRequest(path, options = {}, fallbackMessage) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export function getSubscriptions(filters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : "";
  return subscriptionRequest(`/subscriptions${suffix}`, {}, "تعذر تحميل الاشتراكات");
}

export function getSubscription(subscriptionID) {
  return subscriptionRequest(`/subscriptions/${subscriptionID}`, {}, "تعذر تحميل الاشتراك");
}

export function createSubscription(data) {
  return subscriptionRequest(
    "/subscriptions",
    { method: "POST", body: JSON.stringify(data) },
    "تعذر إنشاء الاشتراك",
  );
}

export function updateSubscription(subscriptionID, data) {
  return subscriptionRequest(
    `/subscriptions/${subscriptionID}`,
    { method: "PUT", body: JSON.stringify(data) },
    "تعذر تحديث الاشتراك",
  );
}

export function deleteSubscription(subscriptionID) {
  return subscriptionRequest(
    `/subscriptions/${subscriptionID}`,
    { method: "DELETE" },
    "تعذر حذف الاشتراك",
  );
}

export function getSubscriptionStats(month, year) {
  return subscriptionRequest(
    `/subscriptions/stats?month=${month}&year=${year}`,
    {},
    "تعذر تحميل الإحصائيات",
  );
}

export function getPlayerSubscriptions(playerID) {
  return subscriptionRequest(
    `/players/${playerID}/subscriptions`,
    {},
    "تعذر تحميل سجل الدفعات",
  );
}

// Turns the stored path (/uploads/players/xxx.jpg) into a full image url
export function playerImageUrl(profileImage) {
  if (!profileImage) return "";
  if (profileImage.startsWith("http")) return profileImage;
  return `${API_URL}${profileImage}`;
}
