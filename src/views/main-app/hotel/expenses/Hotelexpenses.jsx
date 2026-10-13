import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Wallet, Plus, RefreshCw, Users, Banknote, Clock, Repeat,
} from "lucide-react";
import { GET, POST } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";
import { useTheme } from "../../../../components/theme/ThemeContext";
import SearchInput from "../../../../components/Input/SearchInput";
import FilterInput from "../../../../components/Input/FilterInput";
import TextInput from "../../../../components/Input/TextInput";
import SelectInput from "../../../../components/Input/SelectInput";
import DataTable from "../../../../components/datatable";
import TablePill from "../../../../components/datatable/TablePill";
import PaymentChannelPill from "../../../../components/datatable/PaymentChannelPill";
import Modal from "../../../../components/modal/Modal";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import Toaster from "../../../../components/Toaster";

// Compact summary card — small type, flat clean look.
const SummaryCard = ({ title, value, icon: Icon, bgColor, textColor, sub }) => (
  <div className={`${bgColor} rounded-2xl p-4 shadow-sm border border-white/60`}>
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgColor.replace("50", "100")}`}>
        <Icon className={`h-4 w-4 ${textColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
        <p className={`text-xl font-bold ${textColor} truncate`}>{value}</p>
      </div>
    </div>
    {sub && <p className="text-[11px] text-gray-400 mt-1.5 truncate">{sub}</p>}
  </div>
);

const formatKsh = (n) => `KSh ${Number(n || 0).toLocaleString()}`;

const EXPENSE_CATEGORIES = ["Utilities", "Supplies", "Rent", "Maintenance", "Other"];
const RECURRENCE_OPTIONS = [
  { label: "One-time", value: "once" },
  { label: "Repeat daily", value: "daily" },
  { label: "Repeat weekly", value: "weekly" },
  { label: "Repeat monthly", value: "monthly" },
];

const RECURRENCE_LABELS = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
const recurrenceLabel = (r) => RECURRENCE_LABELS[String(r || "").toLowerCase()] || "Monthly";
const PAY_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "M-Pesa", value: "mpesa" },
  { label: "Bank Transfer", value: "bank_transfer" },
];

const STATUS_FILTERS = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
];

const EXPENSE_HEADERS = [
  { title: "Expense", key: "titleDisplay" },
  { title: "Category", key: "categoryDisplay" },
  { title: "Recurrence", key: "recurrenceDisplay" },
  { title: "Amount", key: "amountDisplay" },
  { title: "Date", key: "dateDisplay" },
  { title: "Method", key: "methodDisplay" },
  { title: "Status", key: "statusPill" },
  { title: "Action", key: "action" },
];

const SALARY_HEADERS = [
  { title: "Staff", key: "nameDisplay" },
  { title: "Role", key: "roleDisplay" },
  { title: "This Month", key: "amountDisplay" },
  { title: "Paid On", key: "dateDisplay" },
  { title: "Method", key: "methodDisplay" },
  { title: "Status", key: "statusPill" },
  { title: "Action", key: "action" },
];

const shortDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const monthKey = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonthLabel = () =>
  new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" });

const toPayout = (p) => ({
  id: p.id || p._id,
  businessId: p.businessId,
  kind: String(p.kind || "expense").toLowerCase(),
  title: p.title || "—",
  category: p.category || "—",
  amount: Number(p.amount) || 0,
  status: String(p.status || "pending").toLowerCase(),
  paymentMethod: p.paymentMethod ? String(p.paymentMethod).toLowerCase() : null,
  recipientId: p.recipientId || null,
  recipientName: p.recipientName || null,
  notes: p.notes || "",
  paidBy: p.paidBy || null,
  paidAt: p.paidAt || null,
  createdAt: p.createdAt,
  isRecurring: Boolean(p.isRecurring),
  recurrence: p.recurrence || null,
  dueAt: p.dueAt || null,
});

