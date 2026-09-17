import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import TransactionDetails from "./TransactionDetails";

const REPORTS_PATH = "/shopkeeper/reports";

export default function TransactionDetailsPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor } = useTheme();

  // Navigating here from the reports tables passes the transaction directly via
  // router state, so the page renders instantly with no fetch. A direct visit or
  // refresh has no state, so it falls back to fetching by transactionId.
  const [transaction, setTransaction] = useState(location.state?.transaction || null);
  const [loading, setLoading] = useState(!location.state?.transaction);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transaction) return;

    let cancelled = false;

    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = URLS.TRANSACTIONS.GET_TRANSACTION_BY_ID.replace(':transactionId', transactionId);
        const result = await GET(endpoint);

        if (cancelled) return;

        if (result?.success && result.transaction) {
          setTransaction(result.transaction);
        } else {
          setError(result?.message || "Transaction not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load transaction");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTransaction();

    return () => {
      cancelled = true;
    };
  }, [transactionId, transaction]);

  const isDebtTransaction =
    (transaction?.paymentMethod || '').toLowerCase() === 'debt' ||
    (transaction?.originalPaymentMethod || '').toLowerCase() === 'debt';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading transaction..."
          loadedText=""
          color={primaryColor}
        />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Transaction Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            {error || "We couldn't find that transaction."}
          </p>
          <button
            onClick={() => navigate(REPORTS_PATH)}
            className="text-white px-5 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8 max-w-4xl">
        <button
          onClick={() => navigate(REPORTS_PATH)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Transactions
        </button>

        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-base font-bold text-gray-900">
            {isDebtTransaction ? "Debt Transaction Details" : "Transaction Details"}
          </h1>
          <p className="text-xs text-gray-400">
            {transaction.transactionId || transaction._id || transaction.id}
          </p>
        </div>

        <TransactionDetails transaction={transaction} />
      </div>
    </div>
  );
}
