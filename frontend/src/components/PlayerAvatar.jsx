"use client";

import { useState } from "react";
import { playerImageUrl } from "@/lib/api";

// Shows the player photo, and the first letters of his name if there is no photo
export default function PlayerAvatar({ player, className = "h-16 w-16" }) {
  const [broken, setBroken] = useState(false);
  const imageUrl = playerImageUrl(player.profile_image);
  const initials = `${player.first_name?.[0] || ""}${player.last_name?.[0] || ""}`;

  if (!imageUrl || broken) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center rounded-2xl bg-crimson/10 text-lg font-extrabold text-crimson uppercase ring-1 ring-crimson/20`}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`صورة ${player.first_name} ${player.last_name}`}
      onError={() => setBroken(true)}
      className={`${className} shrink-0 rounded-2xl bg-panel object-cover ring-1 ring-line`}
    />
  );
}