const toStaff = (u) => {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim()
    || u.name || u.username || "Staff";
  return {
    id: u.id || u._id,
    name,
    role: String(u.role || "Staff").replace(/[-_]/g, " "),
  };
};

export default function HotelExpenses() {
  const currentUser = useSelector((s) => s.auth?.value);
  const { primaryColor } = useTheme();
  const accent = primaryColor || "#4F46E5";

  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId ||
    currentUser?.associatedBusinessId || ""
  ).trim();

  const [activeTab, setActiveTab] = useState("expenses"); // expenses | salaries
  const [payouts, setPayouts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toaster, setToaster] = useState({ open: false, state: "true", title: "", message: "" });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableFilter, setTableFilter] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Add-expense modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState("Utilities");
  const [expAmount, setExpAmount] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [expRecurrence, setExpRecurrence] = useState("once"); // once | daily | weekly | monthly

  // Pay modal — one flow for pending expenses AND staff salaries
  const [payTarget, setPayTarget] = useState(null); // { type: "payout"|"salary", payout?, staff? }
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payNotes, setPayNotes] = useState("");
  const [paying, setPaying] = useState(false);

  // View modal
  const [viewItem, setViewItem] = useState(null); // { type, data, history? }

  const showToaster = useCallback((success, title, message) => {
    setToaster({ open: true, state: success ? "true" : "false", title, message });
  }, []);

  // ── Fetch payouts + staff ─────────────────────────────────────
  const fetchAll = useCallback(async (silent = false) => {
    if (!businessId) { setLoading(false); return; }
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [payRes, staffRes] = await Promise.all([
        GET(URLS.PAYOUTS.LIST_BY_BUSINESS.replace(":businessId", businessId)),
        GET(URLS.USERS.GET_USERS_BY_BUSINESS.replace(":businessId", businessId)),
      ]);
      if (payRes?.success) {
        setPayouts((payRes.data || payRes.payouts || []).map(toPayout));
      } else {
        throw new Error(payRes?.message || "Failed to load payouts");
      }
      const users = staffRes?.data || staffRes?.users || staffRes || [];
      setStaff(
        (Array.isArray(users) ? users : [])
          .filter((u) => !/super_admin|biztrack/i.test(String(u?.role || "")))
          .map(toStaff)
      );
    } catch (err) {
      showToaster(false, "Error", err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId, showToaster]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ───────────────────────────────────────────────────
  const expenses = useMemo(() => payouts.filter((p) => p.kind !== "salary"), [payouts]);
  const salaryPayouts = useMemo(
    () => payouts.filter((p) => p.kind === "salary" && p.status === "paid"),
    [payouts]
  );

  const paidThisMonth = useMemo(() => {
    const mk = monthKey();
    const map = {};
    salaryPayouts.forEach((p) => {
      if (monthKey(p.paidAt || p.createdAt) === mk && p.recipientId) {
        if (!map[p.recipientId]) map[p.recipientId] = p;
      }
    });
    return map;
  }, [salaryPayouts]);

  const lastPaidByStaff = useMemo(() => {
    const map = {};
    salaryPayouts.forEach((p) => {
      if (!p.recipientId) return;
      if (!map[p.recipientId] || new Date(p.paidAt || p.createdAt) > new Date(map[p.recipientId].paidAt || map[p.recipientId].createdAt)) {
        map[p.recipientId] = p;
      }
    });
    return map;
  }, [salaryPayouts]);

  const summary = useMemo(() => {
    const paidOut = payouts.filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);
    const pending = payouts.filter((p) => p.status === "pending");
    const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
    const staffPaid = Object.keys(paidThisMonth).length;
    return { paidOut, pendingTotal, pendingCount: pending.length, staffPaid, staffTotal: staff.length };
  }, [payouts, paidThisMonth, staff]);

  const applySearchStatus = (list, getText) => {
    let result = [...list];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((o) => getText(o).toLowerCase().includes(q));
    }
    if (tableFilter && selectedItems.length > 0) {
      result = result.filter((o) => selectedItems.includes(o._statusKey));
    }
    return result;
  };

  const filteredExpenses = useMemo(() => applySearchStatus(
    expenses.map((p) => ({ ...p, _statusKey: p.status })),
    (p) => `${p.title} ${p.category} ${p.recipientName || ""}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [expenses, searchTerm, tableFilter, selectedItems]);

  const filteredStaff = useMemo(() => {
    const rows = staff.map((m) => {
      const paid = paidThisMonth[m.id];
      const last = lastPaidByStaff[m.id];
      return { ...m, _paid: paid || null, _last: last || null, _statusKey: paid ? "paid" : "pending" };
    });
    return applySearchStatus(rows, (m) => `${m.name} ${m.role}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, paidThisMonth, lastPaidByStaff, searchTerm, tableFilter, selectedItems]);

  // ── Table rows ────────────────────────────────────────────────
  const expenseRows = filteredExpenses.map((p) => ({
    id: p.id,
    titleDisplay: <span className="font-semibold">{p.title}</span>,
    categoryDisplay: p.category || "—",
    recurrenceDisplay: p.isRecurring ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 whitespace-nowrap">
        <Repeat size={11} /> {recurrenceLabel(p.recurrence)}
      </span>
    ) : (
      <span className="text-xs text-gray-400">One-time</span>
    ),
    amountDisplay: <span className="font-semibold whitespace-nowrap">{formatKsh(p.amount)}</span>,
    dateDisplay: shortDate(p.paidAt || p.createdAt),
    methodDisplay: <PaymentChannelPill method={p.paymentMethod} />,
    statusPill: <TablePill state={p.status === "paid" ? "Paid" : "Pending"} />,
    availableActions: p.status === "pending" ? ["view", "pay"] : ["view"],
  }));

  const salaryRows = filteredStaff.map((m) => ({
    id: m.id,
    nameDisplay: <span className="font-semibold">{m.name}</span>,
    roleDisplay: m.role,
    amountDisplay: m._paid
      ? <span className="font-semibold whitespace-nowrap">{formatKsh(m._paid.amount)}</span>
      : <span className="text-gray-400">—</span>,
    dateDisplay: m._paid ? shortDate(m._paid.paidAt) : "—",
    methodDisplay: <PaymentChannelPill method={m._paid?.paymentMethod} />,
    statusPill: <TablePill state={m._paid ? "Paid" : "Pending"} />,
    availableActions: m._paid ? ["view"] : ["view", "pay"],
  }));

  const handleExpenseAction = (action, id) => {
    const payout = payouts.find((p) => p.id === id);
    if (!payout) return;
    if (String(action).toLowerCase() === "pay" && payout.status === "pending") {
      setPayTarget({ type: "payout", payout });
      setPayAmount(String(payout.amount));
      setPayMethod("cash");
      setPayNotes("");
    } else {
      setViewItem({ type: "payout", data: payout });
    }
  };

  const handleSalaryAction = (action, id) => {
    const member = staff.find((m) => m.id === id);
    if (!member) return;
    if (String(action).toLowerCase() === "pay" && !paidThisMonth[id]) {
      setPayTarget({ type: "salary", staff: member });
      setPayAmount(lastPaidByStaff[id] ? String(lastPaidByStaff[id].amount) : "");
      setPayMethod("cash");
      setPayNotes("");
    } else {
      setViewItem({
        type: "salary",
        data: member,
        history: salaryPayouts
          .filter((p) => p.recipientId === id)
          .sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt)),
      });
    }
  };

  // ── Add expense (logged as pending) ───────────────────────────
  const handleAddExpense = async () => {
    const amount = Number.parseFloat(expAmount) || 0;
    if (!expTitle.trim() || amount <= 0) {
      showToaster(false, "Missing details", "Enter an expense title and a valid amount.");
      return;
    }
    try {
      const res = await POST(URLS.PAYOUTS.CREATE_PAYOUT, {
        businessId,
        kind: "expense",
        title: expTitle.trim(),
        category: expCategory,
        amount,
        notes: expNotes.trim() || undefined,
        isRecurring: expRecurrence !== "once",
        recurrence: expRecurrence !== "once" ? expRecurrence : undefined,
      });
      if (res?.success) {
        showToaster(true, "Expense added", expRecurrence !== "once"
          ? `"${expTitle.trim()}" logged — it will repeat ${expRecurrence.toLowerCase()}.`
          : `"${expTitle.trim()}" logged — pay it when ready.`);
        setShowAddModal(false);
        setExpTitle(""); setExpCategory("Utilities"); setExpAmount(""); setExpNotes(""); setExpRecurrence("once");
        fetchAll(true);
      } else {
        throw new Error(res?.message || "Failed to add expense");
      }
    } catch (err) {
      showToaster(false, "Error", err.message || "Failed to add expense");
    }
  };

  // ── Pay once: pending expense OR staff salary, single endpoint ─
  const handleConfirmPay = async () => {
    if (!payTarget) return;
    const amount = Number.parseFloat(payAmount) || 0;
    if (amount <= 0) {
      showToaster(false, "Invalid amount", "Enter a valid amount greater than zero.");
      return;
    }
    setPaying(true);
    try {
      const body = payTarget.type === "payout"
        ? {
            businessId,
            payoutId: payTarget.payout.id,
            paymentMethod: payMethod,
            notes: payNotes.trim() || undefined,
          }
        : {
            businessId,
            kind: "salary",
            title: `Salary — ${currentMonthLabel()} — ${payTarget.staff.name}`,
            amount,
            paymentMethod: payMethod,
            recipientId: payTarget.staff.id,
            recipientName: payTarget.staff.name,
            notes: payNotes.trim() || undefined,
          };
      const res = await POST(URLS.PAYOUTS.PAY, body);
      if (res?.success) {
        showToaster(true, "Payment recorded",
          res.nextPayout
            ? `${formatKsh(amount)} paid — next month's bill logged automatically.`
            : `${formatKsh(amount)} paid via ${payMethod === "mpesa" ? "M-Pesa" : payMethod === "bank_transfer" ? "Bank Transfer" : "Cash"}.`);
        setPayTarget(null);
        fetchAll(true);
      } else {
        throw new Error(res?.message || "Payment failed");
      }
    } catch (err) {
      showToaster(false, "Payment failed", err.message || "Could not record payment");
    } finally {
      setPaying(false);
    }
  };

  const payTitle = payTarget?.type === "payout"
    ? payTarget.payout.title
    : payTarget?.staff ? `Salary — ${payTarget.staff.name}` : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading payouts..."
          loadedText=""
          color={accent}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: accent }}
          >
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Expenses & Payouts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Bills and staff salaries — paid once through a single endpoint
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "expenses" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: accent }}
            >
              <Plus size={16} /> Add Expense
            </button>
          )}
          <button
            onClick={() => fetchAll(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors bg-white"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Total Paid Out"
          value={formatKsh(summary.paidOut)}
          icon={Banknote}
          bgColor="bg-green-50"
          textColor="text-green-600"
          sub="Expenses + salaries paid"
        />
        <SummaryCard
          title="Pending Bills"
          value={formatKsh(summary.pendingTotal)}
          icon={Clock}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
          sub={`${summary.pendingCount} unpaid expense${summary.pendingCount !== 1 ? "s" : ""}`}
        />
        <SummaryCard
          title={`Staff Paid · ${currentMonthLabel()}`}
          value={`${summary.staffPaid} / ${summary.staffTotal}`}
          icon={Users}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          sub="Salaries settled this month"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="min-w-64">
            <SearchInput
              id="payout-search"
              placeholder={activeTab === "expenses" ? "Search expenses..." : "Search staff by name or role..."}
              input={searchTerm}
              handleInput={setSearchTerm}
              handleClear={() => setSearchTerm("")}
              error={false}
              disabled={false}
            />
          </div>
          <FilterInput
            color={accent}
            label="payout-status-filter"
            filters={STATUS_FILTERS}
            options={["Status"]}
            selected={selectedItems}
            selectedAction={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={setTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={() => setFilterAnchorEl(null)}
            handleClick={(e) => setFilterAnchorEl(e.currentTarget)}
          />
        </div>
      </div>

      {/* Tabs + table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200 gap-1 px-2">
          {[
            { key: "expenses", label: `Expenses (${expenses.length})` },
            { key: "salaries", label: `Staff Salaries (${staff.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "border-b-2 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={
                activeTab === t.key
                  ? { borderColor: accent, color: accent }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-2">
          {activeTab === "expenses" ? (
            <DataTable
              data={expenseRows}
              headers={EXPENSE_HEADERS}
              type="hotel-payouts"
              selected={[]}
              selectedAction={() => {}}
              selectAll={() => {}}
              all={false}
              actionSelected={handleExpenseAction}
              selectedRow={() => {}}
              clickable={false}
              color={accent}
            />
          ) : (
            <DataTable
              data={salaryRows}
              headers={SALARY_HEADERS}
              type="hotel-salaries"
              selected={[]}
              selectedAction={() => {}}
              selectAll={() => {}}
              all={false}
              actionSelected={handleSalaryAction}
              selectedRow={() => {}}
              clickable={false}
              color={accent}
            />
          )}
        </div>
      </div>

      {/* ── Add expense modal ── */}
      {showAddModal && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Add Expense">
          <div className="space-y-3 p-2">
            <TextInput
              id="exp-title"
              label="Expense title"
              placeholder="e.g. Electricity bill"
              input={expTitle}
              handleInput={(e) => setExpTitle(e.target.value)}
              error={false}
              disabled={false}
            />
            <SelectInput
              id="exp-category"
              label="Category"
              options={EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c }))}
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              required
            />
            <TextInput
              id="exp-amount"
              label="Amount (KSh)"
              placeholder="0"
              type="number"
              input={expAmount}
              handleInput={(e) => setExpAmount(e.target.value)}
              error={false}
              disabled={false}
            />
            <TextInput
              id="exp-notes"
              label="Notes (optional)"
              placeholder="Any details..."
              input={expNotes}
              handleInput={(e) => setExpNotes(e.target.value)}
              error={false}
              disabled={false}
            />
            <div>
              <SelectInput
                id="exp-recurrence"
                label="Repeat"
                options={RECURRENCE_OPTIONS}
                value={expRecurrence}
                onChange={(e) => setExpRecurrence(e.target.value)}
              />
              {expRecurrence !== "once" && (
                <p className="text-[11px] text-gray-400 -mt-2">
                  Paying auto-logs next {expRecurrence === "daily" ? "day" : expRecurrence === "weekly" ? "week" : "month"}'s bill.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 p-2 pt-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExpense}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              Save Expense
            </button>
          </div>
        </Modal>
      )}

      {/* ── Pay once modal (expense bill OR staff salary) ── */}
      {payTarget && (
        <Modal isOpen={true} onClose={() => !paying && setPayTarget(null)} title="Record Payment">
          <div className="space-y-3 p-2">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {payTarget.type === "payout" ? "Expense bill" : `Salary · ${currentMonthLabel()}`}
                </p>
                <p className="font-semibold text-gray-800 truncate">{payTitle}</p>
              </div>
              <p className="font-bold text-lg whitespace-nowrap ml-3" style={{ color: accent }}>
                {formatKsh(Number.parseFloat(payTarget.type === "payout" ? payTarget.payout.amount : payAmount) || 0)}
              </p>
            </div>
            {payTarget.type === "salary" && (
              <TextInput
                id="pay-amount"
                label="Amount to pay (KSh)"
                placeholder="0"
                type="number"
                input={payAmount}
                handleInput={(e) => setPayAmount(e.target.value)}
                error={false}
                disabled={paying}
              />
            )}
            <SelectInput
              id="pay-method"
              label="Payment method"
              options={PAY_METHODS}
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              required
              disabled={paying}
            />
            <TextInput
              id="pay-notes"
              label="Notes (optional)"
              placeholder="Reference, receipt no..."
              input={payNotes}
              handleInput={(e) => setPayNotes(e.target.value)}
              error={false}
              disabled={paying}
            />
          </div>
          <div className="flex gap-3 p-2 pt-3">
            <button
              onClick={() => setPayTarget(null)}
              disabled={paying}
              className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPay}
              disabled={paying}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {paying ? "Recording..." : "Confirm Payment"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── View details modal ── */}
      {viewItem && (
        <Modal
          isOpen={true}
          onClose={() => setViewItem(null)}
          title={viewItem.type === "payout" ? viewItem.data.title : viewItem.data.name}
        >
          <div className="space-y-2.5 p-2 text-sm">
            {viewItem.type === "payout" ? (
              <>
                <DetailRow label="Type" value="Expense" />
                <DetailRow label="Category" value={viewItem.data.category || "—"} />
                <DetailRow label="Amount" value={formatKsh(viewItem.data.amount)} bold />
                {viewItem.data.isRecurring && (
                  <DetailRow
                    label="Repeats"
                    value={`${recurrenceLabel(viewItem.data.recurrence)}${(() => {
                      const base = viewItem.data.status === "paid"
                        ? viewItem.data.paidAt
                        : viewItem.data.dueAt;
                      if (!base) return "";
                      const d = new Date(base);
                      if (viewItem.data.status === "paid") {
                        const r = String(viewItem.data.recurrence).toLowerCase();
                        if (r === "daily") d.setDate(d.getDate() + 1);
                        else if (r === "weekly") d.setDate(d.getDate() + 7);
                        else d.setMonth(d.getMonth() + 1);
                      }
                      return ` · ${viewItem.data.status === "paid" ? "next due" : "due"} ${shortDate(d.toISOString())}`;
                    })()}`}
                  />
                )}
                <DetailRow
                  label="Status"
                  value={<TablePill state={viewItem.data.status === "paid" ? "Paid" : "Pending"} />}
                />
                <DetailRow
                  label="Method"
                  value={<PaymentChannelPill method={viewItem.data.paymentMethod} />}
                />
                <DetailRow label="Logged" value={shortDate(viewItem.data.createdAt)} />
                {viewItem.data.paidAt && (
                  <DetailRow label="Paid on" value={shortDate(viewItem.data.paidAt)} />
                )}
                {viewItem.data.paidBy && (
                  <DetailRow label="Recorded by" value={viewItem.data.paidBy} />
                )}
                {viewItem.data.notes && (
                  <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {viewItem.data.notes}
                  </p>
                )}
              </>
            ) : (
              <>
                <DetailRow label="Role" value={viewItem.data.role} />
                <DetailRow
                  label={`${currentMonthLabel()}`}
                  value={
                    paidThisMonth[viewItem.data.id]
                      ? `${formatKsh(paidThisMonth[viewItem.data.id].amount)} · Paid`
                      : "Unpaid"
                  }
                  bold
                />
                {viewItem.history?.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">
                      Payment history
                    </p>
                    <div className="space-y-1.5">
                      {viewItem.history.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 pb-1.5">
                          <span className="text-gray-600">{shortDate(p.paidAt)}</span>
                          <span className="font-semibold">{formatKsh(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={() => setToaster((prev) => ({ ...prev, open: false }))}
        position="right"
      />
    </div>
  );
}

const DetailRow = ({ label, value, bold = false }) => (
  <div className="flex justify-between gap-3">
    <span className="text-gray-500">{label}</span>
    <span className={bold ? "font-bold text-gray-900 text-right" : "font-semibold text-gray-800 text-right"}>
      {value}
    </span>
  </div>
);
