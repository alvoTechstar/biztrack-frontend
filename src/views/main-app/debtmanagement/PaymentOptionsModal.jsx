import React from "react";
import { DollarSign, Smartphone, X } from "lucide-react";

const PaymentOptionsModal = ({
    showPaymentOptionsModal,
    setShowPaymentOptionsModal,
    selectedDebt,
    setSelectedDebt,
    setShowCashPaymentModal,
    setShowMpesaPaymentModal,
    actionLoading,
    formatCurrency
}) => {
    if (!showPaymentOptionsModal || !selectedDebt) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Complete Payment
                    </h3>
                    <button
                        onClick={() => {
                            setShowPaymentOptionsModal(false);
                            setSelectedDebt(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={actionLoading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">
                    Select payment method to complete debt payment for{" "}
                    <strong>{selectedDebt.customerName}</strong>
                </p>

                <p className="text-sm text-gray-500 mb-6">
                    Amount to pay: <strong>{formatCurrency(selectedDebt.amount)}</strong>
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            setShowPaymentOptionsModal(false);
                            setShowCashPaymentModal(true);
                        }}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DollarSign className="h-5 w-5" />
                        Pay with Cash
                    </button>

                    <button
                        onClick={() => {
                            setShowPaymentOptionsModal(false);
                            setShowMpesaPaymentModal(true);
                        }}
                        disabled={actionLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Smartphone className="h-5 w-5" />
                        Pay with M-PESA
                    </button>
                </div>

                {/* <button
                    onClick={() => {
                        setShowPaymentOptionsModal(false);
                        setSelectedDebt(null);
                    }}
                    disabled={actionLoading}
                    className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button> */}
            </div>
        </div>
    );
};

export default PaymentOptionsModal;