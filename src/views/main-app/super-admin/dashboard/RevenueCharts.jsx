import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, Typography } from "@mui/material";
import { GET } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../components/theme/ThemeContext";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const BusinessCharts = ({ businesses = [], loading = false }) => {
  const theme = useTheme();

  const [chartData, setChartData] = useState({
    revenueByType: {},
    transactionsByType: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchBusinessTransactions();
  }, []);

  const fetchBusinessTransactions = async () => {
    setChartData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const allTransactionsResult = await GET(URLS.TRANSACTIONS.GET_ALL_TRANSACTIONS);
      let allTransactions = [];
      if (Array.isArray(allTransactionsResult)) {
        allTransactions = allTransactionsResult;
      } else if (allTransactionsResult && typeof allTransactionsResult === 'object') {
        if (Array.isArray(allTransactionsResult.transactions)) {
          allTransactions = allTransactionsResult.transactions;
        } else if (Array.isArray(allTransactionsResult.data)) {
          allTransactions = allTransactionsResult.data;
        } else {
          allTransactions = Object.values(allTransactionsResult).filter(item =>
            item && typeof item === 'object'
          );
        }
      }
      const revenueByType = {
        'Kiosk': 0,
        'Hotel': 0,
        'Hospital': 0
      };
      const transactionsByType = {
        'Kiosk': 0,
        'Hotel': 0,
        'Hospital': 0
      };

      allTransactions.forEach(transaction => {
        let businessType = transaction?.businessType || 'Unknown';
        const formattedType = typeof businessType === 'string' && businessType.length > 0
          ? businessType.charAt(0).toUpperCase() + businessType.slice(1).toLowerCase()
          : 'Unknown';
        if (revenueByType.hasOwnProperty(formattedType)) {
          const amount = parseFloat(transaction?.totalAmount) ||
            parseFloat(transaction?.amount) ||
            parseFloat(transaction?.transactionAmount) ||
            parseFloat(transaction?.total) ||
            parseFloat(transaction?.amountPaid) || 0;
          revenueByType[formattedType] += amount;
          transactionsByType[formattedType] += 1;
        } else {
        }
      });
      setChartData({
        revenueByType,
        transactionsByType,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching business transactions:', error);
      setChartData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load chart data'
      }));
    }
  };

  if (loading || chartData.loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 w-full font-[Averta]">
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Revenue by Business Type
            </Typography>
            <div className="h-80 flex items-center justify-center">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading revenue data..."
                loadedText=""
                color={theme.primaryColor || "#6366f1"}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Transactions by Business Type
            </Typography>
            <div className="h-80 flex items-center justify-center">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading transaction data..."
                loadedText=""
                color={theme.primaryColor || "#6366f1"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (chartData.error) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 w-full font-[Averta]">
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Revenue by Business Type
            </Typography>
            <div className="h-80 flex flex-col items-center justify-center text-center">
              <p className="text-red-500 mb-2">Error loading data</p>
              <p className="text-gray-500 text-sm">{chartData.error}</p>
              <button
                onClick={fetchBusinessTransactions}
                className="mt-4 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: theme.primaryColor || '#3b82f6',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Transactions by Business Type
            </Typography>
            <div className="h-80 flex flex-col items-center justify-center text-center">
              <p className="text-red-500 mb-2">Error loading data</p>
              <p className="text-gray-500 text-sm">{chartData.error}</p>
              <button
                onClick={fetchBusinessTransactions}
                className="mt-4 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: theme.primaryColor || '#3b82f6',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 w-full font-[Averta]">
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Revenue by Business Type
            </Typography>
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">No business data available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Transactions by Business Type
            </Typography>
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">No business data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const barChartData = {
    labels: Object.keys(chartData.revenueByType),
    datasets: [
      {
        label: "Revenue (KSh)",
        data: Object.values(chartData.revenueByType),
        backgroundColor: theme.primaryColor || "#6366f1",
      },
    ],
  };

  const doughnutChartData = {
    labels: Object.keys(chartData.transactionsByType),
    datasets: [
      {
        label: "Transactions",
        data: Object.values(chartData.transactionsByType),
        backgroundColor: [
          theme.primaryColor || "#6366f1",
          "#06b6d4",
          "#10b981",
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `KSh ${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (KSh)'
        },
        ticks: {
          callback: function (value) {
            if (value >= 1000) {
              return 'KSh ' + (value / 1000).toFixed(1) + 'k';
            }
            return 'KSh ' + value;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Business Type'
        }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value.toLocaleString()} transactions (${percentage}%)`;
          }
        }
      }
    }
  };

  // Draws the transaction total in the center of the doughnut - mirrors the
  // hover-to-see-breakdown, center-total treatment used on the kiosk dashboard's
  // Payment Methods donut instead of an always-on legend.
  const totalTransactions = Object.values(chartData.transactionsByType).reduce((a, b) => a + b, 0);
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const { left, top, width, height } = chartArea;
      const cx = left + width / 2;
      const cy = top + height / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1f2937';
      ctx.font = "bold 22px Averta, sans-serif";
      ctx.fillText(totalTransactions.toLocaleString(), cx, cy - 10);
      ctx.fillStyle = '#6b7280';
      ctx.font = "11px Averta, sans-serif";
      ctx.fillText('transactions', cx, cy + 12);
      ctx.restore();
    }
  };

  return (
    <div className="w-full font-[Averta]">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-semibold text-gray-800">
                Revenue by Business Type
              </Typography>
            </div>
            <div className="h-72 sm:h-80">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 rounded-2xl border border-gray-100 shadow-sm" elevation={0}>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="font-semibold text-gray-800">
                Transactions by Business Type
              </Typography>
            </div>
            <div className="h-72 sm:h-80">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} plugins={[centerTextPlugin]} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessCharts;
