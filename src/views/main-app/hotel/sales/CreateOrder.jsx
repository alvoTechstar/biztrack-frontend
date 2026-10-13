import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../store";
import { Plus, Minus, ShoppingCart, Trash2, CheckCircle, RefreshCw, UtensilsCrossed, AlertCircle, X } from "lucide-react";
import DeleteConfirmationModal from "../../../../components/modal/DeleteConfirmationModal";
import MenuItemImage from "../../../../components/menu/MenuItemImage";
import SearchInput from "../../../../components/Input/SearchInput";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../components/theme/ThemeContext";
import { GET, POST } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

const formatKsh = (amount) => `KSh ${Number(amount).toLocaleString()}`;

export default function CreateOrder() {
  const dispatch    = useDispatch();
  const { primaryColor } = useTheme();
  const authUser    = useSelector((state) => state.auth.value);
  const orderCounter = useSelector((state) => state.hotelOrders.counter);

  const businessId = String(
    authUser?.businessId || authUser?.institutionId || authUser?.associatedBusinessId || ""
  ).trim();

  const [menuItems, setMenuItems]       = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError]       = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuSearch, setMenuSearch]     = useState("");
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

  // Derive categories dynamically from current menu, with counts
  const CATEGORIES = ["All", ...Array.from(new Set(menuItems.map((i) => i.category)))];
  const categoryCount = (cat) =>
    cat === "All" ? menuItems.length : menuItems.filter((i) => i.category === cat).length;

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory !== "All" && item.category !== activeCategory) return false;
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

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
      productId: i.menuItemId,
      menuItemId: i.menuItemId,
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
        <h2 className="font-bold text-gray-800 text-base">
          Order Summary{" "}
          <span className="ml-1 text-xs font-semibold rounded-full px-2 py-0.5" style={{ color: primaryColor, backgroundColor: `${primaryColor}1A` }}>
            {cartCount}
          </span>
        </h2>
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
          aria-label="Table or room number"
          className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
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
                  title={`Remove one ${item.name}`}
                  aria-label={`Remove one ${item.name}`}
                  className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => addToCart(menuItems.find((m) => m.id === item.menuItemId))}
                  title={`Add one more ${item.name}`}
                  aria-label={`Add one more ${item.name}`}
                  style={{ backgroundColor: primaryColor }}
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>
              <span className="text-sm font-semibold text-gray-700 w-16 text-right shrink-0">
                {formatKsh(item.subtotal)}
              </span>
              <button
                onClick={() => setDeleteModal({ open: true, itemId: item.menuItemId })}
                title={`Remove ${item.name} from order`}
                aria-label={`Remove ${item.name} from order`}
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
          className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
        />
      </div>

      {/* Total & Submit */}
      <div className="px-5 py-4 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-gray-700">
            Total <span className="text-xs font-normal text-gray-400">({cartCount} item{cartCount !== 1 ? "s" : ""})</span>
          </span>
          <span className="text-xl font-bold" style={{ color: primaryColor }}>{formatKsh(cartTotal)}</span>
        </div>
        <button
          onClick={submitOrder}
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-3 ${
            canSubmit
              ? "text-white hover:opacity-90 active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          style={canSubmit ? { backgroundColor: primaryColor } : undefined}
        >
          <ShoppingCart size={16} />
          {cart.length === 0
            ? "Add items to start an order"
            : tableNumber.trim()
              ? `Submit Order • ${formatKsh(cartTotal)}`
              : "Enter table number to submit"}
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
        <div className="bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Create Order</h1>
              <p className="text-xs text-gray-400 mt-0.5">Tap items to build the order, then send it to the kitchen</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
              <ShoppingCart size={16} />
              <span>{cartCount} item{cartCount !== 1 ? "s" : ""} in cart</span>
            </div>
          </div>
          <div className="mt-3 max-w-md">
            <SearchInput
              id="menu-search"
              placeholder="Search menu by name..."
              input={menuSearch}
              handleInput={setMenuSearch}
              handleClear={() => setMenuSearch("")}
              error={false}
              disabled={isLoadingMenu}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="bg-white border-b px-6 py-3 flex gap-2 overflow-x-auto shadow-sm">
          {CATEGORIES.map((cat) => (
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

        {/* Menu Grid */}
        <div className={`flex-1 overflow-y-auto p-5 ${cart.length > 0 ? "pb-24 lg:pb-5" : ""}`}>
          {isLoadingMenu ? (
            <div className="flex flex-col items-center justify-center h-48">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading menu..."
                loadedText=""
                color={primaryColor}
              />
            </div>
          ) : menuError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <AlertCircle size={40} className="opacity-40" />
              <p className="text-sm font-medium text-gray-500">Couldn't load the menu</p>
              <p className="text-xs text-gray-400">Check your connection and try again.</p>
              <button
                onClick={fetchMenu}
                style={{ backgroundColor: primaryColor }}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-colors"
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
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <UtensilsCrossed size={40} className="opacity-40" />
              <p className="text-sm font-medium text-gray-500">No matches for “{menuSearch}”</p>
              <button
                onClick={() => { setMenuSearch(""); setActiveCategory("All"); }}
                className="mt-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const inCart = getCartItem(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  title={`Add ${item.name} to order`}
                  style={inCart ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` } : undefined}
                  className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-md active:scale-[0.98] ${
                    inCart ? "" : "border-gray-100"
                  }`}
                >
                  <div className="h-28 w-full overflow-hidden shrink-0 relative">
                    <MenuItemImage
                      src={item.image}
                      name={item.name}
                      category={item.category}
                      emojiSize="text-3xl"
                    />
                    {inCart && (
                      <span className="absolute top-2 right-2 min-w-6 h-6 px-1.5 rounded-full text-white text-xs font-bold flex items-center justify-center shadow" style={{ backgroundColor: primaryColor }}>
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm" style={{ color: primaryColor }}>{formatKsh(item.price)}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => decreaseQty(item.id)}
                            title={`Remove one ${item.name}`}
                            aria-label={`Remove one ${item.name}`}
                            style={{ color: primaryColor, backgroundColor: `${primaryColor}1A` }}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-gray-800">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            title={`Add one more ${item.name}`}
                            aria-label={`Add one more ${item.name}`}
                            style={{ backgroundColor: primaryColor }}
                            className="w-6 h-6 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      ) : (
                        <span className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                          <Plus size={14} />
                        </span>
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
            style={{ backgroundColor: primaryColor }}
            className="lg:hidden fixed bottom-4 left-4 right-4 z-40 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform"
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
