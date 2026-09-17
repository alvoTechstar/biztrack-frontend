import React, { useState } from "react";
import { Coffee, Soup, Sandwich, CupSoda, CakeSlice, UtensilsCrossed } from "lucide-react";

// Icon placeholder used when a menu item has no image (or the URL is broken)
const CATEGORY_ICON = {
  breakfast: Coffee,
  mains: Soup,
  sides: Sandwich,
  beverages: CupSoda,
  drinks: CupSoda,
  desserts: CakeSlice,
  snacks: Sandwich,
};

// emojiSize keeps its historical Tailwind-text-size prop shape for callers,
// mapped here to the pixel size lucide icons expect.
const SIZE_MAP = {
  "text-base": 20,
  "text-lg": 22,
  "text-xl": 24,
  "text-2xl": 28,
  "text-3xl": 34,
  "text-4xl": 40,
};

/**
 * Menu item image with graceful fallback.
 * Fills its parent container — control size/shape via the wrapper.
 */
export default function MenuItemImage({ src, name, category, emojiSize = "text-2xl", className = "" }) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_ICON[(category || "").trim().toLowerCase()] || UtensilsCrossed;
  const iconSize = SIZE_MAP[emojiSize] || 28;

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
      <Icon size={iconSize} className="text-orange-400" aria-label={name || "Menu item"} />
    </div>
  );
}
