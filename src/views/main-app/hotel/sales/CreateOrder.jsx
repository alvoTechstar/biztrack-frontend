import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../store";
import { Plus, Minus, ShoppingCart, Trash2, CheckCircle, RefreshCw, UtensilsCrossed, AlertCircle, X } from "lucide-react";
import DeleteConfirmationModal from "../../../../components/modal/DeleteConfirmationModal";
import MenuItemImage from "../../../../components/menu/MenuItemImage";
import { GET, POST } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

const formatKsh = (amount) => `KSh ${Number(amount).toLocaleString()}`;

export default function CreateOrder() {
  const dispatch    = useDispatch();
  const authUser    = useSelector((state) => state.auth.value);
  const orderCounter = useSelector((state) => state.hotelOrders.counter);

  const businessId = String(
    authUser?.businessId || authUser?.institutionId || authUser?.associatedBusinessId || ""
  ).trim();

  const [menuItems, setMenuItems]       = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError]       = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart]                 = useState([]);
  const [tableNumber, setTableNumber]   = useState("");
  const [orderNote, setOrderNote]       = useState("");
  const [submitted, setSubmitted]       = useState(false);
  const [deleteModal, setDeleteModal]   = useState({ open: false, itemId: null });
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // ── Fetch menu from API ───────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    if (!businessId) { setIsLoadingMenu(false); return; }
    setIsLoadingMenu(true);
    setMenuError(false);
    try {
      const endpoint = URLS.MENU.GET_ITEMS_BY_BUSINESS.replace(":businessId", businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        const items = (res.items || res.data || [])
          .filter((p) => p.available !== false)
          .map((p) => ({
            id:          p.id || p._id,
            category:    p.category || "General",
            name:        p.name,
            price:       Number(p.price) || 0,
            description: p.description || "",
            image:       p.image || "",
          }));
        setMenuItems(items);
      } else {
        setMenuError(true);
      }
    } catch (_) {
      setMenuError(true);
    } finally {
      setIsLoadingMenu(false);
    }
  }, [businessId]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // Derive categories dynamically from current menu
  const CATEGORIES = ["All", ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const getCartItem = (menuItemId) => cart.find((i) => i.menuItemId === menuItemId);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
          image: item.image || "",
          category: item.category || "",
        },
      ];
    });
  };

  const decreaseQty = (menuItemId) => {
    const item = cart.find((i) => i.menuItemId === menuItemId);
    if (!item) return;
    if (item.quantity === 1) {
      setDeleteModal({ open: true, itemId: menuItemId });
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId
          ? { ...i, quantity: i.quantity - 1, subtotal: (i.quantity - 1) * i.price }
          : i
      )
    );
  };

  const confirmRemove = () => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== deleteModal.itemId));
    setDeleteModal({ open: false, itemId: null });
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const canSubmit = tableNumber.trim() && cart.length > 0;

  // Close the mobile cart drawer whenever the cart empties
  useEffect(() => {
    if (cart.length === 0) setMobileCartOpen(false);
  }, [cart.length]);

  const submitOrder = async () => {
    if (!canSubmit) return;
    const orderId    = `ORD-${String(orderCounter).padStart(4, "0")}`;
    const waiterName = authUser?.name || authUser?.firstName || authUser?.username || "Waiter";
    const orderItems = cart.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image || "",
      category: i.category || "",
    }));

    // 1. Dispatch to Redux immediately for instant UI feedback
    dispatch(
      hotelOrderActions.addOrder({
        id:          orderId,
        tableNumber: tableNumber.trim(),
        items:       orderItems,
        total:       cartTotal,
        status:      "pending",
        waiter:      waiterName,
        note:        orderNote.trim(),
        createdAt:   new Date().toISOString(),
      })
    );

    // 2. Persist to backend (fire-and-forget — UI already updated)
    try {
      const res = await POST(URLS.TRANSACTIONS.CREATE_TRANSACTION, {
        businessId,
        tableNumber: tableNumber.trim(),
        items:       orderItems,
        total:       cartTotal,
        status:      "pending",
        waiter:      waiterName,
        note:        orderNote.trim(),
        type:        "hotel_order",
        orderId,
      });
      // Store the backend _id so CompleteOrder can PUT by it later
      if (res?.success && (res.transaction?._id || res.data?._id)) {
        dispatch(hotelOrderActions.setBackendId({
          frontendId: orderId,
          backendId:  res.transaction?._id || res.data?._id,
        }));
      }
    } catch (_) {
      // Order is already in Redux; backend sync failure is non-blocking
    }

    setCart([]);
    setTableNumber("");
    setOrderNote("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Shared cart panel content — rendered in the desktop sidebar and the mobile drawer
  const cartPanel = (
    <>
      <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-base">Order Summary</h2>
        <button
          onClick={() => setMobileCartOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>

      {/* Table Number */}
      <div className="px-5 py-3 border-b">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Table / Room <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="e.g. Table 5 / Room 201"
          className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                <MenuItemImage
                  src={item.image}
                  name={item.name}
                  category={item.category}
                  emojiSize="text-base"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 leading-tight truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">{formatKsh(item.price)} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => decreaseQty(item.menuItemId)}
                  className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => addToCart(menuItems.find((m) => m.id === item.menuItemId))}
                  className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>
              <span className="text-sm font-semibold text-gray-700 w-16 text-right shrink-0">
                {formatKsh(item.subtotal)}
              </span>
              <button
                onClick={() => setDeleteModal({ open: true, itemId: item.menuItemId })}
                className="text-red-300 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Order Note */}
      <div className="px-5 py-3 border-t">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Special Instructions
        </label>
        <textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Allergies, preferences..."
          rows={2}
          className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Total & Submit */}
      <div className="px-5 py-4 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-700">Total</span>
          <span className="text-xl font-bold text-indigo-600">{formatKsh(cartTotal)}</span>
        </div>
        <button
          onClick={submitOrder}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            canSubmit
              ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart size={16} />
          Submit Order
        </button>
        {!tableNumber.trim() && cart.length > 0 && (
          <p className="text-xs text-red-400 text-center mt-2">Enter a table or room number to submit</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Left panel: category tabs + menu grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Create Order</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShoppingCart size={16} />
            <span>{cartCount} item{cartCount !== 1 ? "s" : ""} in cart</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white border-b px-6 flex gap-1 overflow-x-auto shadow-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === cat
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className={`flex-1 overflow-y-auto p-5 ${cart.length > 0 ? "pb-24 lg:pb-5" : ""}`}>
          {isLoadingMenu ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <RefreshCw size={28} className="animate-spin opacity-50" />
              <p className="text-sm">Loading menu...</p>
            </div>
          ) : menuError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <AlertCircle size={40} className="opacity-40" />
              <p className="text-sm font-medium text-gray-500">Couldn't load the menu</p>
              <p className="text-xs text-gray-400">Check your connection and try again.</p>
              <button
                onClick={fetchMenu}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <UtensilsCrossed size={40} className="opacity-40" />
              <p className="text-sm font-medium text-gray-500">No menu items yet</p>
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Your admin hasn't added any menu items. Ask them to set up the menu in Menu Management.
              </p>
              <button
                onClick={fetchMenu}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const inCart = getCartItem(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
                    inCart ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-100"
                  }`}
                >
                  <div className="h-28 w-full overflow-hidden shrink-0">
                    <MenuItemImage
                      src={item.image}
                      name={item.name}
                      category={item.category}
                      emojiSize="text-3xl"
                    />
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-indigo-600 text-sm">{formatKsh(item.price)}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-gray-800">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* ── Cart: hidden until an item is added ── */}
      {cart.length > 0 && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden lg:flex w-80 bg-white border-l flex-col shadow-lg">
            {cartPanel}
          </div>

          {/* Mobile floating cart bar */}
          <button
            onClick={() => setMobileCartOpen(true)}
            className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-indigo-600 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <ShoppingCart size={18} />
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </span>
            <span className="font-bold">{formatKsh(cartTotal)}</span>
          </button>

          {/* Mobile bottom-sheet drawer */}
          {mobileCartOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
              <button
                className="absolute inset-0 bg-black/40 cursor-default"
                onClick={() => setMobileCartOpen(false)}
                aria-label="Close cart"
              />
              <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
                {cartPanel}
              </div>
            </div>
          )}
        </>
      )}

      {/* Order submitted toast */}
      {submitted && (
        <div className="fixed top-4 right-4 z-[60] bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle size={16} /> Order Submitted!
        </div>
      )}

      {/* Remove Item Confirmation */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, itemId: null })}
        onConfirm={confirmRemove}
        title="Remove Item"
        message="Remove this item from the order?"
        confirmText="Remove"
        cancelText="Keep"
        itemName={cart.find((i) => i.menuItemId === deleteModal.itemId)?.name}
      />
    </div>
  );
}
