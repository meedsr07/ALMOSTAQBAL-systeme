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

// DELETE /api/players/{playerID} -> deletes one player and its image
export async function deletePlayer(playerID) {
  const response = await fetch(`/api/players/${playerID}`, { method: "DELETE" });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "تعذر حذف اللاعب");
  }

  return data;
}

// Turns the stored path (/uploads/players/xxx.jpg) into a full image url
export function playerImageUrl(profileImage) {
  if (!profileImage) return "";
  if (profileImage.startsWith("http")) return profileImage;
  return `${API_URL}${profileImage}`;
}
