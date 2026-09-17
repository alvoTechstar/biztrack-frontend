import React from "react";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "../../../../../utilities/Sharedfunctions.jsx";

// Row and badge language modeled on quickteller-ea's transaction-details screen:
// label and value share the same dark text color (hierarchy comes from weight,
// not color), each row is a flat label-left/value-right line with a hairline
// divider, and status pills use a small 4px radius rather than a full pill.
const DetailRow = ({ label, value, valueClassName = "" }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-800">{label}</span>
    <span className={`text-sm font-bold text-gray-900 text-right ${valueClassName}`}>
      {value || value === 0 ? value : "N/A"}
    </span>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded border border-gray-100 ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="px-5 py-4 border-b border-gray-100">{children}</div>
);

const CardBody = ({ children }) => <div className="px-5">{children}</div>;

const BADGE_TONES = {
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-500",
  yellow: "bg-amber-50 text-amber-700",
  grey: "bg-gray-100 text-gray-700",
  blue: "bg-blue-50 text-blue-600",
};

const StatusBadge = ({ tone = "grey", text }) => (
  <span
    className={`inline-flex items-center justify-center rounded px-3 py-1 text-xs font-semibold whitespace-nowrap ${BADGE_TONES[tone] || BADGE_TONES.grey}`}
  >
    {text}
  </span>
);

const TransactionDetails = ({ transaction }) => {
  if (!transaction) return null;

  const transactionDate = transaction.timestamp || transaction.createdAt || new Date();
  const transactionTime = new Date(transactionDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const formattedDate = new Date(transactionDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDebtTransaction = (transaction.paymentMethod || '').toLowerCase() === 'debt' ||
    (transaction.originalPaymentMethod || '').toLowerCase() === 'debt';
  const wasDebtPaid = transaction.debtPaid || (isDebtTransaction && (transaction.status || '').toLowerCase() === "completed");

  const calculateItemTotal = (item) => {
    const quantity = item.quantity || 1;
    const price = item.price || item.unitPrice || item.product?.price || 0;
    return quantity * price;
  };
  const calculateItemsTotal = () => {
    if (!transaction.items || !Array.isArray(transaction.items)) return 0;
    return transaction.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };
  const formatQuantityWithUnit = (quantity, unit) => {
    const formattedQuantity = Number(quantity).toFixed(2).replace(/\.?0+$/, '');
    return `${formattedQuantity} ${unit || 'units'}`;
  };

  const totalAmount = transaction.total || transaction.totalAmount || calculateItemsTotal();

  const statusTone = (() => {
    switch ((transaction.status || '').toLowerCase()) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'grey';
    }
  })();

  const paymentMethodLabel = (() => {
    switch ((transaction.paymentMethod || '').toLowerCase()) {
      case 'cash': return 'Cash';
      case 'mpesa':
      case 'm-pesa': return 'M-PESA';
      case 'debt': return 'Debt';
      default: return transaction.paymentMethod || 'N/A';
    }
  })();

  return (
    <div className="space-y-5">
      {/* Summary card - amount and status take the place quickteller-ea gives its
          top DetailCard header, remaining fields as label/value rows below */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
            <StatusBadge tone={statusTone} text={transaction.status || "Unknown"} />
            {isDebtTransaction && (
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold bg-red-50 text-red-500">
                DEBT
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <DetailRow label="Transaction ID" value={transaction.transactionId || transaction._id || transaction.id} />
          <DetailRow label="Date" value={formattedDate} />
          <DetailRow label="Time" value={transactionTime} />
          <DetailRow label="Payment Method" value={paymentMethodLabel} />
          {transaction.shopkeeperName && (
            <DetailRow label="Shopkeeper" value={transaction.shopkeeperName} />
          )}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-5">
        {/* Debt information */}
        {isDebtTransaction && (
          <Card className={`flex-1 min-w-[280px] ${wasDebtPaid ? 'border-emerald-100' : 'border-red-100'}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className={`h-4 w-4 ${wasDebtPaid ? 'text-emerald-600' : 'text-red-500'}`} />
                <span className={`text-sm font-bold ${wasDebtPaid ? 'text-emerald-700' : 'text-red-600'}`}>
                  {wasDebtPaid ? 'Debt Recovered' : 'Outstanding Debt'}
                </span>
              </div>
            </CardHeader>
            <CardBody>
              {transaction.expectedPaymentDate && (
                <DetailRow label="Expected Payment Date" value={formatDate(transaction.expectedPaymentDate)} />
              )}
              {wasDebtPaid && transaction.datePaid && (
                <DetailRow label="Date Paid" value={formatDate(transaction.datePaid)} />
              )}
              {wasDebtPaid && transaction.debtPaymentMethod && (
                <DetailRow label="Payment Method Used" value={transaction.debtPaymentMethod} valueClassName="capitalize" />
              )}
            </CardBody>
          </Card>
        )}

        {/* Customer information */}
        {(transaction.customerName || transaction.phone || transaction.customerPhone) && (
          <Card className="flex-1 min-w-[280px]">
            <CardHeader>
              <span className="text-sm font-bold text-gray-900">Customer Information</span>
            </CardHeader>
            <CardBody>
              {transaction.customerName && (
                <DetailRow label="Customer Name" value={transaction.customerName} />
              )}
              {(transaction.phone || transaction.customerPhone) && (
                <DetailRow label="Phone Number" value={transaction.phone || transaction.customerPhone} />
              )}
            </CardBody>
          </Card>
        )}

        {/* Cash payment details */}
        {(transaction.paymentMethod || '').toLowerCase() === "cash" && (
          <Card className="flex-1 min-w-[280px]">
            <CardHeader>
              <span className="text-sm font-bold text-gray-900">Cash Payment Details</span>
            </CardHeader>
            <CardBody>
              <DetailRow label="Amount Paid" value={formatCurrency(transaction.amountPaid || transaction.total || 0)} />
              <DetailRow label="Change Given" value={formatCurrency(transaction.change || 0)} />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Items purchased */}
      {transaction.items && transaction.items.length > 0 && (
        <Card>
          <CardHeader>
            <span className="text-sm font-bold text-gray-900">
              Items Purchased ({transaction.items.length})
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500">Item</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-gray-500">Qty</th>
                  <th className="text-right py-3 px-5 text-xs font-medium text-gray-500">Unit Price</th>
                  <th className="text-right py-3 px-5 text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item, index) => {
                  const itemName = item.productName || item.name || item.product?.productName || "Unknown Product";
                  const quantity = item.quantity || 1;
                  const unit = item.unit || 'units';
                  const unitPrice = item.price || item.unitPrice || item.product?.price || 0;
                  const itemTotal = quantity * unitPrice;

                  return (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3 px-5 text-gray-900">{itemName}</td>
                      <td className="py-3 px-5 text-gray-700 font-medium">
                        {formatQuantityWithUnit(quantity, unit)}
                      </td>
                      <td className="py-3 px-5 text-gray-700 text-right">
                        <div>{formatCurrency(unitPrice)}</div>
                        <div className="text-xs text-gray-400">per {unit}</div>
                      </td>
                      <td className="py-3 px-5 font-bold text-gray-900 text-right">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan="3" className="py-3 px-5 text-sm font-bold text-gray-900 text-right">
                    Total Amount:
                  </td>
                  <td className="py-3 px-5 text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Notes */}
      {transaction.notes && (
        <Card>
          <CardHeader>
            <span className="text-sm font-bold text-gray-900">Notes</span>
          </CardHeader>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-700">{transaction.notes}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetails;
