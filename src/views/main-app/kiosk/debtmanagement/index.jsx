import React, { useState, useMemo, useCallback, useEffect } from "react";
import { RefreshCw, AlertTriangle, TrendingUp, CreditCard, CheckCircle } from "lucide-react";
import { GET, POST } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";
import Toaster from "../../../../components/Toaster";
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

const DebtManagement = () => {
  const { primaryColor } = useTheme();
  const currentUser = useSelector((state) => state.auth?.value);

  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading debts...");
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showMpesaPaymentModal, setShowMpesaPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");

  const [modalLoading, setModalLoading] = useState(false);
  const [modalLoadingText, setModalLoadingText] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationLoadingText, setOperationLoadingText] = useState("");

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

  const [debtPaymentSuccessModal, setDebtPaymentSuccessModal] = useState(false);
  const [debtPaymentFailureModal, setDebtPaymentFailureModal] = useState(false);
  const [isSalesPageRefreshing, setIsSalesPageRefreshing] = useState(false);

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

  useEffect(() => {
    if (showMpesaPaymentModal === false && showPaymentOptionsModal === false &&
      showCashPaymentModal === false && showDetailModal === false &&
      selectedDebt === null) {
      console.log('✅ All modals closed - back to debt table');
    }
  }, [showMpesaPaymentModal, showPaymentOptionsModal, showCashPaymentModal,
    showDetailModal, selectedDebt]);

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

  const openModalWithLoader = async (modalType, debt = null) => {
    setModalLoading(true);
    switch (modalType) {
      case 'detail':
        setModalLoadingText("Loading debt details...");
        break;
      case 'payment':
        setModalLoadingText("Loading payment options...");
        break;
      default:
        setModalLoadingText("Loading...");
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    if (debt) setSelectedDebt(debt);
    setModalLoading(false);
    switch (modalType) {
      case 'detail':
        setShowDetailModal(true);
        break;
      case 'payment':
        setShowPaymentOptionsModal(true);
        break;
    }
  };

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
  }, [debts, formatCurrency, isOverdue, showNotification]);

  const fetchDebts = useCallback(async () => {
    if (!businessInfo.businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadingText("Loading debt transactions...");
    setError(null);

    try {
      const endpoint = URLS.TRANSACTIONS.GET_DEBTS_BY_BUSINESS.replace(':businessId', businessInfo.businessId);
      const response = await GET(endpoint);

      if (response.success) {
        const debtTransactions = response.debts || [];

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

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Pending" && !debt.debtPaid) ||
        (statusFilter === "Completed" && debt.debtPaid === true);

      return matchesSearch && matchesStatus;
    });
  }, [debts, searchFilter, statusFilter]);

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
    setOperationLoadingText("Processing cash payment...");

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
        // Update local state
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

        // Return success object for the modal
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
      console.error('❌ Cash payment error:', error);
      showNotification(`Payment failed: ${error.message || 'Unknown error'}`, "error");
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [selectedDebt, businessInfo, amountPaid, operationLoading, formatCurrency, showNotification, fetchDebts]);

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

      console.log('📱 Processing M-PESA debt repayment:', {
        debtId: selectedDebt.id,
        transactionId: selectedDebt.transactionId,
        amount: debtAmount,
        phone: formattedPhone,
        customer: selectedDebt.customerName,
      });

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
      console.error("❌ M-PESA payment error:", error);
      throw error;
    }
  }, [selectedDebt, businessInfo, mpesaPhone, operationLoading]);

  // ✅ ADD THIS BACK - handleMpesaPaymentComplete was missing!
  const handleMpesaPaymentComplete = useCallback(async (paymentResult) => {
    if (!selectedDebt) return;

    if (paymentResult.isDebtPayment !== true) {
      console.warn('⚠️ Received non-debt payment in DebtManagement - ignoring');
      return;
    }

    setOperationLoading(true);
    setOperationLoadingText("Finalizing M-PESA payment...");

    try {
      const now = new Date().toISOString();
      const debtAmount = selectedDebt.amount || selectedDebt.totalAmount || 0;

      console.log('💰 M-PESA debt payment successful via callback:', {
        debtId: selectedDebt._id,
        amount: debtAmount,
        receipt: paymentResult.receipt,
        transactionId: paymentResult.transactionId
      });

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

      console.log('✅ M-PESA debt payment completed successfully');

      return {
        success: true,
        closeAllModals: true
      };
    } catch (error) {
      console.error('❌ M-PESA payment completion error:', error);
      showNotification(`Payment processing error: ${error.message}`, "error");
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [selectedDebt, showNotification, formatCurrency]);

  const handleCashPaymentComplete = useCallback(async (paymentResult) => {
    if (!selectedDebt) return;

    if (paymentResult.isDebtPayment !== true) {
      console.warn('⚠️ Received non-debt payment in DebtManagement - ignoring');
      return;
    }

    setOperationLoading(true);
    setOperationLoadingText("Finalizing cash payment...");

    try {
      const now = new Date().toISOString();
      const debtAmount = selectedDebt.amount || selectedDebt.totalAmount || 0;

      console.log('💰 Cash debt payment successful:', {
        debtId: selectedDebt._id,
        amount: debtAmount,
        receipt: paymentResult.receipt,
        transactionId: paymentResult.transactionId,
        change: paymentResult.change
      });

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

      console.log('✅ Cash debt payment completed successfully');

      return {
        success: true,
        closeAllModals: true
      };
    } catch (error) {
      console.error('❌ Cash payment completion error:', error);
      showNotification(`Payment processing error: ${error.message}`, "error");
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [selectedDebt, showNotification, formatCurrency]);

  const handleMpesaModalClose = useCallback((completed) => {
    console.log('🔄 M-PESA modal closed in DebtManagement, completed:', completed);

    setShowMpesaPaymentModal(false);

    if (completed === true) {
      console.log('✅ Debt payment successful - CLOSING ALL MODALS and clearing state');

      setSelectedDebt(null);
      setShowPaymentOptionsModal(false);
      setShowCashPaymentModal(false);
      setShowDetailModal(false);

      setMpesaPhone("");
      setAmountPaid("");
      setCurrentTransaction(null);
      setPendingMpesaTransactionId(null);

      setTimeout(() => {
        fetchDebts();
      }, 500);
    } else {
      console.log('❌ Payment not completed - keeping debt selected for retry');
      setCurrentTransaction(null);
      setMpesaPhone("");
      setPendingMpesaTransactionId(null);

      showNotification("M-PESA payment was not completed. You can try again.", "info");
    }
  }, [fetchDebts, showNotification]);

  const handleMpesaTransactionCreated = useCallback((transactionInfo) => {
    console.log('📝 M-PESA transaction created:', transactionInfo);
    setCurrentTransaction({
      transactionId: transactionInfo.transactionId,
      checkoutRequestId: transactionInfo.checkoutRequestId,
      phone: transactionInfo.phone,
      amount: transactionInfo.amount
    });
  }, []);

  const handleCashModalClose = useCallback((completed) => {
    console.log('🔄 Cash modal closed in DebtManagement, completed:', completed);

    setShowCashPaymentModal(false);

    if (completed === true) {
      console.log('✅ Cash debt payment successful - CLOSING ALL MODALS and clearing state');

      setSelectedDebt(null);
      setShowPaymentOptionsModal(false);
      setShowDetailModal(false);
      setShowMpesaPaymentModal(false);

      setAmountPaid("");
      setMpesaPhone("");
      setCurrentTransaction(null);
      setPendingMpesaTransactionId(null);

      setTimeout(() => {
        fetchDebts();
      }, 500);
    } else {
      console.log('❌ Cash payment not completed - keeping debt selected for retry');
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
    openModalWithLoader('detail', row.originalData);
  };

  const handleActionSelected = async (action, id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    if (action === 'view') {
      openModalWithLoader('detail', debt);
    } else if (action === 'pay') {
      if (debt.debtPaid === true) {
        showNotification("This debt has already been paid", "info");
        return;
      }

      if (!debt.debtPaid) {
        setMpesaPhone("");
        setAmountPaid("");
        setCurrentTransaction(null);
        setPendingMpesaTransactionId(null);
        setShowCashPaymentModal(false);
        setShowMpesaPaymentModal(false);

        openModalWithLoader('payment', debt);
      } else {
        showNotification("This debt is already paid", "info");
      }
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
  }, [filteredDebts, formatCurrency, formatDate, isOverdue]);

  if (operationLoading || modalLoading) {
    return (
      <div className="min-h-screen bg-white p-2 sm:p-3 md:p-4">
        <div className="max-w-full mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={operationLoadingText || modalLoadingText}
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && debts.length === 0) {
    return (
      <div className="min-h-screen bg-white p-2 sm:p-3 md:p-4">
        <div className="max-w-full mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={loadingText}
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!businessInfo.businessId && !loading) {
    return (
      <div className="min-h-screen bg-white p-2 sm:p-3 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-sm sm:text-base font-bold text-gray-700 mb-1">Business Not Available</h2>
          <p className="text-gray-600 mb-2 text-xs sm:text-sm">Unable to load debts.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isAnyModalOpen = showDetailModal || showPaymentOptionsModal ||
    showCashPaymentModal || showMpesaPaymentModal;

  if (isAnyModalOpen && !operationLoading && !modalLoading) {
    return (
      <div className="min-h-screen bg-white p-1 sm:p-2 md:p-3 flex items-center justify-center">
        <div className="w-full max-w-full mx-auto flex flex-col items-center justify-center">
          {showDetailModal && (
            <div className="w-full max-w-full md:max-w-4xl">
              <DebtDetailModal
                showDetailModal={showDetailModal}
                setShowDetailModal={setShowDetailModal}
                selectedDebt={selectedDebt}
                setSelectedDebt={setSelectedDebt}
                setShowPaymentOptionsModal={setShowPaymentOptionsModal}
                actionLoading={operationLoading}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                isOverdue={isOverdue}
              />
            </div>
          )}

          {showPaymentOptionsModal && (
            <div className="w-full max-w-full sm:max-w-md">
              <PaymentOptionsModal
                showPaymentOptionsModal={showPaymentOptionsModal}
                setShowPaymentOptionsModal={setShowPaymentOptionsModal}
                selectedDebt={selectedDebt}
                setSelectedDebt={setSelectedDebt}
                setShowCashPaymentModal={setShowCashPaymentModal}
                setShowMpesaPaymentModal={setShowMpesaPaymentModal}
                actionLoading={operationLoading}
                formatCurrency={formatCurrency}
              />
            </div>
          )}

          {showCashPaymentModal && (
            <div className="w-full max-w-full sm:max-w-md">
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
            </div>
          )}

          {showMpesaPaymentModal && (
            <div className="w-full max-w-full sm:max-w-md">
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
            </div>
          )}
        </div>

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
  }

  return (
    <div className="min-h-screen bg-white p-1 sm:p-2 md:p-3 lg:p-4">
      <div className="max-w-full mx-auto">
        <div className="mb-1 sm:mb-2 md:mb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5">
                Debt Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Track and manage customer debts
              </p>
              {businessInfo.businessName && (
                <p className="text-gray-500 text-xs mt-0.5">
                  Business: {businessInfo.businessName}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={generatePaymentReport}
                className="flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs sm:text-sm"
              >
                <TrendingUp className="h-3 w-3" />
                <span className="hidden xs:inline">Report</span>
              </button>
              <button
                onClick={fetchDebts}
                disabled={loading}
                className="flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <DebtSummaryCards
          summary={summary}
          formatCurrency={formatCurrency}
          debts={debts}
        />

        <div className="mb-2 sm:mb-3">
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5">
            <div className="bg-blue-50 border border-blue-200 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="bg-blue-100 p-1 rounded">
                  <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] xs:text-xs font-medium text-blue-700 truncate">Total Debt</p>
                  <p className="text-sm sm:text-base font-bold text-blue-900">{debts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="bg-green-100 p-1 rounded">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] xs:text-xs font-medium text-green-700 truncate">Recovered</p>
                  <p className="text-sm sm:text-base font-bold text-green-900">{summary.completedCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="bg-yellow-100 p-1 rounded">
                  <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] xs:text-xs font-medium text-yellow-700 truncate">Pending</p>
                  <p className="text-sm sm:text-base font-bold text-yellow-900">{summary.pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-1.5 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="bg-red-100 p-1 rounded">
                  <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] xs:text-xs font-medium text-red-700 truncate">Overdue</p>
                  <p className="text-sm sm:text-base font-bold text-red-900">{summary.overdueCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DebtControls
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-1.5 mb-2">
            <div className="flex items-center gap-1 text-red-800">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">{error}</span>
            </div>
          </div>
        )}

        {debts.length === 0 && !loading ? (
          <div className="text-center py-3 sm:py-4 bg-gray-50 rounded border border-gray-200 px-2 mt-2">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mx-auto mb-1.5" />
            <h3 className="text-sm font-medium text-gray-700 mb-1">No Debt Transactions</h3>
            <p className="text-gray-500 text-xs">
              No debt transactions recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <DebtDataTable
              tableData={tableData}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              handleRowSelect={handleRowSelect}
              handleActionSelected={handleActionSelected}
              setSelectAll={setSelectAll}
              searchFilter={searchFilter}
            />
          </div>
        )}
      </div>

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