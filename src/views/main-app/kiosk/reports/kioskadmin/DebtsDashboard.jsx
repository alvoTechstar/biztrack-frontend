// kiosk-admin/DebtsDashboard.jsx
import React, { useState, useMemo } from "react";
import { Download } from "lucide-react";
import DebtDataTable from "../../debtmanagement/DebtDataTable";

const DebtsDashboard = ({
  debtData,
  loading,
  totalOutstanding,
  totalRecovered,
  totalDebt,
  formatCurrency,
  LoadingOverlay,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  RechartsTooltip,
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Eye,
  Users
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");

  // Convert debtData to tableData format for DebtDataTable
  const tableData = useMemo(() => {
    return debtData.map((debt, index) => {
      const isPaid = debt.status === "Completed" || debt.status === "completed";
      
      let statusText = debt.status;
      if (isPaid) {
        statusText = "Recovered";
      } else if (debt.days > 30) {
        statusText = "Overdue";
      }

      return {
        id: debt.transactionId || `debt-${index}`,
        createdDate: debt.date || "N/A",
        transactionId: debt.transactionId?.slice(-8) || `DBT${1000 + index}`,
        customerName: debt.customer,
        customerPhone: debt.phone || "N/A",
        amount: formatCurrency(debt.amount),
        expectedPaymentDate: debt.date || "N/A",
        datePaid: isPaid ? debt.date : "Not Paid",
        paymentMethod: debt.paymentMethod || "Debt",
        status: statusText,
        action: "view",
        originalData: debt
      };
    });
  }, [debtData, formatCurrency]);

  const handleRowSelect = (event, row) => {
    console.log("Row selected:", row.originalData);
    // You can add your detail modal logic here
  };

  const handleActionSelected = (action, id) => {
    const debt = debtData.find(d => d.transactionId === id || d.id === id);
    if (!debt) return;

    console.log("Action selected:", action, "for debt:", debt);
    
    if (action === 'view') {
      // Open detail modal
      console.log("View debt details:", debt);
    } else if (action === 'pay') {
      // Open payment modal
      console.log("Pay debt:", debt);
    }
  };

  const handleExport = () => {
    // Export logic here
    const dataStr = JSON.stringify(debtData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debts_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table headers matching your DebtDataTable
  const tableHeaders = [
    { key: "createdDate", title: "Created Date" },
    { key: "transactionId", title: "Transaction Id" },
    { key: "customerName", title: "Customer Name" },
    { key: "customerPhone", title: "Phone Number" },
    { key: "amount", title: "Amount" },
    { key: "expectedPaymentDate", title: "Due Date" },
    { key: "datePaid", title: "Paid Date" },
    { key: "paymentMethod", title: "Payment Method" },
    { key: "status", title: "Status" },
    { key: "action", title: "Actions" },
  ];

  // Table actions
  const tableActions = ['pay', 'view'];

  return (
    <div className="space-y-8">
      {/* Debt Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative">
          {loading && <LoadingOverlay />}
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle size={24} />
            <span className="text-sm opacity-90">Outstanding</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalOutstanding)}</h3>
          <p className="text-sm opacity-90">Total amount pending</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">From {debtData.filter(d => d.status !== 'Completed').length} customers</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative">
          {loading && <LoadingOverlay />}
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={24} />
            <span className="text-sm opacity-90">Recovered</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalRecovered)}</h3>
          <p className="text-sm opacity-90">Successfully collected</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">
              {totalDebt > 0 ? `${((totalRecovered / totalDebt) * 100).toFixed(1)}% recovery rate` : 'No debt'}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg relative">
          {loading && <LoadingOverlay />}
          <div className="flex items-center justify-between mb-4">
            <CreditCard size={24} />
            <span className="text-sm opacity-90">Total Debt</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalDebt)}</h3>
          <p className="text-sm opacity-90">Overall debt portfolio</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">{debtData.length} total records</div>
          </div>
        </div>
      </div>

      {/* Debt Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
          {loading && <LoadingOverlay />}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Debt Distribution</h3>
              <p className="text-sm text-gray-600">By status and amount</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Send Reminders
            </button>
          </div>
          <div className="h-80">
            {debtData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="20%" 
                  outerRadius="90%" 
                  data={debtData.slice(0, 6).map(d => ({ 
                    name: d.customer, 
                    amount: d.amount,
                    fill: d.status === 'Completed' ? '#10B981' : d.status === 'Overdue' ? '#EF4444' : '#F59E0B' 
                  }))}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar 
                    minAngle={15} 
                    label={{ position: 'insideStart', fill: '#fff' }} 
                    background 
                    clockWise 
                    dataKey="amount" 
                  />
                  <Legend />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No debt data available
              </div>
            )}
          </div>
        </div>

        {/* Debt Status Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
          {loading && <LoadingOverlay />}
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Debt Status</h3>
          <div className="space-y-4">
            {['Pending', 'Completed', 'Overdue'].map((status) => {
              const filteredDebts = debtData.filter(d => d.status === status);
              const count = filteredDebts.length;
              const amount = filteredDebts.reduce((sum, d) => sum + d.amount, 0);
              
              return (
                <div key={status} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{status}</span>
                    <span className={`px-2 py-1 ${
                      status === 'Completed' ? 'bg-green-100 text-green-800' :
                      status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    } text-xs rounded-full`}>
                      {count} customers
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{formatCurrency(amount)}</p>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          status === 'Completed' ? 'bg-green-500' :
                          status === 'Overdue' ? 'bg-red-500' :
                          'bg-yellow-500'
                        } rounded-full`}
                        style={{ width: `${(amount / Math.max(totalDebt, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Debt Table using your DebtDataTable component */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
        {loading && <LoadingOverlay />}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Debt Details</h3>
              <p className="text-sm text-gray-600">Manage and track customer debts</p>
            </div>
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all"
            >
              <Download size={18} />
              Export List
            </button>
          </div>
          
          {/* Search filter input for the table */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search customers or transaction IDs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            {tableData.length > 0 ? (
              <DebtDataTable
                type="debts"
                clickable={true}
                color="#3B82F6" // Blue color matching your theme
                data={tableData}
                headers={tableHeaders}
                actions={tableActions}
                selected={selectedRows}
                selectedAction={setSelectedRows}
                selectedRow={handleRowSelect}
                actionSelected={handleActionSelected}
                selectAll={setSelectedRows} // Simplified, adjust as needed
                searchFilter={searchFilter}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Debt Records</h3>
                <p className="text-gray-600">No debt records available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtsDashboard;