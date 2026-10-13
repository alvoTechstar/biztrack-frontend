import { GET, POST, PUT, DELETE } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";

// Live against the ingredients API — no mock, no local cache.

// Anything at or below this quantity reads as "Low Stock" (unit-agnostic).
export const LOW_STOCK_THRESHOLD = 5;

export const calcTotal = (quantity, costPerUnit) =>
  Number(quantity || 0) * Number(costPerUnit || 0);

export const toLocal = (raw) => {
  const quantity = Number(raw.quantity) || 0;
  const costPerUnit = Number(raw.costPerUnit ?? raw.cost) || 0;
  return {
    id: raw.id || raw._id,
    name: raw.name || "",
    category: raw.category || "Other",
    quantity,
    unit: raw.unit || "kg",
    costPerUnit,
    totalCost: calcTotal(quantity, costPerUnit),
  };
};

export async function listIngredients(businessId) {
  const res = await GET(
    URLS.INGREDIENTS.GET_BY_BUSINESS.replace(":businessId", businessId)
  );
  if (!res?.success) throw new Error(res?.message || "Failed to load ingredients");
  return (res.items || res.data || []).map(toLocal);
}

const CATEGORIES_CACHE_KEY = "biztrack-ingredient-categories";

// Backend-owned category list (it 400s unknown values) — cached so the
// form still works if this call fails mid-session.
export async function listCategories() {
  try {
    const res = await GET(URLS.INGREDIENTS.CATEGORIES);
    const items = res?.items || res?.data || [];
    if (res?.success && items.length > 0) {
      try {
        localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(items));
      } catch {
        // Non-blocking
      }
      return items;
    }
    throw new Error(res?.message || "Failed to load categories");
  } catch (err) {
    try {
      const cached = JSON.parse(localStorage.getItem(CATEGORIES_CACHE_KEY) || "[]");
      if (cached.length > 0) return cached;
    } catch {
      // Non-blocking
    }
    throw err;
  }
}

// Backend rejects unknown fields — send only the model shape.
const toPayload = (ingredient, businessId) => ({
  businessId,
  name: String(ingredient.name || "").trim(),
  category: String(ingredient.category || "Other").trim() || "Other",
  quantity: Number(ingredient.quantity) || 0,
  unit: ingredient.unit || "kg",
  costPerUnit: Number(ingredient.costPerUnit) || 0,
});

export async function saveIngredient(businessId, ingredient) {
  if (!ingredient.id) {
    const res = await POST(URLS.INGREDIENTS.CREATE, toPayload(ingredient, businessId));
    if (!res?.success) throw new Error(res?.message || "Failed to save ingredient");
    return toLocal(res.item || res.data || {});
  }
  const res = await PUT(
    URLS.INGREDIENTS.UPDATE.replace(":id", ingredient.id),
    toPayload(ingredient, businessId)
  );
  if (!res?.success) throw new Error(res?.message || "Failed to save ingredient");
  return toLocal(res.item || res.data || {});
}

export async function removeIngredient(businessId, id) {
  const res = await DELETE(URLS.INGREDIENTS.DELETE.replace(":id", id));
  if (!res?.success) throw new Error(res?.message || "Failed to delete ingredient");
  return true;
}

// Subtract dispensed quantities from stock (floors at zero — a sale is
// never blocked by stock). Used when the cashier completes an order.
export async function deductStock(businessId, lines) {
  const totals = new Map();
  (lines || []).forEach(({ ingredientId, quantity }) => {
    const id = String(ingredientId || "");
    if (!id) return;
    totals.set(id, (totals.get(id) || 0) + Number(quantity || 0));
  });
  if (totals.size === 0) return [];

  const items = await listIngredients(businessId);
  const changed = [];
  items.forEach((it) => {
    const d = totals.get(String(it.id));
    if (!d) return;
    const quantity = Math.max(0, Number(it.quantity) - d);
    changed.push({ ...it, quantity, totalCost: calcTotal(quantity, it.costPerUnit) });
  });
  // Partial update — backend accepts quantity alone.
  await Promise.all(
    changed.map((it) =>
      PUT(URLS.INGREDIENTS.UPDATE.replace(":id", it.id), { quantity: it.quantity })
    )
  );
  return changed;
}
