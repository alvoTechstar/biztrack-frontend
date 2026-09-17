import React, { useState, useMemo, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { RefreshCw, AlertTriangle, TrendingUp, CreditCard } from "lucide-react";
import { GET, POST } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";
import Toaster from "../../../../components/Toaster";
import Modal from "../../../../components/modal/Modal";
import CashPaymentModal from "../sales/CashPaymentModal";
import MpesaPaymentModal from "../sales/MpesaPaymentModal";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../components/theme/ThemeContext";
import DebtSummaryCards from "./DebtSummaryCards";
import DebtControls from "./DebtControls";
import DebtDetailModal from "./DebtDetailModal";
import PaymentOptionsModal from "./PaymentOptionsModal";
import DebtDataTable from "./DebtDataTable";
import { useSelector } from "react-redux";
import { formatCurrency, formatDate } from "../../../../utilities/Sharedfunctions.jsx";

dayjs.extend(customParseFormat);

const DebtManagement = () => {
  const { primaryColor } = useTheme();
  const currentUser = useSelector((state) => state.auth?.value);

  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading debts...");
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showMpesaPaymentModal, setShowMpesaPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");

  const [operationLoading, setOperationLoading] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [pendingMpesaTransactionId, setPendingMpesaTransactionId] = useState(null);

  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  const [businessInfo, setBusinessInfo] = useState({
    businessId: null,
    businessUUID: null,
    businessName: null,
    shopkeeperInfo: null
  });

  useEffect(() => {
    if (currentUser) {
      const userBusinessId = currentUser.businessId || currentUser.businessID;
      const userBusinessUUID = currentUser.businessUUID;
      const userBusinessName = currentUser.businessName;

      const shopkeeperInfo = {
        shopkeeperId: currentUser.id,
        shopkeeperName: `${currentUser.firstName} ${currentUser.lastName}`,
        shopkeeperEmail: currentUser.email || "",
        shopkeeperRole: currentUser.role || "Kiosk_Shopkeeper",
        businessId: userBusinessId,
        businessUUID: userBusinessUUID,
        businessName: userBusinessName
      };

      if (userBusinessId) {
        setBusinessInfo({
          businessId: userBusinessId,
          businessUUID: userBusinessUUID,
          businessName: userBusinessName,
          shopkeeperInfo
        });
      }
    }
  }, [currentUser]);

  const showNotification = useCallback((message, type = "success") => {
    const title = type === "success" ? "Success!" : type === "error" ? "Error!" : "Heads Up!";
    const stateValue = type === "success" ? "true" : type === "error" ? "false" : "";

    setNotification({ open: true, title, message, type: stateValue });
    setTimeout(() => setNotification((prev) => ({ ...prev, open: false })), 3000);
  }, []);

  const isOverdue = useCallback((expectedDate, status) => {
    if (status === "Completed" || status === "completed" || status === "paid") return false;
    if (!expectedDate) return false;
    const today = new Date();
    const expected = new Date(expectedDate);
    return expected < today;
  }, []);

  const openDetailModal = useCallback((debt) => {
    setSelectedDebt(debt);
    setShowDetailModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedDebt(null);
  }, []);

  const closePaymentOptionsModal = useCallback(() => {
    setShowPaymentOptionsModal(false);
    setSelectedDebt(null);
  }, []);

  const generatePaymentReport = useCallback(() => {
    const paidDebts = debts.filter(debt => debt.debtPaid === true);
    const pendingDebts = debts.filter(debt => debt.debtPaid !== true);

    const totalDebtAmount = debts.reduce((sum, debt) => sum + (debt.totalAmount || debt.amount || 0), 0);
    const totalCollected = paidDebts.reduce((sum, debt) => sum + (debt.totalAmount || debt.amount || 0), 0);
    const recoveryRate = totalDebtAmount > 0 ? ((totalCollected / totalDebtAmount) * 100).toFixed(1) : 0;

    const report = {
      generatedDate: new Date().toISOString(),
      summary: {
        totalDebts: debts.length,
        totalDebtAmount: totalDebtAmount,
        recoveredAmount: totalCollected,
        pendingAmount: pendingDebts.reduce((sum, d) => sum + (d.totalAmount || d.amount || 0), 0),
        recoveryRate: `${recoveryRate}%`
      },
      paidDebts: paidDebts.map(debt => ({
        customer: debt.customerName,
        amount: debt.totalAmount || debt.amount || 0,
        paymentMethod: debt.debtPaymentMethod || 'Unknown',
        datePaid: debt.debtPaymentDate || debt.paidAt || debt.datePaid,
        originalTransaction: debt.transactionId
      })),
      pendingDebts: pendingDebts.map(debt => ({
        customer: debt.customerName,
        amount: debt.totalAmount || debt.amount || 0,
        dueDate: debt.dueDate || debt.expectedPaymentDate,
        overdue: isOverdue(debt.dueDate || debt.expectedPaymentDate, debt.status)
      }))
    };

    showNotification(`Payment report generated. Recovered: ${formatCurrency(totalCollected)}`, "info");
    return report;
  }, [debts, isOverdue, showNotification]);

  const fetchDebts = useCallback(async () => {
    if (!businessInfo.businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadingText("Loading debt transactions...");
    setError(null);

    try {
      // includeResolved=true — the backend excludes paid-off debts by default, but this
      // page needs the full history so recovered debts still show (status filter, summary cards).
      const endpoint = `${URLS.TRANSACTIONS.GET_DEBTS_BY_BUSINESS.replace(':businessId', businessInfo.businessId)}?includeResolved=true`;
      const response = await GET(endpoint);

      if (response.success) {
        const debtTransactions = response.data || [];

        const transformedDebts = debtTransactions.map(transaction => {
          const amount = transaction.totalAmount || 0;
          const isPaid = transaction.status === 'completed' && transaction.paymentStatus === 'paid' && transaction.debtPaid === true;

          const createdAt = transaction.timestamp || transaction.createdAt;
          let dueDate = transaction.dueDate || transaction.expectedPaymentDate;
          if (!dueDate && createdAt) {
            const createdDate = new Date(createdAt);
            createdDate.setDate(createdDate.getDate() + 7);
            dueDate = createdDate.toISOString();
          }

          return {
            id: transaction.id,   // Prisma UUID primary key
            _id: transaction.id,  // kept for any legacy references
            transactionId: transaction.transactionId,
            customerName: transaction.customerName || "Unknown Customer",
            customerPhone: transaction.customerPhone || "N/A",
            amount: amount,
            totalAmount: amount,
            status: transaction.status || 'pending',
            paymentStatus: transaction.paymentStatus || 'pending',
            paymentMethod: transaction.paymentMethod,
            originalPaymentMethod: transaction.originalPaymentMethod || transaction.paymentMethod,
            createdDate: createdAt,
            timestamp: createdAt,
            dueDate: dueDate,
            expectedPaymentDate: dueDate,
            datePaid: transaction.datePaid || transaction.paidAt,
            paidAt: transaction.paidAt || transaction.datePaid,
            notes: transaction.notes || `Debt transaction for ${transaction.customerName || 'customer'}`,
            items: transaction.items || [],
            businessId: transaction.businessId,
            businessUUID: transaction.businessUUID,
            isDebtTransaction: true,
            debtPaid: isPaid,
            debtPaymentMethod: transaction.debtPaymentMethod,
            debtPaymentDate: transaction.debtPaymentDate || transaction.datePaid || transaction.paidAt,
            shopkeeperId: transaction.shopkeeperId,
            shopkeeperName: transaction.shopkeeperName,
            checkoutRequestId: transaction.checkoutRequestId,
            merchantRequestId: transaction.merchantRequestId
          };
        });

        setDebts(transformedDebts);
      } else {
        const errorMsg = response.message || 'Failed to fetch transactions';
        setError(errorMsg);
        showNotification(errorMsg, "error");
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to load debt transactions';
      setError(errorMsg);
      showNotification("Failed to load debt transactions. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [businessInfo.businessId, showNotification]);

  useEffect(() => {
    if (businessInfo.businessId) {
      fetchDebts();
    }
  }, [businessInfo.businessId, fetchDebts]);

  const filteredDebts = useMemo(() => {
    return debts.filter(debt => {
      const matchesSearch =
        debt.customerName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        debt.transactionId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        debt.customerPhone?.includes(searchFilter);

      const debtIsOverdue = !debt.debtPaid && isOverdue(debt.dueDate || debt.expectedPaymentDate, debt.status);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Pending" && !debt.debtPaid) ||
        (statusFilter === "Completed" && debt.debtPaid === true) ||
        (statusFilter === "Overdue" && debtIsOverdue);

      const matchesDate = (() => {
        if (!dateRange.startDate || !dateRange.endDate) return true;
        const created = dayjs(debt.createdDate || debt.timestamp);
        if (!created.isValid()) return false;
        const start = dayjs(dateRange.startDate, 'DD-MM-YYYY').startOf('day');
        const end = dayjs(dateRange.endDate, 'DD-MM-YYYY').endOf('day');
        return !created.isBefore(start) && !created.isAfter(end);
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [debts, searchFilter, statusFilter, dateRange, isOverdue]);

  const summary = useMemo(() => {
    const pending = debts.filter(debt => !debt.debtPaid);
    const completed = debts.filter(debt => debt.debtPaid === true);
    const overdue = pending.filter(debt => isOverdue(debt.dueDate || debt.expectedPaymentDate, debt.status));

    const totalDebtAmount = debts.reduce((sum, debt) => sum + (debt.totalAmount || debt.amount || 0), 0);
    const totalCollected = completed.reduce((sum, debt) => sum + (debt.totalAmount || debt.amount || 0), 0);
    const recoveryRate = totalDebtAmount > 0 ? (totalCollected / totalDebtAmount) * 100 : 0;

    return {
      totalPending: pending.reduce((sum, debt) => sum + (debt.totalAmount || debt.amount || 0), 0),
      totalCollected: totalCollected,
      totalOverdue: overdue.reduce((sum, debt) => sum + (debt.totalAmount || debt.amount || 0), 0),
      pendingCount: pending.length,
      completedCount: completed.length,
      overdueCount: overdue.length,
      totalDebts: debts.length,
      totalDebtAmount: totalDebtAmount,
      recoveryRate: recoveryRate.toFixed(1)
    };
  }, [debts, isOverdue]);

  const handleCashPayment = useCallback(async () => {
    if (!selectedDebt || !businessInfo.businessId) return;
    if (operationLoading) return;

    setOperationLoading(true);

    try {
      const now = new Date().toISOString();
      const debtAmount = selectedDebt.amount || selectedDebt.totalAmount || 0;
      const paidAmount = parseFloat(amountPaid);
      const change = paidAmount - debtAmount;

      const paymentData = {
        paymentMethod: 'cash',
        amountPaid: debtAmount,
        notes: `Cash repayment. Received: KSh ${paidAmount}, Change: KSh ${change > 0 ? change : 0}`
      };

      const updateEndpoint = URLS.TRANSACTIONS.REPAY_DEBT.replace(':id', selectedDebt.id);
      const response = await POST(updateEndpoint, paymentData);

      if (response && response.success) {
        setDebts(prevDebts =>
          prevDebts.map(debt =>
            debt.id === selectedDebt.id
              ? {
                  ...debt,
                  status: 'completed',
                  paymentStatus: 'paid',
                  paymentMethod: 'cash',
                  datePaid: now,
                  paidAt: now,
                  paymentDetails: paymentData.paymentDetails,
                  debtPaid: true,
                  debtPaymentMethod: 'cash',
                  debtPaymentDate: now,
                  amountPaid: debtAmount
                }
              : debt
          )
        );

        return {
          success: true,
          transactionId: selectedDebt.transactionId || selectedDebt._id,
          receiptNumber: `CASH-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`,
          customerName: selectedDebt.customerName,
          amount: debtAmount,
          paidAmount: paidAmount,
          change: change
        };
      } else {
        throw new Error(response?.message || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      showNotification(`Payment failed: ${error.message || 'Unknown error'}`, "error");
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [selectedDebt, businessInfo, amountPaid, operationLoading, showNotification]);

  const handleMpesaPayment = useCallback(async () => {
    if (!selectedDebt || !businessInfo.businessId) return;
    if (operationLoading) return;

    try {
      const debtAmount = selectedDebt.amount || selectedDebt.totalAmount || 0;
      const phone = mpesaPhone.trim();

      let formattedPhone = phone;
      if (phone.startsWith('+')) formattedPhone = phone.substring(1);
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
        formattedPhone = '254' + formattedPhone;
      }

      setPendingMpesaTransactionId(selectedDebt.transactionId);

      const repayEndpoint = URLS.TRANSACTIONS.REPAY_DEBT.replace(':id', selectedDebt.id);
      const mpesaResponse = await POST(repayEndpoint, {
        paymentMethod: 'mpesa',
        phone: formattedPhone,
        amountPaid: debtAmount,
      });

      if (mpesaResponse.success) {
        return {
          success: true,
          transactionId: selectedDebt.transactionId,
          data: {
            transactionId: selectedDebt.transactionId,
            checkoutRequestId: mpesaResponse.data?.checkoutRequestId,
            customerMessage: mpesaResponse.data?.customerMessage
          }
        };
      } else {
        throw new Error(mpesaResponse.message || "M-PESA request failed");
      }
    } catch (error) {
      console.error("M-PESA payment error:", error);
      throw error;
    }
  }, [selectedDebt, businessInfo, mpesaPhone, operationLoading]);

  const handleMpesaPaymentComplete = useCallback(async (paymentResult) => {
    if (!selectedDebt) return;
    if (paymentResult.isDebtPayment !== true) return;

    setOperationLoading(true);

    try {
      const now = new Date().toISOString();
      const debtAmount = selectedDebt.amount || selectedDebt.totalAmount || 0;

      setDebts(prevDebts =>
        prevDebts.map(debt =>
          debt.id === selectedDebt.id
            ? {
                ...debt,
                status: 'completed',
                paymentStatus: 'paid',
                paymentMethod: 'mpesa',
                datePaid: now,
                paidAt: now,
                debtPaid: true,
                debtPaymentMethod: 'mpesa',
                debtPaymentDate: now,
                amountPaid: debtAmount,
                mpesaReceipt: paymentResult.receipt,
                mpesaReceiptNumber: paymentResult.receipt
              }
            : debt
        )
      );

      return {
        success: true,
        closeAllModals: true
      };
    } catch (error) {
      console.error('M-PESA payment completion error:', error);
      showNotification(`Payment processing error: ${error.message}`, "error");
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [selectedDebt, showNotification]);

  const handleCashPaymentComplete = useCallback(async (paymentResult) => {
    if (!selectedDebt) return;
    if (paymentResult.isDebtPayment !== true) return;

    setOperationLoading(true);

    try {
      const now = new Date().toISOString();
      const debtAmount = selectedDebt.amount || selectedDebt.totalAmount || 0;

      setDebts(prevDebts =>
        prevDebts.map(debt =>
          debt.id === selectedDebt.id
            ? {
                ...debt,
                status: 'completed',
                paymentStatus: 'paid',
                paymentMethod: 'cash',
                datePaid: now,
                paidAt: now,
                debtPaid: true,
                debtPaymentMethod: 'cash',
                debtPaymentDate: now,
                amountPaid: debtAmount,
                cashReceipt: paymentResult.receipt,
                paymentDetails: {
                  type: 'cash',
                  amountReceived: paymentResult.paidAmount,
                  amountDue: debtAmount,
                  changeGiven: paymentResult.change,
                  paymentDate: now
                }
              }
            : debt
        )
      );

      return {
        success: true,
        closeAllModals: true
      };
    } catch (error) {
      console.error('Cash payment completion error:', error);
      showNotification(`Payment processing error: ${error.message}`, "error");
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [selectedDebt, showNotification]);

  const handleMpesaModalClose = useCallback((completed) => {
    setShowMpesaPaymentModal(false);

    if (completed === true) {
      setSelectedDebt(null);
      setShowPaymentOptionsModal(false);
      setShowCashPaymentModal(false);
      setShowDetailModal(false);

      setMpesaPhone("");
      setAmountPaid("");
      setCurrentTransaction(null);
      setPendingMpesaTransactionId(null);

      fetchDebts();
    } else {
      setCurrentTransaction(null);
      setMpesaPhone("");
      setPendingMpesaTransactionId(null);

      showNotification("M-PESA payment was not completed. You can try again.", "info");
    }
  }, [fetchDebts, showNotification]);

  const handleMpesaTransactionCreated = useCallback((transactionInfo) => {
    setCurrentTransaction({
      transactionId: transactionInfo.transactionId,
      checkoutRequestId: transactionInfo.checkoutRequestId,
      phone: transactionInfo.phone,
      amount: transactionInfo.amount
    });
  }, []);

  const handleCashModalClose = useCallback((completed) => {
    setShowCashPaymentModal(false);

    if (completed === true) {
      setSelectedDebt(null);
      setShowPaymentOptionsModal(false);
      setShowDetailModal(false);
      setShowMpesaPaymentModal(false);

      setAmountPaid("");
      setMpesaPhone("");
      setCurrentTransaction(null);
      setPendingMpesaTransactionId(null);

      fetchDebts();
    } else {
      setAmountPaid("");
      showNotification("Cash payment was cancelled.", "info");
    }
  }, [fetchDebts, showNotification]);

  const validatePhoneNumber = useCallback((phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      return { isValid: false, message: 'Phone number too short' };
    }
    if (!/^(07|01|2547|2541|7|1)/.test(cleaned)) {
      return { isValid: false, message: 'Invalid Kenyan number format' };
    }
    return { isValid: true, message: 'Valid phone number' };
  }, []);

  const handleRowSelect = (event, row) => {
    openDetailModal(row.originalData);
  };

  const handleActionSelected = async (action, id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    if (action === 'view') {
      openDetailModal(debt);
    } else if (action === 'pay') {
      if (debt.debtPaid === true) {
        showNotification("This debt has already been paid", "info");
        return;
      }

      setMpesaPhone("");
      setAmountPaid("");
      setCurrentTransaction(null);
      setPendingMpesaTransactionId(null);
      setShowCashPaymentModal(false);
      setShowMpesaPaymentModal(false);

      setSelectedDebt(debt);
      setShowPaymentOptionsModal(true);
    }
  };

  const tableData = useMemo(() => {
    return filteredDebts.map(debt => {
      const isPaid = debt.debtPaid === true;
      const isCurrentlyOverdue = isOverdue(debt.dueDate || debt.expectedPaymentDate, debt.status) && !isPaid;

      let statusText = "";
      if (isPaid) {
        statusText = "Recovered";
      } else if (isCurrentlyOverdue) {
        statusText = "Overdue";
      } else {
        statusText = "Pending";
      }

      let paymentMethodText = "Debt";
      if (isPaid && debt.debtPaymentMethod) {
        paymentMethodText = debt.debtPaymentMethod;
      } else if (debt.paymentMethod && debt.paymentMethod !== 'debt') {
        paymentMethodText = debt.paymentMethod;
      }

      return {
        id: debt.id,
        transactionId: debt.transactionId,
        customerName: debt.customerName,
        customerPhone: debt.customerPhone,
        amount: formatCurrency(debt.totalAmount || debt.amount || 0),
        status: statusText,
        paymentMethod: paymentMethodText,
        createdDate: formatDate(debt.createdDate || debt.timestamp),
        expectedPaymentDate: formatDate(debt.dueDate || debt.expectedPaymentDate),
        datePaid: isPaid ? formatDate(debt.debtPaymentDate || debt.datePaid || debt.paidAt) : "Not Paid",
        isPaid: isPaid,
        items: debt.items || [],
        originalData: debt,
        availableActions: isPaid ? ['view'] : ['view', 'pay']
      };
    });
  }, [filteredDebts, isOverdue]);

  if (loading && debts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText={loadingText}
          loadedText=""
          color={primaryColor}
        />
      </div>
    );
  }

  if (!businessInfo.businessId && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">Business Not Available</div>
          <div className="text-gray-600 mb-6">Unable to load debts. Your account is not associated with any business.</div>
          <button
            onClick={() => window.location.reload()}
            className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                Debt Management
              </h1>
              {businessInfo.businessName && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{businessInfo.businessName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generatePaymentReport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <TrendingUp size={16} />
              Report
            </button>
            <button
              onClick={fetchDebts}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <DebtSummaryCards summary={summary} formatCurrency={formatCurrency} />
        </div>

        <div className="mb-6">
          <DebtControls
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>

        {debts.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <CreditCard size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Debt Transactions</h3>
            <p className="text-gray-500">No debt transactions recorded yet.</p>
          </div>
        ) : (
          <DebtDataTable
            tableData={tableData}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            handleRowSelect={handleRowSelect}
            handleActionSelected={handleActionSelected}
            setSelectAll={setSelectAll}
            searchFilter={searchFilter}
          />
        )}
      </div>

      {showDetailModal && selectedDebt && (
        <Modal isOpen={showDetailModal} onClose={closeDetailModal} title="Debt Details">
          <DebtDetailModal
            selectedDebt={selectedDebt}
            setShowDetailModal={setShowDetailModal}
            setShowPaymentOptionsModal={setShowPaymentOptionsModal}
            actionLoading={operationLoading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            isOverdue={isOverdue}
          />
        </Modal>
      )}

      {showPaymentOptionsModal && selectedDebt && (
        <Modal isOpen={showPaymentOptionsModal} onClose={closePaymentOptionsModal} title="Complete Payment">
          <PaymentOptionsModal
            selectedDebt={selectedDebt}
            setShowPaymentOptionsModal={setShowPaymentOptionsModal}
            setShowCashPaymentModal={setShowCashPaymentModal}
            setShowMpesaPaymentModal={setShowMpesaPaymentModal}
            actionLoading={operationLoading}
            formatCurrency={formatCurrency}
          />
        </Modal>
      )}

      {showCashPaymentModal && (
        <CashPaymentModal
          isOpen={showCashPaymentModal}
          onClose={handleCashModalClose}
          totalAmount={selectedDebt?.amount || selectedDebt?.totalAmount || 0}
          amountPaid={amountPaid}
          onAmountPaidChange={setAmountPaid}
          onConfirmPayment={handleCashPayment}
          formatCurrency={formatCurrency}
          submitting={operationLoading}
          shopkeeperName={businessInfo.shopkeeperInfo?.shopkeeperName}
          isDebtPayment={true}
          onPaymentComplete={handleCashPaymentComplete}
          successModalCustomMessage={`Cash debt payment of ${formatCurrency(selectedDebt?.amount || selectedDebt?.totalAmount || 0)} recovered from ${selectedDebt?.customerName || 'customer'}.`}
          successModalConfirmButtonText="Go to Debt Management"
          successModalCountdownMessage="Returning to Debt Management in:"
          failureModalRetryButtonText="Retry Debt Payment"
          failureModalBackButtonText="Back to Debt Management"
          failureModalCountdownMessage="Returning to debt payment modal in:"
        />
      )}

      {showMpesaPaymentModal && (
        <MpesaPaymentModal
          isOpen={showMpesaPaymentModal}
          onClose={handleMpesaModalClose}
          totalAmount={selectedDebt?.amount || selectedDebt?.totalAmount || 0}
          mpesaPhone={mpesaPhone}
          onMpesaPhoneChange={setMpesaPhone}
          onConfirmPayment={handleMpesaPayment}
          formatCurrency={formatCurrency}
          shopkeeperName={businessInfo.shopkeeperInfo?.shopkeeperName}
          validatePhone={validatePhoneNumber}
          onPaymentComplete={handleMpesaPaymentComplete}
          onTransactionCreated={handleMpesaTransactionCreated}
          transactionId={pendingMpesaTransactionId || selectedDebt?.transactionId}
          isDebtPayment={true}
          successModalCustomMessage={`M-PESA debt payment of ${formatCurrency(selectedDebt?.amount || selectedDebt?.totalAmount || 0)} recovered from ${selectedDebt?.customerName || 'customer'}.`}
        />
      )}

      <Toaster
        open={notification.open}
        state={notification.type}
        title={notification.title}
        message={notification.message}
        action={() => setNotification((prev) => ({ ...prev, open: false }))}
        position="right"
      />
    </div>
  );
};

export default DebtManagement;
