import React, { useState} from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// Import for DateRangePicker (Pro version)
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // <-- Add this line

import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import "../../../../index.css"; // Import your global styles

// Mock data for initial expenses
const initialExpenses = [
  {
    id: "exp1",
    name: "Electricity Bill",
    category: "Utilities",
    amount: 1500,
    date: "2024-04-15",
    status: "Paid",
    notes: "Monthly electricity consumption.",
  },
  {
    id: "exp2",
    name: "Office Supplies",
    category: "Supplies",
    amount: 300,
    date: "2024-04-20",
    status: "Unpaid",
    notes: "Pens, paper, toner.",
  },
  {
    id: "exp3",
    name: "May Rent",
    category: "Rent",
    amount: 5000,
    date: "2024-05-01",
    status: "Paid",
    notes: "Hotel property rent for May.",
  },
  {
    id: "exp4",
    name: "Staff Salaries - April",
    category: "Salaries",
    amount: 10000,
    date: "2024-04-30",
    status: "Paid",
    notes: "April salaries for all staff.",
  },
  {
    id: "exp5",
    name: "Marketing Campaign",
    category: "Other",
    amount: 800,
    date: "2024-05-10",
    status: "Unpaid",
    notes: "Online marketing for summer season.",
  },
];

const HotelExpenses = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  // Initialize filterDateRange with null for DateRangePicker
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [newExpense, setNewExpense] = useState({
    name: "",
    category: "",
    amount: "",
    date: null,
    notes: "",
  });
  const [paymentDetails, setPaymentDetails] = useState({
    method: "",
    notes: "",
  });

  // Calculate summary cards
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPaid = expenses
    .filter((exp) => exp.status === "Paid")
    .reduce((sum, exp) => sum + exp.amount, 0);
  const totalUnpaid = expenses
    .filter((exp) => exp.status === "Unpaid")
    .reduce((sum, exp) => sum + exp.amount, 0);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
  };

  const handleDateRangeChange = (newValue) => {
    // newValue from DateRangePicker is typically an array of Dayjs objects
    setFilterDateRange(newValue);
  };

  const handleOpenExpenseModal = () => {
    setOpenExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setOpenExpenseModal(false);
    setNewExpense({
      name: "",
      category: "",
      amount: "",
      date: null,
      notes: "",
    });
  };

  const handleAddExpense = () => {
    const expenseToAdd = {
      id: `exp${expenses.length + 1}`,
      name: newExpense.name,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      // Convert Dayjs object to ISO string for consistency
      date: newExpense.date ? newExpense.date.toISOString().split("T")[0] : "",
      status: "Unpaid", // New expenses are initially unpaid
      notes: newExpense.notes,
    };
    setExpenses([...expenses, expenseToAdd]);
    handleCloseExpenseModal();
  };

  const handleOpenPaymentModal = (expense) => {
    setSelectedExpense(expense);
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setSelectedExpense(null);
    setPaymentDetails({
      method: "",
      notes: "",
    });
  };

  const handleConfirmPayment = () => {
    if (selectedExpense) {
      setExpenses(
        expenses.map((exp) =>
          exp.id === selectedExpense.id ? { ...exp, status: "Paid" } : exp
        )
      );
    }
    handleClosePaymentModal();
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory
      ? expense.category === filterCategory
      : true;

    // Convert expense.date string to Date object for comparison
    const expenseDate = new Date(expense.date);
    const startDate = filterDateRange[0] ? filterDateRange[0].toDate() : null; // Convert Dayjs to Date
    const endDate = filterDateRange[1] ? filterDateRange[1].toDate() : null; // Convert Dayjs to Date

    const matchesDate =
      startDate && endDate
        ? expenseDate >= startDate && expenseDate <= endDate
        : true;

    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    // Use AdapterDayjs for DateRangePicker from x-date-pickers-pro
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hotel Expenses Management
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenExpenseModal}
          >
            Add New Expense
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  <AttachMoneyIcon fontSize="large" /> Ksh{" "}
                  {totalExpenses.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Paid
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ color: "success.main" }}
                >
                  <ReceiptIcon fontSize="large" /> Ksh{" "}
                  {totalPaid.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Unpaid
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ color: "warning.main" }}
                >
                  <WarningAmberIcon fontSize="large" /> Ksh{" "}
                  {totalUnpaid.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} sx={{ flexGrow: 1 }}>
              {" "}
              {/* Search bar with 50% width on medium screens */}
              <TextField
                fullWidth
                label="Search Expenses"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { md: "100%", xs: "100%" } }} // 50% width on md, full on xs
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {" "}
              {/* Filter dropdown */}
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={handleFilterCategoryChange}
                  label="Category"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                  }} // Example styling for dropdown
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Utilities">Utilities</MenuItem>
                  <MenuItem value="Supplies">Supplies</MenuItem>
                  <MenuItem value="Rent">Rent</MenuItem>
                  <MenuItem value="Salaries">Salaries</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {" "}
              {/* Date Range Picker */}
              <DemoContainer components={["DateRangePicker"]} sx={{ p: 0 }}>
                <DateRangePicker
                  localeText={{ start: "Start Date", end: "End Date" }}
                  value={filterDateRange}
                  onChange={handleDateRangeChange}
                  slotProps={{
                    textField: { variant: "outlined", fullWidth: true },
                  }}
                  style={{ color: "white !important" }} 
                />
              </DemoContainer>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Expense Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.name}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>Ksh {expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color:
                            expense.status === "Paid"
                              ? "success.main"
                              : "warning.main",
                        }}
                      >
                        {expense.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {expense.status === "Paid" ? (
                        <>
                          <Tooltip title="View Details">
                            <IconButton
                              sx={{ "&:hover": { color: "primary.main" } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print Receipt">
                            <IconButton
                              sx={{ "&:hover": { color: "success.main" } }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AttachMoneyIcon />}
                          onClick={() => handleOpenPaymentModal(expense)}
                          sx={{
                            "&:hover": { backgroundColor: "primary.dark" },
                          }}
                        >
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Expense Modal */}
        <Dialog
          open={openExpenseModal}
          onClose={handleCloseExpenseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Expense Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newExpense.name}
              onChange={(e) =>
                setNewExpense({ ...newExpense, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, category: e.target.value })
                }
                label="Category"
              >
                <MenuItem value="">Select Category</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Supplies">Supplies</MenuItem>
                <MenuItem value="Rent">Rent</MenuItem>
                <MenuItem value="Salaries">Salaries</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Amount (Ksh)"
              type="number"
              fullWidth
              variant="outlined"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            {/* Using DatePicker from @mui/x-date-pickers (not pro) for single date */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={newExpense.date}
                onChange={(newValue) =>
                  setNewExpense({ ...newExpense, date: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </LocalizationProvider>
            <TextField
              margin="dense"
              label="Notes (Optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newExpense.notes}
              onChange={(e) =>
                setNewExpense({ ...newExpense, notes: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExpenseModal} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              color="secondary"
              variant="contained"
            >
              Add Expense
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Modal */}
        <Dialog
          open={openPaymentModal}
          onClose={handleClosePaymentModal}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogContent>
            {selectedExpense && (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Expense Name: <strong>{selectedExpense.name}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Amount:{" "}
                  <strong>
                    Ksh {selectedExpense.amount?.toLocaleString()}
                  </strong>
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentDetails.method}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        method: e.target.value,
                      })
                    }
                    label="Payment Method"
                  >
                    <MenuItem value="">Select Method</MenuItem>
                    <MenuItem value="M-Pesa">M-Pesa</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  label="Notes (Optional)"
                  type="text"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={paymentDetails.notes}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      notes: e.target.value,
                    })
                  }
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentModal} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              color="secondary"
              variant="contained"
            >
              Confirm Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default HotelExpenses;
