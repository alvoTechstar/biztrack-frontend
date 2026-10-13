import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { PlusCircle, Package, DollarSign, AlertTriangle } from "lucide-react";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import Toaster from "../../../../../components/Toaster";
import SearchInput from "../../../../../components/Input/SearchInput";
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import DataTable from "../../../../../components/datatable";
import TablePill from "../../../../../components/datatable/TablePill";
import TableActions from "../../../../../components/datatable/TableActions";
import DeleteConfirmationModal from "../../../../../components/modal/DeleteConfirmationModal";
import KpiCard from "../../dashboard/admin/KpiCard";
import IngredientFormModal from "./IngredientFormModal";
import {
  listIngredients,
  listCategories,
  saveIngredient,
  removeIngredient,
  LOW_STOCK_THRESHOLD,
} from "./ingredientService";

const HEADERS = [
  { title: "Ingredient", key: "name" },
  { title: "Category", key: "category" },
  { title: "Quantity", key: "quantity" },
  { title: "Cost / Unit", key: "cost" },
  { title: "Total Value", key: "total" },
  { title: "Stock", key: "stock" },
  { title: "Action", key: "action" },
];

const formatKsh = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const isLow = (item) => Number(item.quantity) <= LOW_STOCK_THRESHOLD;

export default function IngredientsManagementPage() {
  const { primaryColor } = useTheme();
  const currentUser = useSelector((s) => s.auth?.value);
  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId || currentUser?.associatedBusinessId || ""
  ).trim();

  const [ingredients, setIngredients] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });

  const [toaster, setToaster] = useState({ open: false, state: "true", title: "", message: "" });
  const showToaster = useCallback((success, title, message) => {
    setToaster({ open: true, state: success ? "true" : "false", title, message });
  }, []);
  const closeToaster = useCallback(() => setToaster((prev) => ({ ...prev, open: false })), []);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([
        listIngredients(businessId),
        listCategories().catch(() => []),
      ]);
      setIngredients(items);
      setCategoryOptions(cats);
    } catch (err) {
      showToaster(false, "Error", err.message || "Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  }, [businessId, showToaster]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const categories = useMemo(
    () => [...new Set(ingredients.map((i) => i.category).filter(Boolean))],
    [ingredients]
  );
  const categoryCount = (cat) =>
    cat === "All" ? ingredients.length : ingredients.filter((i) => i.category === cat).length;

  const filtered = useMemo(() => {
    let result = [...ingredients];
    if (activeCategory !== "All") result = result.filter((i) => i.category === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.category || "").toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, activeCategory, searchTerm]);

  const totalValue = useMemo(
    () => ingredients.reduce((s, i) => s + Number(i.totalCost || 0), 0),
    [ingredients]
  );
  const lowStockCount = useMemo(() => ingredients.filter(isLow).length, [ingredients]);

  const transformed = useMemo(
    () =>
      filtered.map((i) => ({
        ...i,
        id: String(i.id),
        quantity: `${i.quantity} ${i.unit}`,
        cost: formatKsh(i.costPerUnit),
        total: formatKsh(i.totalCost),
        stock: isLow(i) ? "Low Stock" : "In Stock",
        availableActions: ["edit", "delete"],
        action: String(i.id),
      })),
    [filtered]
  );

  const renderCell = (column, header) => {
    if (header.key === "stock") return <TablePill state={column.stock} />;
    if (header.key === "action") {
      return (
        <TableActions
          status={column.stock}
          actions={column.availableActions || ["edit", "delete"]}
          id={column.id}
          action={handleActionSelected}
        />
      );
    }
    return column[header.key];
  };

  const handleActionSelected = (action, id) => {
    const item = ingredients.find((i) => String(i.id) === String(id));
    if (!item) return;
    if (action === "edit") {
      setEditingIngredient(item);
      setShowFormModal(true);
    } else if (action === "delete") {
      setDeleteModal({ open: true, id: item.id, name: item.name });
    }
  };

  const handleAddClick = () => {
    setEditingIngredient(null);
    setShowFormModal(true);
  };

  const handleSave = async (ingredient) => {
    setSaving(true);
    try {
      const saved = await saveIngredient(businessId, ingredient);
      setIngredients((prev) =>
        prev.some((i) => String(i.id) === String(saved.id))
          ? prev.map((i) => (String(i.id) === String(saved.id) ? saved : i))
          : [...prev, saved]
      );
      showToaster(true, "Success", `"${saved.name}" saved`);
      setShowFormModal(false);
      setEditingIngredient(null);
    } catch (err) {
      showToaster(false, "Error", err.message || "Failed to save ingredient");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await removeIngredient(businessId, deleteModal.id);
      setIngredients((prev) => prev.filter((i) => String(i.id) !== String(deleteModal.id)));
      showToaster(true, "Deleted", `"${deleteModal.name}" removed`);
      setDeleteModal({ open: false, id: null, name: "" });
    } catch (err) {
      showToaster(false, "Error", err.message || "Failed to delete ingredient");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading ingredients..."
          loadedText=""
          color={primaryColor}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-1 p-2">
        Ingredient Management
        {currentUser?.businessName && (
          <span className="text-lg font-normal text-gray-600 ml-2">
            - {currentUser.businessName}
          </span>
        )}
      </h1>
      <p className="text-sm text-gray-500 px-2 mb-6">
        Kitchen stock at a glance — restock before service runs dry.
      </p>

      {/* Summary — same cards as the dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KpiCard
          icon={<Package size={22} />}
          title="Ingredients"
          value={ingredients.length}
          color="blue"
          footer="Tracked items"
        />
        <KpiCard
          icon={<DollarSign size={22} />}
          title="Stock Value"
          value={formatKsh(totalValue)}
          color="green"
          footer="Across all items"
        />
        <KpiCard
          icon={<AlertTriangle size={22} />}
          title="Low Stock"
          value={lowStockCount}
          color="amber"
          footer={`At or below ${LOW_STOCK_THRESHOLD} units`}
        />
      </div>

      {/* Toolbar — search + add, categories below */}
      <div className="bg-white p-4 mb-4">
        <div className="flex gap-4 flex-wrap items-center justify-between">
          <div className="min-w-64 flex-1">
            <SearchInput
              id="ingredient-search"
              placeholder="Search by name or category..."
              input={searchTerm}
              handleInput={setSearchTerm}
              handleClear={() => setSearchTerm("")}
              error={false}
              disabled={false}
            />
          </div>
          <div className="flex-shrink-0">
            <AppFormButton
              text={
                <div className="flex items-center gap-2">
                  <PlusCircle size={18} />
                  Add Ingredient
                </div>
              }
              color={primaryColor}
              isLoading={false}
              validation={true}
              action={handleAddClick}
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto mt-3">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={activeCategory === cat ? { backgroundColor: primaryColor, color: "#fff" } : undefined}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors shrink-0 ${
                activeCategory === cat
                  ? "shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
              <span className={`text-xs font-semibold ${activeCategory === cat ? "text-white/70" : "text-gray-400"}`}>
                {categoryCount(cat)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-xl shadow-md px-4 pt-2 pb-4">
        {ingredients.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Package size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No ingredients yet
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first ingredient to start tracking kitchen stock.
              </p>
              <AppFormButton
                text={
                  <div className="flex items-center gap-2">
                    <PlusCircle size={18} />
                    Add Your First Ingredient
                  </div>
                }
                color={primaryColor}
                action={handleAddClick}
                validation={true}
              />
            </div>
          </div>
        ) : (
        <div className="mt-2">
          <div className="flex justify-start items-center mb-2">
            <div className="text-sm text-gray-500">
              Showing {transformed.length} of {ingredients.length} ingredients
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <DataTable
              data={transformed}
              headers={HEADERS}
              type="ingredients"
              selected={[]}
              selectedAction={() => {}}
              selectAll={false}
              all={false}
              actionSelected={handleActionSelected}
              selectedRow={() => {}}
              actions={["edit", "delete"]}
              clickable={false}
              color={primaryColor}
              customRenderCell={renderCell}
            />
          </div>
        </div>
        )}
      </div>

      <IngredientFormModal
        show={showFormModal}
        ingredient={editingIngredient}
        categoryOptions={categoryOptions}
        accentColor={primaryColor}
        saving={saving}
        onClose={() => {
          setShowFormModal(false);
          setEditingIngredient(null);
        }}
        onSave={handleSave}
      />

      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
        title="Delete Ingredient"
        message="This will permanently remove the ingredient from your inventory."
        confirmText="Delete"
        cancelText="Cancel"
        itemName={deleteModal.name || ""}
      />

      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={closeToaster}
        position="right"
      />
    </div>
  );
}
