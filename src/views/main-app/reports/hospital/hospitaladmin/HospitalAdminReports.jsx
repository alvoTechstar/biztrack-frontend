import React, { useState, useEffect, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
  useMediaQuery,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CalendarToday as CalendarTodayIcon,
  ExpandMore as ExpandMoreIcon,
  LocalHospital,
  Science,
  ReceiptLong,
  AttachMoney,
  PeopleAlt,
  Medication,
} from "@mui/icons-material";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { LocalizationProvider, DateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import "../../../../../index.css"; // Import global styles
import KPISection from "./KpiSection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// --- Mock Data ---
const today = new Date();
const createPastDate = (daysAgo) => {
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  return date;
};

const mockAppointments = Array.from({ length: 30 }, (_, i) => ({
  id: `APT${1001 + i}`,
  date: createPastDate(i % 15), // Spread dates over the last 15 days
  patientId: `PAT0${101 + i}`,
  name: `Patient ${String.fromCharCode(65 + (i % 26))}${i}`,
  department: ["Outpatient", "Inpatient", "Emergency"][i % 3],
  doctor: `Dr. ${["Smith", "Jones", "Williams"][i % 3]}`,
  status: ["Scheduled", "Completed", "Cancelled"][i % 3],
  revenue: [50, 150, 300][i % 3],
}));

const mockLabTests = Array.from({ length: 25 }, (_, i) => ({
  id: `LAB${2001 + i}`,
  date: createPastDate(i % 12), // Spread dates
  patient: `Patient ${String.fromCharCode(65 + (i % 26))}${i}`,
  testType: ["CBC", "X-Ray", "MRI", "Blood Sugar", "Urine Test"][i % 5],
  technician: `Tech ${["Adams", "Baker", "Clark"][i % 3]}`,
  status: ["Pending", "Completed", "Reported"][i % 3],
  cost: [20, 75, 200, 15, 25][i % 5],
}));

const mockPharmacyTransactions = Array.from({ length: 40 }, (_, i) => ({
  id: `PHARM${3001 + i}`,
  date: createPastDate(i % 10), // Spread dates
  medicine: `Medicine ${String.fromCharCode(88 + (i % 3))}${i}`, // X, Y, Z
  category: ["Painkiller", "Antibiotic", "Vitamin", "Antacid", "Syrup"][i % 5],
  qty: (i % 5) + 1,
  buyPrice: [5, 10, 3, 2, 7][i % 5],
  sellPrice: [7, 15, 5, 3.5, 10][i % 5],
  profit:
    ([7, 15, 5, 3.5, 10][i % 5] - [5, 10, 3, 2, 7][i % 5]) * ((i % 5) + 1),
  dispensedBy: `Pharmacist ${["Davis", "Evans", "Ford"][i % 3]}`,
}));

const mockNewPatients = Array.from({ length: 15 }, (_, i) => ({
  id: `NPAT${5001 + i}`,
  registrationDate: createPastDate(i % 20), // Spread dates
  name: `New Patient ${i + 1}`,
}));

const HospitalReports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [dateRange, setDateRange] = useState([sevenDaysAgo, today]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filtered Data ---
  const filteredAppointments = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return mockAppointments;
    const start = new Date(dateRange[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange[1]);
    end.setHours(23, 59, 59, 999);
    return mockAppointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= start && aptDate <= end;
    });
  }, [dateRange]);

  const filteredLabTests = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return mockLabTests;
    const start = new Date(dateRange[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange[1]);
    end.setHours(23, 59, 59, 999);
    return mockLabTests.filter((test) => {
      const testDate = new Date(test.date);
      return testDate >= start && testDate <= end;
    });
  }, [dateRange]);

  const filteredPharmacyTransactions = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return mockPharmacyTransactions;
    const start = new Date(dateRange[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange[1]);
    end.setHours(23, 59, 59, 999);
    return mockPharmacyTransactions.filter((trx) => {
      const trxDate = new Date(trx.date);
      return trxDate >= start && trxDate <= end;
    });
  }, [dateRange]);

  const filteredNewPatients = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return mockNewPatients;
    const start = new Date(dateRange[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange[1]);
    end.setHours(23, 59, 59, 999);
    return mockNewPatients.filter((patient) => {
      const regDate = new Date(patient.registrationDate);
      return regDate >= start && regDate <= end;
    });
  }, [dateRange]);

  // --- KPI Calculations ---
  const totalAppointments = filteredAppointments.length;
  const totalRevenue = filteredAppointments.reduce(
    (sum, apt) => sum + (apt.status === "Completed" ? apt.revenue : 0),
    0
  );
  const totalLabTests = filteredLabTests.length;
  const totalMedicinesDispensed = filteredPharmacyTransactions.reduce(
    (sum, trx) => sum + trx.qty,
    0
  );
  const newPatientsRegistered = filteredNewPatients.length;
  const pharmacyProfit = filteredPharmacyTransactions.reduce(
    (sum, trx) => sum + trx.profit,
    0
  );

  // --- Chart Data Preparation ---
  const appointmentsOverTimeData = useMemo(() => {
    const counts = {};
    filteredAppointments.forEach((apt) => {
      const day = new Date(apt.date).toLocaleDateString("en-CA"); // YYYY-MM-DD for easy sorting
      counts[day] = (counts[day] || 0) + 1;
    });
    const sortedDays = Object.keys(counts).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    return {
      labels: sortedDays.map((day) =>
        new Date(day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: "Appointments",
          data: sortedDays.map((day) => counts[day]),
          fill: false,
          borderColor: theme.palette.primary.main,
          tension: 0.1,
        },
      ],
    };
  }, [filteredAppointments, theme.palette.primary.main]);

  const appointmentsByDeptData = useMemo(() => {
    const counts = { Outpatient: 0, Inpatient: 0, Emergency: 0 };
    filteredAppointments.forEach((apt) => {
      if (counts[apt.department] !== undefined) {
        counts[apt.department]++;
      }
    });
    return {
      labels: ["Outpatient", "Inpatient", "Emergency"],
      datasets: [
        {
          label: "Appointments by Department",
          data: [counts.Outpatient, counts.Inpatient, counts.Emergency],
          backgroundColor: [
            theme.palette.secondary.light,
            theme.palette.secondary.main,
            theme.palette.secondary.dark,
          ],
          hoverOffset: 4,
        },
      ],
    };
  }, [filteredAppointments, theme.palette.secondary]);

  const labTestsByTypeData = useMemo(() => {
    const counts = {};
    filteredLabTests.forEach((test) => {
      counts[test.testType] = (counts[test.testType] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Lab Tests by Type",
          data: Object.values(counts),
          backgroundColor: theme.palette.info.main,
        },
      ],
    };
  }, [filteredLabTests, theme.palette.info.main]);

  const pharmacyProfitByCategoryData = useMemo(() => {
    const profits = {};
    filteredPharmacyTransactions.forEach((trx) => {
      profits[trx.category] = (profits[trx.category] || 0) + trx.profit;
    });
    return {
      labels: Object.keys(profits),
      datasets: [
        {
          label: "Pharmacy Profit by Category",
          data: Object.values(profits),
          backgroundColor: theme.palette.success.main,
        },
      ],
    };
  }, [filteredPharmacyTransactions, theme.palette.success.main]);

  // Chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (
                context.dataset.label?.toLowerCase().includes("profit") ||
                context.dataset.label?.toLowerCase().includes("revenue")
              ) {
                label += new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        type: "category", // Keep as category if labels are pre-formatted strings
        title: {
          display: true,
          text:
            dateRange[0] &&
            dateRange[1] &&
            (dateRange[1].getTime() - dateRange[0].getTime()) /
              (1000 * 3600 * 24) >
              30
              ? "Weeks"
              : "Days",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Appointments",
        },
      },
    },
  };

  // Simulate loading
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleExport = (data, filename) => {
    console.log(`Exporting ${filename}:`, data);
    // Basic CSV export
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`${filename} exported! (Check console and download)`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Reports...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.grey[100],
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div class="flex items-center justify-between p-4 mb-2">
          <div class="flex items-center">
            <LocalHospital className="mr-2 text-2xl  text-blue-700" />
            <h5 className="text-2xl font-bold text-gray-800 ">
              Hospital Reports
            </h5>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={(newValue) => setDateRange(newValue)}
            renderInput={(startProps, endProps) => (
              <div className="flex items-center rounded-md bg-white px-2 py-1 shadow-sm transition duration-200 ease-in-out hover:ring-2 hover:ring-blue-500">
                <CalendarTodayIcon className="mr-2 text-gray-500" />
                <TextField
                  {...startProps}
                  size="small"
                  variant="outlined"
                  className="mr-2 flex-1 h-[45px] text-gray-800 focus:ring-2 focus:ring-blue-500"
                />
                <TextField
                  {...endProps}
                  size="small"
                  variant="outlined"
                  className="flex-1 h-[45px] text-gray-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          />
        </div>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* KPI Cards */}
          <KPISection />
          {/* Charts Section */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, fontWeight: "medium" }}
          >
            Visual Analytics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, height: isMobile ? "300px" : "400px" }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <BarChartIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />{" "}
                  Appointments Over Time
                </Typography>
                {filteredAppointments.length > 0 ? (
                  <Line
                    options={lineChartOptions}
                    data={appointmentsOverTimeData}
                  />
                ) : (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No appointment data for selected range.
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, height: isMobile ? "300px" : "400px" }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PieChartIcon
                    sx={{ mr: 1, color: theme.palette.secondary.main }}
                  />{" "}
                  Appointments by Department
                </Typography>
                {filteredAppointments.length > 0 ? (
                  <Doughnut
                    options={commonChartOptions}
                    data={appointmentsByDeptData}
                  />
                ) : (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No appointment data for selected range.
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, height: isMobile ? "300px" : "400px" }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <BarChartIcon
                    sx={{ mr: 1, color: theme.palette.info.main }}
                  />{" "}
                  Lab Tests by Type
                </Typography>
                {filteredLabTests.length > 0 ? (
                  <Bar options={commonChartOptions} data={labTestsByTypeData} />
                ) : (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No lab test data for selected range.
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, height: isMobile ? "300px" : "400px" }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <BarChartIcon
                    sx={{ mr: 1, color: theme.palette.success.main }}
                  />{" "}
                  Pharmacy Profit by Category
                </Typography>
                {filteredPharmacyTransactions.length > 0 ? (
                  <Bar
                    options={commonChartOptions}
                    data={pharmacyProfitByCategoryData}
                  />
                ) : (
                  <Typography sx={{ textAlign: "center", mt: 4 }}>
                    No pharmacy data for selected range.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Tables Section */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, fontWeight: "medium" }}
          >
            Detailed Reports
          </Typography>
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ReceiptLong
                  sx={{ mr: 1, color: theme.palette.primary.dark }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                  Appointments
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ flexDirection: "column" }}>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleExport(filteredAppointments, "appointments_report")
                  }
                  sx={{ mb: 2, alignSelf: "flex-end" }}
                  disabled={filteredAppointments.length === 0}
                >
                  Export Appointments
                </Button>
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 440, overflowX: "auto" }}
                >
                  <Table stickyHeader aria-label="appointments table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Patient ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell>
                              {new Date(row.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{row.patientId}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.department}</TableCell>
                            <TableCell>{row.doctor}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell align="right">
                              $
                              {row.status === "Completed"
                                ? row.revenue.toFixed(2)
                                : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No appointments found for the selected date range.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Science sx={{ mr: 1, color: theme.palette.secondary.dark }} />
                <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                  Lab Tests
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ flexDirection: "column" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() =>
                    handleExport(filteredLabTests, "lab_tests_report")
                  }
                  sx={{ mb: 2, alignSelf: "flex-end" }}
                  disabled={filteredLabTests.length === 0}
                >
                  Export Lab Tests
                </Button>
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 440, overflowX: "auto" }}
                >
                  <Table stickyHeader aria-label="lab tests table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Test Type</TableCell>
                        <TableCell>Technician</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLabTests.length > 0 ? (
                        filteredLabTests.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell>
                              {new Date(row.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{row.patient}</TableCell>
                            <TableCell>{row.testType}</TableCell>
                            <TableCell>{row.technician}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell align="right">
                              ${row.cost.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No lab tests found for the selected date range.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Medication sx={{ mr: 1, color: theme.palette.error.dark }} />
                <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                  Pharmacy Transactions
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ flexDirection: "column" }}>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleExport(
                      filteredPharmacyTransactions,
                      "pharmacy_transactions_report"
                    )
                  }
                  sx={{
                    mb: 2,
                    alignSelf: "flex-end",
                    backgroundColor: theme.palette.error.main,
                    "&:hover": { backgroundColor: theme.palette.error.dark },
                  }}
                  disabled={filteredPharmacyTransactions.length === 0}
                >
                  Export Pharmacy Transactions
                </Button>
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 440, overflowX: "auto" }}
                >
                  <Table stickyHeader aria-label="pharmacy transactions table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Buy Price</TableCell>
                        <TableCell align="right">Sell Price</TableCell>
                        <TableCell align="right">Profit</TableCell>
                        <TableCell>Dispensed By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPharmacyTransactions.length > 0 ? (
                        filteredPharmacyTransactions.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell>
                              {new Date(row.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{row.medicine}</TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell align="right">{row.qty}</TableCell>
                            <TableCell align="right">
                              ${row.buyPrice.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              ${row.sellPrice.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              ${row.profit.toFixed(2)}
                            </TableCell>
                            <TableCell>{row.dispensedBy}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No pharmacy transactions found for the selected date
                            range.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default HospitalReports;
