import React from "react";
import { DollarSign, Smartphone } from "lucide-react";

const PaymentOptionsModal = ({
    selectedDebt,
    setShowPaymentOptionsModal,
    setShowCashPaymentModal,
    setShowMpesaPaymentModal,
    actionLoading,
    formatCurrency
}) => {
    if (!selectedDebt) return null;

    const handleCashPayment = () => {
        setShowPaymentOptionsModal(false);
        setShowMpesaPaymentModal(false);
        setShowCashPaymentModal(true);
    };

    const handleMpesaPayment = () => {
        setShowPaymentOptionsModal(false);
        setShowCashPaymentModal(false);
        setShowMpesaPaymentModal(true);
    };

    return (
        <div>
            <p className="text-gray-600 mb-4">
                Select payment method to complete debt payment for{" "}
                <strong>{selectedDebt.customerName}</strong>
            </p>

            <p className="text-sm text-gray-500 mb-6">
                Amount to pay: <strong>{formatCurrency(selectedDebt.amount || selectedDebt.totalAmount || 0)}</strong>
            </p>

            <div className="space-y-3">
                <button
                    onClick={handleCashPayment}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DollarSign className="h-5 w-5" />
                    Pay with Cash
                </button>

                <button
                    onClick={handleMpesaPayment}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Smartphone className="h-5 w-5" />
                    Pay with M-PESA
                </button>
            </div>
        </div>
    );
};

export default PaymentOptionsModal;
