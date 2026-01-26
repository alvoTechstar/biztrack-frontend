import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateRangePicker } from "@mui/x-date-pickers-pro";
import { format, parseISO } from "date-fns"; // For date formatting

// --- Initial Mock Data ---
const initialPatients = [
  {
    id: "P001",
    name: "John Doe",
    age: 45,
    gender: "Male",
    registrationDate: "2023-01-15T10:30:00Z",
    phoneNumber: "555-1234",
    status: "Active",
  },
  {
    id: "P002",
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    registrationDate: "2023-03-22T14:00:00Z",
    phoneNumber: "555-5678",
    status: "Active",
  },
  {
    id: "P003",
    name: "Alice Brown",
    age: 67,
    gender: "Female",
    registrationDate: "2022-11-05T09:15:00Z",
    phoneNumber: "555-8765",
    status: "Inactive",
  },
  {
    id: "P004",
    name: "Robert Wilson",
    age: 50,
    gender: "Male",
    registrationDate: "2023-05-10T11:00:00Z",
    phoneNumber: "555-4321",
    status: "Active",
  },
  {
    id: "P005",
    name: "Emily Davis",
    age: 28,
    gender: "Female",
    registrationDate: "2024-01-20T16:30:00Z",
    phoneNumber: "555-3456",
    status: "Active",
  },
  {
    id: "P006",
    name: "Michael Johnson",
    age: 72,
    gender: "Male",
    registrationDate: "2022-07-14T08:00:00Z",
    phoneNumber: "555-6543",
    status: "Inactive",
  },
  {
    id: "P007",
    name: "Sarah Lee",
    age: 39,
    gender: "Female",
    registrationDate: "2023-09-01T13:45:00Z",
    phoneNumber: "555-7890",
    status: "Active",
  },
  {
    id: "P008",
    name: "David Kim",
    age: 55,
    gender: "Male",
    registrationDate: "2024-02-11T10:00:00Z",
    phoneNumber: "555-2109",
    status: "Active",
  },
  {
    id: "P009",
    name: "Laura Martinez",
    age: 22,
    gender: "Female",
    registrationDate: "2023-12-03T17:00:00Z",
    phoneNumber: "555-1098",
    status: "Active",
  },
  {
    id: "P010",
    name: "Chris Green",
    age: 48,
    gender: "Other",
    registrationDate: "2023-06-30T12:30:00Z",
    phoneNumber: "555-0987",
    status: "Active",
  },
  {
    id: "P011",
    name: "Patricia White",
    age: 60,
    gender: "Female",
    registrationDate: "2022-05-18T15:00:00Z",
    phoneNumber: "555-8877",
    status: "Inactive",
  },
];

const genderOptions = ["Male", "Female", "Other"];

const PatientListPage = () => {
  const [patientsList] = useState(initialPatients); // Original list, not modified by filters
  const [filteredPatients, setFilteredPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [genderFilter, setGenderFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Adjusted breakpoint for better layout

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  const applyFilters = useCallback(() => {
    let tempPatients = [...patientsList];

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempPatients = tempPatients.filter(
        (patient) =>
          patient.id.toLowerCase().includes(lowerSearchTerm) ||
          patient.name.toLowerCase().includes(lowerSearchTerm) ||
          patient.phoneNumber.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Gender filter
    if (genderFilter) {
      tempPatients = tempPatients.filter(
        (patient) => patient.gender === genderFilter
      );
    }

    // Date range filter
    const [startDate, endDate] = dateRange;
    if (startDate && endDate) {
      // Ensure endDate includes the whole day
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);

      tempPatients = tempPatients.filter((patient) => {
        try {
          const regDate = parseISO(patient.registrationDate);
          return regDate >= startDate && regDate <= adjustedEndDate;
        } catch (error) {
          console.error(
            "Error parsing patient registration date:",
            patient.registrationDate,
            error
          );
          return false; // Exclude if date is invalid
        }
      });
    } else if (startDate) {
      tempPatients = tempPatients.filter((patient) => {
        try {
          const regDate = parseISO(patient.registrationDate);
          return regDate >= startDate;
        } catch (error) {
          console.error(
            "Error parsing patient registration date:",
            patient.registrationDate,
            error
          );
          return false;
        }
      });
    } else if (endDate) {
      // Ensure endDate includes the whole day
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      tempPatients = tempPatients.filter((patient) => {
        try {
          const regDate = parseISO(patient.registrationDate);
          return regDate <= adjustedEndDate;
        } catch (error) {
          console.error(
            "Error parsing patient registration date:",
            patient.registrationDate,
            error
          );
          return false;
        }
      });
    }

    setFilteredPatients(tempPatients);
    setPage(0); // Reset to first page on filter change
  }, [patientsList, searchTerm, genderFilter, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, genderFilter, dateRange, applyFilters]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleGenderFilterChange = (event) => {
    setGenderFilter(event.target.value);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { id: "patientId", label: "Patient ID", minWidth: 100 },
    { id: "name", label: "Name", minWidth: 170 },
    { id: "age", label: "Age", minWidth: 50, align: "right" },
    { id: "gender", label: "Gender", minWidth: 100 },
    { id: "registrationDate", label: "Registration Date", minWidth: 150 },
    { id: "phoneNumber", label: "Phone Number", minWidth: 120 },
    { id: "status", label: "Status", minWidth: 100, align: "center" },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            fontWeight="bold"
            mb={3}
          >
            Patient Registry
          </Typography>

          <Grid container spacing={isMobile ? 2 : 3} mb={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Patients"
                placeholder="ID, Name, Phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                localeText={{ start: "Reg. Date From", end: "Reg. Date To" }}
                renderInput={(startProps, endProps) => (
                  <React.Fragment>
                    <TextField
                      {...startProps}
                      fullWidth
                      sx={{ mr: isMobile ? 0 : 1, mb: isMobile ? 2 : 0 }}
                    />
                    <TextField {...endProps} fullWidth />
                  </React.Fragment>
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="gender-filter-label">Gender</InputLabel>
                <Select
                  labelId="gender-filter-label"
                  value={genderFilter}
                  onChange={handleGenderFilterChange}
                  label="Gender"
                >
                  <MenuItem value="">
                    <em>All Genders</em>
                  </MenuItem>
                  {genderOptions.map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
            <Table stickyHeader aria-label="patient table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      style={{
                        minWidth: column.minWidth,
                        fontWeight: "bold",
                        backgroundColor: theme.palette.grey[100],
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((patient) => (
                      <TableRow hover key={patient.id}>
                        <TableCell>{patient.id}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell align="right">{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          {formatDate(patient.registrationDate)}
                        </TableCell>
                        <TableCell>{patient.phoneNumber}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={patient.status}
                            color={
                              patient.status === "Active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No patients found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
            component="div"
            count={filteredPatients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
          />
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default PatientListPage;
