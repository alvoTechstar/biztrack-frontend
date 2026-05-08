import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const HospitalAdminDashboard = () => {
  // Mock data
  const metrics = {
    totalPatients: 1200,
    totalStaff: 75,
    appointments: 300,
    revenue: "Ksh 1,200,000"
  };

  const appointmentsData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Appointments',
        data: [50, 80, 70, 90, 110],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const revenueData = {
    labels: ['Consultations', 'Lab', 'Pharmacy', 'Other'],
    datasets: [
      {
        label: 'Revenue (Ksh)',
        data: [500000, 300000, 250000, 150000],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 3,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: Ksh ${context.parsed.toLocaleString()}`;
          }
        }
      }
    }
  };

  const MetricCard = ({ title, value, icon: Icon, bgColor, iconColor, textColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Activity className="text-blue-600 mr-3" size={32} />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Hospital Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time overview of hospital operations and performance
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Patients"
            value={metrics.totalPatients.toLocaleString()}
            icon={Users}
            bgColor="bg-white"
            iconColor="bg-blue-500"
            textColor="text-blue-600"
          />
          <MetricCard
            title="Total Staff"
            value={metrics.totalStaff}
            icon={UserCheck}
            bgColor="bg-white"
            iconColor="bg-green-500"
            textColor="text-green-600"
          />
          <MetricCard
            title="Appointments"
            value={metrics.appointments}
            icon={Calendar}
            bgColor="bg-white"
            iconColor="bg-yellow-500"
            textColor="text-yellow-600"
          />
          <MetricCard
            title="Revenue"
            value={metrics.revenue}
            icon={DollarSign}
            bgColor="bg-white"
            iconColor="bg-red-500"
            textColor="text-red-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center mb-6">
              <TrendingUp className="text-blue-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                Appointments by Month
              </h2>
            </div>
            <div className="h-80">
              <Bar data={appointmentsData} options={barChartOptions} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center mb-6">
              <DollarSign className="text-green-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                Revenue Breakdown
              </h2>
            </div>
            <div className="h-80">
              <Doughnut data={revenueData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Average Appointments</p>
              <p className="text-xl font-bold text-blue-600">78/month</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Patient to Staff Ratio</p>
              <p className="text-xl font-bold text-green-600">16:1</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Revenue per Patient</p>
              <p className="text-xl font-bold text-purple-600">Ksh 1,000</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminDashboard;