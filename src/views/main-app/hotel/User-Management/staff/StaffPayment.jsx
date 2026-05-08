import React, { useState, useEffect } from "react";
import StaffPaymentTable from "./StaffPaymentTable";

const StaffPayment = () => {
  // Mock staff data with Kenyan Shillings
  const [staffData, setStaffData] = useState([
    {
      id: 1,
      name: "John Mwangi",
      role: "Manager",
      salary: 75000,
      status: "Paid",
      paymentDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Wanjiku",
      role: "Receptionist",
      salary: 45000,
      status: "Unpaid",
      paymentDate: null,
    },
    {
      id: 3,
      name: "Mike Ochieng",
      role: "Housekeeper",
      salary: 35000,
      status: "Paid",
      paymentDate: "2024-01-15",
    },
    {
      id: 4,
      name: "Emma Nyong",
      role: "Chef",
      salary: 60000,
      status: "Unpaid",
      paymentDate: null,
    },
    {
      id: 5,
      name: "David Kiprop",
      role: "Security",
      salary: 40000,
      status: "Paid",
      paymentDate: "2024-01-15",
    },
    {
      id: 6,
      name: "Grace Akinyi",
      role: "Cleaner",
      salary: 32000,
      status: "Unpaid",
      paymentDate: null,
    },
    {
      id: 7,
      name: "Robert Kamau",
      role: "Maintenance",
      salary: 48000,
      status: "Paid",
      paymentDate: "2024-01-15",
    },
    {
      id: 8,
      name: "Jennifer Wambui",
      role: "Front Desk",
      salary: 42000,
      status: "Unpaid",
      paymentDate: null,
    },
  ]);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredStaff, setFilteredStaff] = useState(staffData);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Filter staff based on search and status
  useEffect(() => {
    let filtered = staffData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((staff) => staff.status === statusFilter);
    }

    setFilteredStaff(filtered);
  }, [searchTerm, statusFilter, staffData]);

  // Calculate summary data
  const totalStaff = staffData.length;
  const totalPaidAmount = staffData
    .filter((staff) => staff.status === "Paid")
    .reduce((sum, staff) => sum + staff.salary, 0);
  const totalUnpaidAmount = staffData
    .filter((staff) => staff.status === "Unpaid")
    .reduce((sum, staff) => sum + staff.salary, 0);

  // Handle payment modal
  const handlePayNowClick = (staff) => {
    setSelectedStaff(staff);
    setAmountPaid(staff.salary.toString());
    setPaymentModalOpen(true);
  };

  const handleCloseModal = () => {
    setPaymentModalOpen(false);
    setSelectedStaff(null);
    setPaymentMethod("");
    setAmountPaid("");
    setPaymentNotes("");
  };

  const handleConfirmPayment = () => {
    if (selectedStaff && paymentMethod && amountPaid) {
      const updatedStaff = staffData.map((staff) =>
        staff.id === selectedStaff.id
          ? {
              ...staff,
              status: "Paid",
              paymentDate: new Date().toISOString().split("T")[0],
            }
          : staff
      );
      setStaffData(updatedStaff);

      // Show success message
      alert(
        `Payment of KSh ${parseInt(amountPaid).toLocaleString()} for ${
          selectedStaff.name
        } has been processed successfully via ${paymentMethod}.`
      );

      handleCloseModal();
    }
  };

  const handleViewClick = (staff) => {
    alert(
      `Payment Details for ${
        staff.name
      }:\n\nSalary: KSh ${staff.salary.toLocaleString()}\nStatus: ${
        staff.status
      }\nPayment Date: ${staff.paymentDate}\nRole: ${staff.role}`
    );
  };

  const handlePrintClick = (staff) => {
    // Simulate printing receipt
    const receipt = `
HOTEL PAYMENT RECEIPT
=====================
Staff Name: ${staff.name}
Role: ${staff.role}
Salary: KSh ${staff.salary.toLocaleString()}
Payment Date: ${staff.paymentDate}
Status: ${staff.status}
=====================
    `;
    console.log(receipt);
    alert(`Payment receipt for ${staff.name} has been sent to printer.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Staff Payment Management
          </h1>
          <p className="text-slate-600 text-lg">
            Manage and track staff salary payments
          </p>
        </div>

        {/* Summary Cards - First */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Total Staff
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {totalStaff}
                </p>
                <p className="text-slate-600 text-sm mt-1">Active employees</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Total Paid
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  KSh {totalPaidAmount.toLocaleString()}
                </p>
                <p className="text-slate-600 text-sm mt-1">
                  Completed payments
                </p>
              </div>
              <div className="bg-emerald-100 p-4 rounded-2xl">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Total Unpaid
                </p>
                <p className="text-3xl font-bold text-amber-600">
                  KSh {totalUnpaidAmount.toLocaleString()}
                </p>
                <p className="text-slate-600 text-sm mt-1">Pending payments</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-2xl">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section - After Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search staff by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full lg:w-64 px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 transition-all duration-200"
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid Only</option>
                <option value="Unpaid">Unpaid Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table - Professional Styling */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <StaffPaymentTable
              staffData={filteredStaff}
              handlePayNowClick={handlePayNowClick}
              handleViewClick={handleViewClick}
              handlePrintClick={handlePrintClick}
            />
          </div>
        </div>

        {/* Payment Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-96 overflow-y-auto shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Process Payment
                </h2>
                <p className="text-slate-600">
                  Complete salary payment for staff member
                </p>
              </div>

              {selectedStaff && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {selectedStaff.name}
                        </h3>
                        <p className="text-slate-600 mb-2">
                          {selectedStaff.role}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          KSh {selectedStaff.salary.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedStaff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Amount to Pay
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-semibold">
                          KSh
                        </span>
                      </div>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full pl-16 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-semibold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Notes (Optional)
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-700"
                      rows="3"
                      placeholder="Add any notes about this payment..."
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={!paymentMethod || !amountPaid}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPayment;
