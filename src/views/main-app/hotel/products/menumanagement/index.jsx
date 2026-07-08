import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { GET, POST, PUT, DELETE } from '../../../../../services/DatabaseServiceImp';
import URLS from '../../../../../utilities/Endpoints';
import ContentLoader from '../../../../../components/Loader/ContentLoader';
import Toaster from '../../../../../components/Toaster';
import DeleteConfirmationModal from '../../../../../components/modal/DeleteConfirmationModal';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import { UtensilsCrossed, CheckCircle, EyeOff, LayoutGrid } from 'lucide-react';
import MenuControls from './MenuControls';
import MenuTable from './MenuTable';
import MenuFormModal from './MenuFormModal';

// Helper: normalise a backend menu item to local shape
const toLocal = (p) => ({
  id:          p.id || p._id?.toString(),
  _id:         p.id || p._id,
  name:        p.name        || '',
  category:    p.category    || 'Mains',
  price:       Number(p.price) || 0,
  description: p.description || '',
  available:   p.available !== false,
  image:       p.image || '',
  businessId:  p.businessId,
});

const SummaryCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-2xl p-5 shadow-sm border border-white/60`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className={`text-2xl font-bold ${textColor} mt-1 truncate`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${bgColor.replace('50', '100')}`}>
        <Icon className={`h-5 w-5 ${textColor}`} />
      </div>
    </div>
  </div>
);

