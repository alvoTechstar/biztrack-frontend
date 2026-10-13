import { deductStock } from "../ingredient-management/ingredientService";

const STORAGE_KEY = (businessId) => `biztrack-recipes-${businessId || "default"}`;

export const keyOf = (name) => String(name || "").trim().toLowerCase();

// Recipes are keyed by menu-item name (known before a first save, and the
// same key order lines match on). Value:
// { menuItemId, menuItemName, lines: [{ ingredientId, quantity }] }
// where quantity is the amount of ONE serving in the ingredient's unit.
export function listRecipes(businessId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(businessId));
    if (stored) return JSON.parse(stored) || {};
  } catch {
    // Corrupt cache — start empty
  }
  return {};
}

function writeRecipes(businessId, recipes) {
  try {
    localStorage.setItem(STORAGE_KEY(businessId), JSON.stringify(recipes));
  } catch {
    // Storage full/blocked — recipes still work for this session
  }
}

export function saveRecipe(businessId, { menuItemId, menuItemName, lines, prevName }) {
  const recipes = listRecipes(businessId);
  const prevKey = keyOf(prevName);
  const nextKey = keyOf(menuItemName);
  if (prevKey && prevKey !== nextKey) delete recipes[prevKey];
  const clean = (lines || [])
    .filter((l) => l.ingredientId && Number(l.quantity) > 0)
    .map((l) => ({ ingredientId: String(l.ingredientId), quantity: Number(l.quantity) }));
  if (clean.length === 0) {
    delete recipes[nextKey];
  } else {
    recipes[nextKey] = { menuItemId: menuItemId || "", menuItemName, lines: clean };
  }
  writeRecipes(businessId, recipes);
  return recipes;
}

export function getRecipeForItem(recipes, orderLine) {
  const lineId = String(orderLine?.menuItemId || orderLine?.productId || "");
  if (lineId) {
    const hit = Object.values(recipes || {}).find(
      (r) => String(r.menuItemId || "") === lineId
    );
    if (hit) return hit;
  }
  return (recipes || {})[keyOf(orderLine?.name)] || null;
}

// Deduct one completed order from ingredient stock. Never throws — stock
// must never break or delay a payment.
export async function consumeOrderStock(businessId, orderItems) {
  try {
    const recipes = listRecipes(businessId);
    const deductions = [];
    (orderItems || []).forEach((line) => {
      const recipe = getRecipeForItem(recipes, line);
      if (!recipe) return;
      const servings = Number(line.quantity) || 0;
      if (servings <= 0) return;
      recipe.lines.forEach((l) => {
        deductions.push({
          ingredientId: l.ingredientId,
          quantity: Number(l.quantity) * servings,
        });
      });
    });
    if (deductions.length > 0) await deductStock(businessId, deductions);
  } catch {
    // Non-blocking by design
  }
}

// Dish cost for ONE serving, given the ingredient catalogue.
export function dishCost(lines, ingredients) {
  const byId = new Map((ingredients || []).map((i) => [String(i.id), i]));
  return (lines || []).reduce((sum, l) => {
    const ing = byId.get(String(l.ingredientId));
    return sum + Number(l.quantity || 0) * Number(ing?.costPerUnit || 0);
  }, 0);
}
