// src/components/RevenueChartCard.jsx
import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const RevenueChartCard = ({
  data,
  dateRange,
  onDateRangeChange,
  title = "Revenue Trends",
}) => {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">{title}</Typography>
        <Box display="flex" alignItems="center">
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120, mr: 1 }}
          >
            <InputLabel id="revenue-date-range-label">Range</InputLabel>
            <Select
              labelId="revenue-date-range-label"
              value={dateRange}
              onChange={onDateRangeChange}
              label="Range"
            >
              <MenuItem value="7_days">Last 7 Days</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              {/* Add more options as needed */}
            </Select>
          </FormControl>
          <IconButton size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          {/* Updated YAxis tickFormatter */}
          <YAxis tickFormatter={(value) => `KSh ${value.toLocaleString()}`} />
          {/* Updated Tooltip formatter */}
          <Tooltip
            formatter={(value) => [`KSh ${value.toLocaleString()}`, "Revenue"]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            name="Revenue"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default RevenueChartCard;
