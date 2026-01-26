import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CreditCard } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "../../../../../utilities/SharedFunctions";

const TransactionDetailsModal = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

  // Safe date handling
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

  const expectedPaymentDate = transaction.expectedPaymentDate
    ? new Date(transaction.expectedPaymentDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const isDebtTransaction = transaction.paymentMethod === "Debt" || transaction.originalPaymentMethod === "Debt";
  const wasDebtPaid = transaction.debtPaid || (isDebtTransaction && transaction.status === "Completed");

  // Calculate totals for verification
  const calculateItemTotal = (item) => {
    const quantity = item.quantity || 1;
    const price = item.price || item.unitPrice || item.product?.price || 0;
    return quantity * price;
  };

  const calculateItemsTotal = () => {
    if (!transaction.items || !Array.isArray(transaction.items)) return 0;
    return transaction.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <div>
          <Typography variant="h6">
            {isDebtTransaction ? "Debt Transaction Details" : "Transaction Details"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {transaction.transactionId || transaction._id || transaction.id || "N/A"}
          </Typography>
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Date & Time
              </Typography>
              <Typography variant="body1">
                {formattedDate} at {transactionTime}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <StatusBadge status={transaction.status} />
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Payment Method
              </Typography>
              <div className="flex items-center gap-2">
                <StatusBadge status={transaction.paymentMethod} type="payment" />
                {isDebtTransaction && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Debt
                  </span>
                )}
              </div>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Total Amount
              </Typography>
              <Typography variant="h6" className="font-bold">
                {formatCurrency(transaction.total || calculateItemsTotal())}
              </Typography>
            </div>
          </div>

          {/* Debt Information Box */}
          {isDebtTransaction && (
            <div className={`mb-4 p-4 rounded-lg ${wasDebtPaid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className={`h-5 w-5 ${wasDebtPaid ? 'text-green-600' : 'text-red-600'}`} />
                <Typography variant="subtitle1" className={`font-semibold ${wasDebtPaid ? 'text-green-800' : 'text-red-800'}`}>
                  {wasDebtPaid ? '✓ Debt Recovered' : '⚠ Outstanding Debt'}
                </Typography>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {transaction.expectedPaymentDate && (
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Expected Payment Date
                    </Typography>
                    <Typography variant="body1">
                      {expectedPaymentDate}
                    </Typography>
                  </div>
                )}
                
                {wasDebtPaid && transaction.datePaid && (
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Date Paid
                    </Typography>
                    <Typography variant="body1">
                      {new Date(transaction.datePaid).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </div>
                )}
                
                {!wasDebtPaid && transaction.status === "Pending" && transaction.expectedPaymentDate && (
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Days Remaining
                    </Typography>
                    <Typography variant="body1" className={Math.ceil((new Date(transaction.expectedPaymentDate) - new Date()) / (1000 * 60 * 60 * 24)) < 0 ? 'text-red-600 font-semibold' : ''}>
                      {Math.ceil((new Date(transaction.expectedPaymentDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </Typography>
                  </div>
                )}
                
                {wasDebtPaid && transaction.debtPaymentMethod && (
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Payment Method Used
                    </Typography>
                    <Typography variant="body1">
                      {transaction.debtPaymentMethod}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}

          {(transaction.customerName || transaction.phone || transaction.customerPhone) && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Typography variant="subtitle1" className="font-semibold mb-2">
                Customer Information
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                {transaction.customerName && (
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Customer Name
                    </Typography>
                    <Typography variant="body1">
                      {transaction.customerName}
                    </Typography>
                  </div>
                )}
                {(transaction.phone || transaction.customerPhone) && (
                  <div>
                    <Typography variant="subtitle2" color="textSecondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {transaction.phone || transaction.customerPhone}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Items Purchased ({transaction.items?.length || 0})
            </Typography>
            
            {(!transaction.items || transaction.items.length === 0) ? (
              <div className="text-center py-4 text-gray-500">
                No items in this transaction
              </div>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" className="font-semibold">Item Name</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" className="font-semibold">Quantity</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" className="font-semibold">Unit Price</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" className="font-semibold">Total Price</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaction.items.map((item, index) => {
                    const itemName = item.productName || item.product?.productName || "Unknown Product";
                    const quantity = item.quantity || 1;
                    const unitPrice = item.price || item.unitPrice || item.product?.price || 0;
                    const totalPrice = quantity * unitPrice;

                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" className="font-medium">
                            {itemName}
                          </Typography>
                          {item.product?.code && (
                            <Typography variant="caption" color="textSecondary">
                              Code: {item.product.code}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(unitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" className="font-semibold">
                            {formatCurrency(totalPrice)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Subtotal Row */}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="body1" className="font-semibold">
                        Subtotal:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" className="font-semibold">
                        {formatCurrency(calculateItemsTotal())}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  {/* Tax Row (if applicable) */}
                  {transaction.taxAmount && transaction.taxAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="body1">
                          Tax ({transaction.taxRate || 0}%):
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1">
                          {formatCurrency(transaction.taxAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Total Row */}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="body1" className="font-semibold text-lg">
                        Total:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" className="font-semibold text-lg">
                        {formatCurrency(transaction.total || calculateItemsTotal() + (transaction.taxAmount || 0))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>

          {transaction.paymentMethod === "Cash" && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <Typography variant="subtitle2" color="textSecondary">
                Cash Payment Details
              </Typography>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount Paid
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(transaction.amountPaid || transaction.total)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Change Given
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(transaction.change || 0)}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {transaction.notes && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <Typography variant="subtitle2" color="textSecondary">
                Additional Notes
              </Typography>
              <Typography variant="body2">{transaction.notes}</Typography>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;