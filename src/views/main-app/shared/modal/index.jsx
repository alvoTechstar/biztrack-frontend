import React from 'react';
import  { useState } from "react";
import PaymentMethodModal from "../../../components/modal/PaymentMethodModal";
import PaymentInputModal from "../../../components/modal/PaymentInputModal";
import TransactionForm from './TransactionForm';

const App = () => {
    const [showInputModal, setShowInputModal] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
  
    return (
      <div className="p-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => setShowInputModal(true)}
        >
          Pay With Card
        </button>
  
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowMethodModal(true)}
        >
          Choose Payment Method
        </button>
  
        {/* Payment Input Modal */}
        <PaymentInputModal open={showInputModal} onClose={() => setShowInputModal(false)} />
  
        {/* Payment Method Modal */}
        <PaymentMethodModal open={showMethodModal} onClose={() => setShowMethodModal(false)} />

            <div>
                <TransactionForm />
            </div>
      </div>

    );
  };
  
  export default App;
  