import React, { useState, useEffect } from "react";
import { X, Save, Minus, Plus, ChevronDown } from "lucide-react";
import SelectInput from "../../../../../components/Input/SelectInput";
import { calcTotal } from "./ingredientService";

const UNITS = ["kg", "g", "liters", "ml", "pieces", "dozen"];

const blank = () => ({
  id: "",
  name: "",
  category: "Other",
  quantity: 0,
  unit: "kg",
  costPerUnit: 0,
});

// Single add/edit form — mirrors the MenuFormModal pattern.
// categoryOptions comes from GET /api/ingredients/categories (backend
// rejects anything outside that list).
export default function IngredientFormModal({
  show,
  ingredient = null,
  categoryOptions = [],
  accentColor = "#4F46E5",
  saving = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(blank());
  const [touched, setTouched] = useState(false);
  const [showPacks, setShowPacks] = useState(false);
  // Pack helper — e.g. "10 pieces of 250g" → 2500 g in stock
  const [packPacks, setPackPacks] = useState("");
  const [packSize, setPackSize] = useState("");
  const [packUnit, setPackUnit] = useState("g");
  const [packCost, setPackCost] = useState("");

  useEffect(() => {
    if (show) {
      setForm(
        ingredient
          ? { ...blank(), ...ingredient }
          : blank()
      );
      setTouched(false);
      setShowPacks(false);
      setPackPacks("");
      setPackSize("");
      setPackUnit("g");
      setPackCost("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  // Backend owns the list — keep any legacy value already on the record
  const categoryList =
    form.category && !categoryOptions.includes(form.category)
      ? [form.category, ...categoryOptions]
      : categoryOptions;

  // "10 pieces of 250g for KSh 500" → qty 2500 g @ KSh 0.2/g
  const applyPacks = () => {
    const packs = Number(packPacks) || 0;
    const size = Number(packSize) || 0;
    const total = Number(packCost) || 0;
    if (packs <= 0 || size <= 0) return;
    const qty = packs * size;
    set({
      quantity: qty,
      unit: packUnit,
      ...(total > 0 ? { costPerUnit: total / qty } : {}),
    });
    setShowPacks(false);
  };
  const packReady = (Number(packPacks) || 0) > 0 && (Number(packSize) || 0) > 0;

  const stepQty = (delta) =>
    set({ quantity: Math.max(0, (Number(form.quantity) || 0) + delta) });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const nameError = touched && !form.name.trim() ? "Ingredient name is required" : "";

  const handleSubmit = () => {
    setTouched(true);
    if (!form.name.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      category: (form.category || "Other").trim() || "Other",
      quantity: Number(form.quantity) || 0,
      costPerUnit: Number(form.costPerUnit) || 0,
    });
  };

  const inputClass =
    "w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-bold text-gray-800">
            {ingredient ? "Edit Ingredient" : "Add Ingredient"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ingredient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="e.g. Pilau Rice"
              className={`${inputClass} ${nameError ? "border-red-400" : ""}`}
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>

          <SelectInput
            id="ingredient-category"
            name="category"
            label="Category"
            options={categoryList.map((c) => ({ value: c, label: c }))}
            value={form.category}
            onChange={(e) => set({ category: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Quantity in stock
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => stepQty(-1)}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shrink-0"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={(e) => set({ quantity: e.target.value })}
                  aria-label="Quantity in stock"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
                <button
                  type="button"
                  onClick={() => stepQty(1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-lg text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => set({ unit: e.target.value })}
                className={inputClass}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pack calculator — tucked away until needed */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPacks((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-600">
                Buying in packs? <span className="font-normal text-gray-400">Calculate from packs</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showPacks ? "rotate-180" : ""}`}
              />
            </button>
            {showPacks && (
              <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                <p className="text-xs text-gray-400 mt-2">e.g. 10 packs × 250g, paid KSh 500</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-xs text-gray-500">Packs</label>
                    <input
                      type="number"
                      min="0"
                      value={packPacks}
                      onChange={(e) => setPackPacks(e.target.value)}
                      placeholder="10"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Size per pack</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={packSize}
                      onChange={(e) => setPackSize(e.target.value)}
                      placeholder="250"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs text-gray-500">Size unit</label>
                    <select
                      value={packUnit}
                      onChange={(e) => setPackUnit(e.target.value)}
                      className={inputClass}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Total paid (KSh)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={packCost}
                      onChange={(e) => setPackCost(e.target.value)}
                      placeholder="500"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyPacks}
                  disabled={!packReady}
                  className="mt-3 w-full py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={packReady ? { backgroundColor: accentColor } : { backgroundColor: "#9ca3af" }}
                >
                  {packReady
                    ? `Use ${(Number(packPacks) * Number(packSize)).toLocaleString()} ${packUnit}`
                    : "Enter packs & size to compute"}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Cost per {form.unit || "unit"} (KSh)
              </label>
              <span className="text-xs text-gray-400">
                Total <span className="font-bold text-gray-700">KSh {Number(calcTotal(form.quantity, form.costPerUnit)).toLocaleString()}</span>
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.costPerUnit}
              onChange={(e) => set({ costPerUnit: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            <Save size={15} /> {ingredient ? "Save Changes" : "Add Ingredient"}
          </button>
        </div>
      </div>
    </div>
  );
}
