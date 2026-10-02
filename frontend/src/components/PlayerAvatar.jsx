"use client";

import { useState } from "react";
import { playerImageUrl } from "@/lib/api";

// Shows the player photo, and the first letters of his name if there is no photo
export default function PlayerAvatar({ player, className = "" }) {
  const [broken, setBroken] = useState(false);
  const imageUrl = playerImageUrl(player.profile_image);
  const initials = `${player.first_name?.[0] || ""}${player.last_name?.[0] || ""}`;

  if (!imageUrl || broken) {
    return (
      <div
        className={`avatar avatar-fallback ${className}`}
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
      className={`avatar ${className}`}
    />
  );
}
