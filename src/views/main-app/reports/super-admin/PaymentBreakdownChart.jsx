// src/views/main-app/reports/super-admin/components/PaymentBreakdownChart.jsx
import React, { useMemo } from 'react';
import { Paper, Typography, Box, Chip, useTheme, useMediaQuery } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Smartphone, Banknote, CreditCard } from 'lucide-react';

// Helper to format currency
const formatKSh = (amount) => {
  return `KSh ${parseFloat(amount).toLocaleString('en-KE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Map payment methods to icons and colors - STRICTLY MPesa and Cash only
const PAYMENT_METHOD_CONFIG = {
  'MPesa': { icon: Smartphone, color: '#10B981', bgColor: '#D1FAE5' },
  'Cash': { icon: Banknote, color: '#F59E0B', bgColor: '#FEF3C7' },
};

// Colors for chart segments - MPesa (green) and Cash (orange)
const PIE_COLORS = ['#10B981', '#F59E0B'];

const PaymentBreakdownChart = ({ transactions, title = "Commission Split by Payment Method" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));

  // Memoize the data transformation for the pie chart
  const paymentBreakdownData = useMemo(() => {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    let mpesaTotal = 0;
    let cashTotal = 0;

    // Process transactions and extract payment method data
    transactions.forEach(transaction => {
      // Only count completed transactions
      const status = (transaction?.status || '').toLowerCase();
      if (status !== 'completed') return;

      // Calculate commission (5% of total amount)
      const totalAmount = parseFloat(transaction?.totalAmount || transaction?.amount || 0);
      const commission = totalAmount * 0.05;

      // Get payment method from transaction
      const paymentMethod = (
        transaction?.paymentMethod || 
        transaction?.type || 
        transaction?.payment_method || 
        ''
      ).toLowerCase();

      // Categorize strictly as MPesa or Cash
      if (paymentMethod.includes('mpesa') || paymentMethod.includes('m-pesa') || paymentMethod.includes('m pesa')) {
        mpesaTotal += commission;
      } else if (paymentMethod.includes('cash')) {
        cashTotal += commission;
      }
      // Any other payment method is ignored to maintain strict MPesa/Cash only
    });

    // Build the result array
    const result = [];
    const total = mpesaTotal + cashTotal;

    if (mpesaTotal > 0) {
      result.push({
        name: 'MPesa',
        value: parseFloat(mpesaTotal.toFixed(2)),
        percentage: total > 0 ? parseFloat(((mpesaTotal / total) * 100).toFixed(1)) : 0
      });
    }

    if (cashTotal > 0) {
      result.push({
        name: 'Cash',
        value: parseFloat(cashTotal.toFixed(2)),
        percentage: total > 0 ? parseFloat(((cashTotal / total) * 100).toFixed(1)) : 0
      });
    }

    // Sort by value descending
    return result.sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Calculate total commission
  const totalCommission = useMemo(() => {
    return paymentBreakdownData.reduce((sum, item) => sum + item.value, 0);
  }, [paymentBreakdownData]);

  // Responsive chart dimensions
  const chartDimensions = useMemo(() => {
    if (isMobile) {
      return { innerRadius: 50, outerRadius: 80 };
    } else if (isTablet) {
      return { innerRadius: 60, outerRadius: 95 };
    } else {
      return { innerRadius: 70, outerRadius: 110 };
    }
  }, [isMobile, isTablet]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const config = PAYMENT_METHOD_CONFIG[data.name];
      const Icon = config.icon;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
              <Icon size={16} style={{ color: config.color }} />
            </div>
            <p className="font-semibold text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Amount:</span>
              <span className="font-medium text-gray-900">{formatKSh(data.value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Share:</span>
              <span className="font-medium text-gray-900">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter - responsive
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className={`flex flex-wrap justify-center gap-${isMobile ? '2' : '3'} mt-${isMobile ? '2' : '4'}`}>
        {payload.map((entry, index) => {
          const config = PAYMENT_METHOD_CONFIG[entry.value];
          const Icon = config.icon;
          
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div className={`w-${isMobile ? '2' : '3'} h-${isMobile ? '2' : '3'} rounded-full`} style={{ backgroundColor: entry.color }} />
              <span className={`text-${isMobile ? 'xs' : 'sm'} text-gray-700`}>{entry.value}</span>
              <Chip
                label={`${entry.payload.percentage}%`}
                size="small"
                className="ml-1"
                style={{ 
                  backgroundColor: config.bgColor,
                  color: config.color,
                  fontWeight: 500,
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  height: isMobile ? '20px' : '24px',
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Center label for total - responsive
  const renderCustomizedLabel = ({ cx, cy }) => {
    const fontSize = isMobile ? '16px' : isTablet ? '20px' : '24px';
    const smallFontSize = isMobile ? '10px' : isTablet ? '12px' : '14px';
    const yOffset = isMobile ? 8 : 10;
    
    return (
      <g>
        <text
          x={cx}
          y={cy - yOffset}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize, fontWeight: 'bold' }}
          fill="#1F2937"
        >
          {isMobile ? `${totalCommission.toFixed(0)}K` : formatKSh(totalCommission)}
        </text>
        <text
          x={cx}
          y={cy + yOffset + 5}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: smallFontSize }}
          fill="#6B7280"
        >
          {isMobile ? 'Total' : 'Total Commission'}
        </text>
      </g>
    );
  };

  return (
    <Paper
      elevation={0}
      className={`p-${isMobile ? '3' : '5'} rounded-${isMobile ? 'xl' : '2xl'} border border-gray-200 bg-white shadow-sm`}
      sx={{ width: '100%', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className={`mb-${isMobile ? '4' : '6'}`}>
        <Typography 
          variant={isMobile ? 'subtitle1' : 'h6'} 
          className="font-bold text-gray-900"
          sx={{ fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.25rem' }}
        >
          {isMobile ? 'Payment Split' : title}
        </Typography>
        <Typography 
          variant="body2" 
          className="text-gray-500"
          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
        >
          {isMobile ? 'MPesa vs Cash' : 'Distribution of commissions between MPesa and Cash payments'}
        </Typography>
      </div>

      {/* Chart Area */}
      <Box sx={{ height: isMobile ? '400px' : isTablet ? '450px' : '350px' }}>
        {paymentBreakdownData.length > 0 ? (
          <div className={`flex ${isMobile || isTablet ? 'flex-col' : 'flex-col lg:flex-row'} h-full`}>
            {/* Pie Chart */}
            <div className={`${isMobile || isTablet ? 'w-full h-[250px]' : 'lg:w-2/3 h-full'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={chartDimensions.innerRadius}
                    outerRadius={chartDimensions.outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    strokeWidth={2}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {paymentBreakdownData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        className="hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    content={renderLegend}
                    wrapperStyle={{ paddingTop: isMobile ? '10px' : '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Panel */}
            <div className={`${isMobile || isTablet ? 'w-full mt-4' : 'lg:w-1/3 lg:pl-6 pt-6 lg:pt-0'}`}>
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                <div className={`bg-gray-50 p-${isMobile ? '3' : '4'} rounded-${isMobile ? 'lg' : 'xl'}`}>
                  <Typography 
                    variant="subtitle2" 
                    className="text-gray-600 mb-2"
                    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Payment Method Summary
                  </Typography>
                  <div className={`space-y-${isMobile ? '2' : '3'}`}>
                    {paymentBreakdownData.map((item, index) => {
                      const config = PAYMENT_METHOD_CONFIG[item.name];
                      const Icon = config.icon;
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-${isMobile ? '8' : '10'} h-${isMobile ? '8' : '10'} rounded-lg flex items-center justify-center`}
                              style={{ backgroundColor: config.bgColor }}
                            >
                              <Icon size={isMobile ? 14 : 18} style={{ color: config.color }} />
                            </div>
                            <div>
                              <p 
                                className="font-medium text-gray-900"
                                style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                              >
                                {item.name}
                              </p>
                              <p 
                                className="text-gray-500"
                                style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                              >
                                {item.percentage}% share
                              </p>
                            </div>
                          </div>
                          <p 
                            className="font-semibold text-gray-900"
                            style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                          >
                            {isMobile ? `${(item.value / 1000).toFixed(1)}K` : formatKSh(item.value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Total Stats */}
                <div className={`grid grid-cols-2 gap-${isMobile ? '2' : '3'}`}>
                  <div className={`bg-blue-50 p-${isMobile ? '2' : '3'} rounded-lg`}>
                    <p 
                      className="text-gray-600"
                      style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                    >
                      Total Methods
                    </p>
                    <p 
                      className="font-bold text-blue-700"
                      style={{ fontSize: isMobile ? '1rem' : '1.125rem' }}
                    >
                      {paymentBreakdownData.length}
                    </p>
                  </div>
                  <div className={`bg-green-50 p-${isMobile ? '2' : '3'} rounded-lg`}>
                    <p 
                      className="text-gray-600"
                      style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                    >
                      Highest Share
                    </p>
                    <p 
                      className="font-bold text-green-700"
                      style={{ fontSize: isMobile ? '1rem' : '1.125rem' }}
                    >
                      {paymentBreakdownData[0]?.percentage || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div 
              className={`w-${isMobile ? '12' : '16'} h-${isMobile ? '12' : '16'} rounded-full bg-gray-100 flex items-center justify-center mb-${isMobile ? '3' : '4'}`}
            >
              <CreditCard className="text-gray-400" size={isMobile ? 20 : 24} />
            </div>
            <Typography 
              variant="body1" 
              className="text-gray-500 mb-2 text-center"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              No payment data available
            </Typography>
            <Typography 
              variant="body2" 
              className="text-gray-400 text-center px-4"
              sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
            >
              Transactions will appear here once available
            </Typography>
          </div>
        )}
      </Box>
    </Paper>
  );
};

export default PaymentBreakdownChart;