const MenuManagement = () => {
  const { primaryColor } = useTheme();
  const currentUser = useSelector((s) => s.auth?.value);
  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId || currentUser?.associatedBusinessId || ''
  ).trim();

  // Data states
  const [menuItems, setMenuItems]   = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [errorMessage, setErrorMessage]   = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal]     = useState(false);
  const [formMode, setFormMode]               = useState('add');
  const [currentItem, setCurrentItem]         = useState(null);
  const [deleteModal, setDeleteModal]         = useState({ open: false, item: null });
  const [submitting, setSubmitting]           = useState(false);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Toaster
  const [toaster, setToaster] = useState({ open: false, state: 'true', title: '', message: '' });
  const showToaster = useCallback((success, title, message) => {
    setToaster({ open: true, state: success ? 'true' : 'false', title, message });
  }, []);
  const closeToaster = useCallback(() => setToaster((prev) => ({ ...prev, open: false })), []);

  // ── Fetch menu items ──────────────────────────────────────────
  const loadMenuItems = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    setErrorMessage(null);
    try {
      const endpoint = URLS.MENU.GET_ITEMS_BY_BUSINESS.replace(':businessId', businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        setMenuItems((res.items || res.data || []).map(toLocal));
      } else {
        throw new Error(res?.message || 'Failed to load menu items');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load menu items');
      showToaster(false, 'Error', err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }, [businessId, showToaster]);

  useEffect(() => { loadMenuItems(); }, [loadMenuItems]);

  // Categories derived from items
  const categories = useMemo(
    () => [...new Set(menuItems.map((i) => i.category).filter(Boolean))],
    [menuItems]
  );

  // ── Filter items (search + advanced filters) ──────────────────
  const filteredItems = useMemo(() => {
    let filtered = [...menuItems];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    if (selectedItems.length > 0) {
      filtered = filtered.filter((i) =>
        selectedItems.some((selected) => {
          if (selected === 'Available') return i.available;
          if (selected === 'Unavailable') return !i.available;
          if (categories.includes(selected)) return i.category === selected;
          return false;
        })
      );
    }

    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [menuItems, searchTerm, selectedItems, categories]);

  // ── Modal handlers ────────────────────────────────────────────
  const handleAddClick = () => {
    setCurrentItem(null);
    setFormMode('add');
    setErrorMessage(null);
    setShowFormModal(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormMode('edit');
    setErrorMessage(null);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCurrentItem(null);
    setErrorMessage(null);
  };

  // ── CRUD operations ───────────────────────────────────────────
  const handleSaveItem = async (itemData) => {
    const payload = { ...itemData, businessId };
    try {
      if (formMode === 'edit' && itemData._id) {
        const endpoint = URLS.MENU.UPDATE_ITEM.replace(':id', itemData._id);
        const res = await PUT(endpoint, payload);
        if (res?.success) {
          setMenuItems((prev) =>
            prev.map((it) => (it._id === itemData._id ? toLocal(res.item || { ...it, ...payload }) : it))
          );
          showToaster(true, 'Success', 'Menu item updated successfully');
          closeFormModal();
        } else {
          throw new Error(res?.message || 'Failed to update item');
        }
      } else {
        const res = await POST(URLS.MENU.CREATE_ITEM, payload);
        if (res?.success) {
          setMenuItems((prev) => [...prev, toLocal(res.item || res.data || payload)]);
          showToaster(true, 'Success', 'Menu item added successfully');
          closeFormModal();
        } else {
          throw new Error(res?.message || 'Failed to add item');
        }
      }
    } catch (err) {
      // Keep the modal open for retry; surface the error inside it
      setErrorMessage(err.message || 'Something went wrong');
      showToaster(false, 'Error', err.message || 'Something went wrong');
    }
  };

  const handleToggleAvailability = async (item) => {
    const newAvailable = !item.available;
    // Optimistic update
    setMenuItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, available: newAvailable } : i)));
    try {
      const endpoint = URLS.MENU.UPDATE_ITEM.replace(':id', item._id);
      await PUT(endpoint, { available: newAvailable });
      showToaster(true, 'Updated', `"${item.name}" is now ${newAvailable ? 'available' : 'unavailable'}`);
    } catch {
      // Revert on failure
      setMenuItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, available: item.available } : i)));
      showToaster(false, 'Error', 'Failed to update availability');
    }
  };

  const handleDeleteClick = (item) => setDeleteModal({ open: true, item });

  const confirmDelete = async () => {
    const item = deleteModal.item;
    if (!item) return;
    setSubmitting(true);
    try {
      const endpoint = URLS.MENU.DELETE_ITEM.replace(':id', item._id);
      const res = await DELETE(endpoint);
      if (res?.success || res?.message?.toLowerCase().includes('deleted')) {
        setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
        showToaster(true, 'Deleted', `"${item.name}" removed from the menu`);
        setDeleteModal({ open: false, item: null });
      } else {
        throw new Error(res?.message || 'Failed to delete item');
      }
    } catch (err) {
      showToaster(false, 'Error', err.message || 'Failed to delete item');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────
  const availableCount   = menuItems.filter((i) => i.available).length;
  const unavailableCount = menuItems.length - availableCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="main-app-view">
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading menu items..."
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 p-2">
        Menu Management
        {currentUser?.businessName && (
          <span className="text-lg font-normal text-gray-600 ml-2">
            - {currentUser.businessName}
          </span>
        )}
      </h1>

      <div className="bg-white p-2">
        {errorMessage && !showFormModal && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ml-2">
          <SummaryCard
            title="Total Menu Items"
            value={menuItems.length}
            icon={UtensilsCrossed}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <SummaryCard
            title="Available"
            value={availableCount}
            icon={CheckCircle}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <SummaryCard
            title="Unavailable"
            value={unavailableCount}
            icon={EyeOff}
            bgColor="bg-orange-50"
            textColor="text-orange-600"
          />
          <SummaryCard
            title="Categories"
            value={categories.length}
            icon={LayoutGrid}
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>

        {/* Search / filters / add */}
        <MenuControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          onAddItem={handleAddClick}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />

        {/* Data table */}
        <div className="ml-2">
          <MenuTable
            items={filteredItems}
            onEditItem={handleEdit}
            onToggleItem={handleToggleAvailability}
            onDeleteItem={handleDeleteClick}
            onAddItem={handleAddClick}
          />
        </div>
      </div>

      {/* Add / Edit modal */}
      <MenuFormModal
        show={showFormModal}
        mode={formMode}
        item={currentItem}
        onClose={closeFormModal}
        onSave={handleSaveItem}
        categories={categories}
        errorMessage={showFormModal ? errorMessage : null}
      />

      {/* Delete confirmation */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message="This will permanently remove the item from your menu. Waiters will no longer see it on Create Order."
        confirmText="Delete Permanently"
        cancelText="No, Keep Item"
        isLoading={submitting}
        itemName={deleteModal.item?.name || ''}
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
};

export default MenuManagement;
