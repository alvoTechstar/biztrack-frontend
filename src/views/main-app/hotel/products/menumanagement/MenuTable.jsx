import React from 'react';
import { UtensilsCrossed, PlusCircle } from 'lucide-react';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import DataTable from '../../../../../components/datatable';
import AppFormButton from '../../../../../components/buttons/AppFormButton';
import { keyOf } from './recipeService';
import { LOW_STOCK_THRESHOLD } from '../ingredient-management/ingredientService';

const MENU_TABLE_HEADERS = [
  { title: 'Item', key: 'item' },
  { title: 'Category', key: 'categoryDisplay' },
  { title: 'Price', key: 'priceDisplay' },
  { title: 'Recipe', key: 'recipeDisplay' },
  { title: 'Description', key: 'descriptionDisplay' },
  { title: 'Availability', key: 'availability' },
  { title: 'Action', key: 'action' },
];

// Recipe + stock readiness per dish — the visible end of the
// menu ↔ recipe ↔ stock integration.
const recipeStatus = (item, recipes, ingredientById) => {
  const byName = (recipes || {})[keyOf(item.name)];
  const recipe = byName || Object.values(recipes || {}).find(
    (r) => String(r.menuItemId || "") && String(r.menuItemId) === String(item._id || item.id || "")
  );
  if (!recipe || recipe.lines.length === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        No recipe
      </span>
    );
  }
  const names = [];
  let out = false;
  let low = false;
  recipe.lines.forEach((l) => {
    const ing = ingredientById.get(String(l.ingredientId));
    if (!ing) {
      low = true;
      names.push("missing ingredient");
      return;
    }
    names.push(`${ing.name} ${l.quantity}${ing.unit}`);
    const qty = Number(ing.quantity) || 0;
    if (qty <= 0) out = true;
    else if (qty <= LOW_STOCK_THRESHOLD) low = true;
  });
  const style = out
    ? "bg-red-100 text-red-700"
    : low
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";
  const label = out
    ? "Out of stock"
    : low
      ? "Low stock"
      : `Ready · ${recipe.lines.length} item${recipe.lines.length !== 1 ? "s" : ""}`;
  return (
    <span
      title={names.join(", ")}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {label}
    </span>
  );
};

const MenuTable = ({ items = [], recipes = {}, ingredients = [], onEditItem, onToggleItem, onDeleteItem, onAddItem }) => {
  const theme = useTheme();
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300 mt-4">
        <div className="max-w-md mx-auto">
          <UtensilsCrossed size={64} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No menu items found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first menu item — waiters will see it instantly on Create Order.
          </p>
          <AppFormButton
            text={
              <div className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Your First Item
              </div>
            }
            color={theme.primaryColor}
            action={onAddItem}
            validation={true}
          />
        </div>
      </div>
    );
  }

  const handleActionSelected = (action, id) => {
    const item = safeItems.find((i) => i._id === id || i.id === id);
    if (!item) return;

    switch (action.toLowerCase()) {
      case 'edit':
        onEditItem?.(item);
        break;
      case 'disable':
      case 'enable':
        onToggleItem?.(item);
        break;
      case 'delete':
        onDeleteItem?.(item);
        break;
      default:
        break;
    }
  };

  // Transform only for display — raw data stays intact in safeItems
  const ingredientById = new Map((ingredients || []).map((ing) => [String(ing.id), ing]));
  const transformedItems = safeItems.map((item) => {
    const itemId = item._id || item.id;
    return {
      ...item,
      id: itemId,
      _id: itemId,
      item: (
        <div className="flex items-center gap-2.5">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={16} className="text-orange-400" />
            </div>
          )}
          <span className="font-semibold">{item.name}</span>
        </div>
      ),
      categoryDisplay: item.category || '—',
      priceDisplay: `KSh ${Number(item.price || 0).toLocaleString()}`,
      recipeDisplay: recipeStatus(item, recipes, ingredientById),
      descriptionDisplay:
        (item.description || '').length > 60
          ? `${item.description.slice(0, 60)}…`
          : item.description || '—',
      availability: (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            item.available !== false
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              item.available !== false ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {item.available !== false ? 'Available' : 'Unavailable'}
        </span>
      ),
      // Per-row actions: toggle icon flips with availability
      availableActions:
        item.available !== false
          ? ['edit', 'disable', 'delete']
          : ['edit', 'enable', 'delete'],
    };
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <DataTable
        data={transformedItems}
        headers={MENU_TABLE_HEADERS}
        type="menu"
        selected={[]}
        selectedAction={() => {}}
        selectAll={() => {}}
        all={false}
        actionSelected={handleActionSelected}
        selectedRow={() => {}}
        clickable={false}
        color={theme.primaryColor}
      />
    </div>
  );
};

export default MenuTable;
