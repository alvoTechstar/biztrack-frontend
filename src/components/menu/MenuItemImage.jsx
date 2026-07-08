import React, { useState } from "react";

// Emoji placeholder used when a menu item has no image (or the URL is broken)
const CATEGORY_EMOJI = {
  breakfast: "🍳",
  mains: "🍛",
  sides: "🍟",
  beverages: "🥤",
  drinks: "🥤",
  desserts: "🍰",
  snacks: "🥪",
};

/**
 * Menu item image with graceful fallback.
 * Fills its parent container — control size/shape via the wrapper.
 */
export default function MenuItemImage({ src, name, category, emojiSize = "text-2xl", className = "" }) {
  const [failed, setFailed] = useState(false);
  const emoji = CATEGORY_EMOJI[(category || "").trim().toLowerCase()] || "🍽️";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name || "Menu item"}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 ${className}`}
    >
      <span className={`${emojiSize} select-none`} role="img" aria-label={name || "Menu item"}>
        {emoji}
      </span>
    </div>
  );
}
