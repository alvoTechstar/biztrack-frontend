import React, { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  FormControlLabel
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// --- Initial Mock Data ---
const initialStaff = [
  {
    id: 's001',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@hospital.com',
    role: 'Doctor',
    phoneNumber: '555-0101',
    status: 'Active',
    photoUrl: '', // Placeholder for actual image URL
  },
  {
    id: 's002',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@hospital.com',
    role: 'Nurse',
    phoneNumber: '555-0102',
    status: 'Active',
    photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 's003',
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol.davis@hospital.com',
    role: 'Receptionist',
    phoneNumber: '555-0103',
    status: 'Inactive',
    photoUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    id: 's004',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@hospital.com',
    role: 'Pharmacist',
    phoneNumber: '555-0104',
    status: 'Active',
    photoUrl: '',
  },
  {
    id: 's005',
    firstName: 'Eve',
    lastName: 'Brown',
    email: 'eve.brown@hospital.com',
    role: 'Lab Technician',
    phoneNumber: '555-0105',
    status: 'Active',
    photoUrl: 'https://randomuser.me/api/portraits/women/80.jpg',
  },
  {
    id: 's006',
    firstName: 'Frank',
    lastName: 'Miller',
    email: 'frank.miller@hospital.com',
    role: 'Doctor',
    phoneNumber: '555-0106',
    status: 'Active',
    photoUrl: 'https://randomuser.me/api/portraits/men/81.jpg',
  },
  {
    id: 's007',
    firstName: 'Grace',
    lastName: 'Garcia',
    email: 'grace.garcia@hospital.com',
    role: 'Nurse',
    phoneNumber: '555-0107',
    status: 'Inactive',
    photoUrl: '',
  },
];

const staffRoles = ['Receptionist', 'Doctor', 'Nurse', 'Pharmacist', 'Lab Technician'];

const HospitalStaff = () => {
  const [staffList, setStaffList] = useState(initialStaff);
  const [filteredStaff, setFilteredStaff] = useState(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [formValues, setFormValues] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phoneNumber: '',
    status: 'Active',
    photoUrl: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors = {};
    if (!formValues.firstName.trim()) errors.firstName = 'First Name is required';
    if (!formValues.lastName.trim()) errors.lastName = 'Last Name is required';
    if (!formValues.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formValues.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formValues.role) errors.role = 'Role is required';
    if (!formValues.phoneNumber.trim()) errors.phoneNumber = 'Phone Number is required';
    else if (!/^\d{3}-\d{4}$/.test(formValues.phoneNumber.replace(/^\d{3}-/, '')) && !/^\d{10}$/.test(formValues.phoneNumber.replace(/-/g, '')) && !/^\d{3}-\d{3}-\d{4}$/.test(formValues.phoneNumber) ) {
        // Basic validation for xxx-xxxx or xxxxxxx or xxx-xxx-xxxx
        // Can be made more robust
        errors.phoneNumber = 'Invalid phone number format (e.g., 555-0101 or 5550101010)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const applyFilters = useCallback(() => {
    let tempStaff = [...staffList];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempStaff = tempStaff.filter(
        (staff) =>
          staff.firstName.toLowerCase().includes(lowerSearchTerm) ||
          staff.lastName.toLowerCase().includes(lowerSearchTerm) ||
          staff.email.toLowerCase().includes(lowerSearchTerm) ||
          staff.role.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (roleFilter) {
      tempStaff = tempStaff.filter((staff) => staff.role === roleFilter);
    }

    setFilteredStaff(tempStaff);
    setPage(0); // Reset to first page on filter change
  }, [staffList, searchTerm, roleFilter]);


  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, staffList, applyFilters]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (staff = null) => {
    setFormErrors({});
    if (staff) {
      setIsEditMode(true);
      setCurrentStaff(staff);
      setFormValues({ ...staff });
    } else {
      setIsEditMode(false);
      setCurrentStaff(null);
      setFormValues({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phoneNumber: '',
        status: 'Active',
        photoUrl: '',
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentStaff(null);
    setIsEditMode(false);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Active' : 'Inactive') : value,
    }));
  };

  const handleSaveStaff = () => {
    if (!validateForm()) return;

    if (isEditMode && currentStaff) {
      setStaffList((prevList) =>
        prevList.map((s) => (s.id === currentStaff.id ? { ...formValues, id: currentStaff.id } : s))
      );
    } else {
      setStaffList((prevList) => [
        ...prevList,
        { ...formValues, id: `s${Math.random().toString(36).substr(2, 3)}${Date.now().toString(36).substr(4,5)}` }, // simple unique id
      ]);
    }
    handleCloseModal();
  };

  const handleDeleteStaff = (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
        setStaffList((prevList) => prevList.filter((s) => s.id !== staffId));
    }
  };

  const handleToggleStatus = (staffId) => {
    setStaffList((prevList) =>
      prevList.map((s) =>
        s.id === staffId ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s
      )
    );
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };


  const columns = [
    { id: 'photo', label: 'Photo', minWidth: isMobile ? 50 : 70, align: 'center' },
    { id: 'name', label: 'Name', minWidth: isMobile ? 120 : 170 },
    { id: 'email', label: 'Email', minWidth: isMobile ? 150 : 200 },
    { id: 'role', label: 'Role', minWidth: isMobile ? 100 : 150 },
    { id: 'phoneNumber', label: 'Phone', minWidth: isMobile ? 100 : 120 },
    { id: 'status', label: 'Status', minWidth: isMobile ? 80 : 100, align: 'center' },
    { id: 'actions', label: 'Actions', minWidth: isMobile ? 150 : 180, align: 'center' },
  ];


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 2, boxShadow: 3 }}>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems={isMobile ? 'stretch' : "center"}
          spacing={2}
          mb={3}
        >
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" fontWeight="bold">
            Staff Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenModal()}
            sx={{whiteSpace: 'nowrap'}}
          >
            Add Staff
          </Button>
        </Stack>

        <Grid container spacing={isMobile ? 2 : 3} mb={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Staff"
              placeholder="Name, Email, Role..."
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="role-filter-label">Filter by Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Filter by Role"
              >
                <MenuItem value="">
                  <em>All Roles</em>
                </MenuItem>
                {staffRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer sx={{ maxHeight: 500, overflowX: 'auto' }}>
          <Table stickyHeader aria-label="staff table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth, fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((staff) => (
                  <TableRow
                    hover
                    key={staff.id}
                    sx={{
                      backgroundColor: staff.status === 'Inactive' ? theme.palette.grey[200] : 'inherit',
                      '&:hover': {
                        backgroundColor: staff.status === 'Inactive' ? theme.palette.grey[300] : theme.palette.action.hover,
                      }
                    }}
                  >
                    <TableCell align="center">
                      <Avatar
                        src={staff.photoUrl || undefined} // Avatar handles empty src well
                        alt={`${staff.firstName} ${staff.lastName}`}
                        sx={{ bgcolor: staff.photoUrl ? 'transparent' : theme.palette.primary.main, width: 40, height: 40, margin: 'auto' }}
                      >
                        {!staff.photoUrl && getInitials(staff.firstName, staff.lastName)}
                      </Avatar>
                    </TableCell>
                    <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.phoneNumber}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={staff.status}
                        color={staff.status === 'Active' ? 'success' : 'default'}
                        size="small"
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction={isMobile ? "column" : "row"} spacing={0.5} justifyContent="center">
                         <IconButton
                            size="small"
                            onClick={() => handleOpenModal(staff)}
                            aria-label="edit staff"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(staff.id)}
                            aria-label={staff.status === 'Active' ? "deactivate staff" : "activate staff"}
                            color={staff.status === 'Active' ? "warning" : "success"}
                          >
                            {staff.status === 'Active' ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteStaff(staff.id)}
                            aria-label="delete staff"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStaff.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                            No staff members found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
          component="div"
          count={filteredStaff.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}`}}
        />
      </Paper>

      {/* Add/Edit Staff Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="staff-modal-title"
        maxWidth="sm"
        fullWidth
        hideBackdrop // No backdrop
        PaperProps={{
          elevation: 8, // Add some elevation to make it appear on top
           sx: {
            position: 'fixed', // Or 'absolute' depending on desired behavior
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle id="staff-modal-title">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                {isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}
                <IconButton aria-label="close" onClick={handleCloseModal}>
                    <CloseIcon />
                </IconButton>
            </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{pt: 1}}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                name="firstName"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formValues.firstName}
                onChange={handleFormChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="lastName"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formValues.lastName}
                onChange={handleFormChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={formValues.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" required error={!!formErrors.role}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  name="role"
                  value={formValues.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  {staffRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.role && <Typography color="error" variant="caption" sx={{pl:2, pt:0.5}}>{formErrors.role}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="phoneNumber"
                label="Phone Number (e.g., 555-0101)"
                type="tel"
                fullWidth
                variant="outlined"
                value={formValues.phoneNumber}
                onChange={handleFormChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                required
              />
            </Grid>
             <Grid item xs={12}>
              <TextField
                margin="dense"
                name="photoUrl"
                label="Photo URL (Optional)"
                type="url"
                fullWidth
                variant="outlined"
                value={formValues.photoUrl}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={formValues.status === 'Active'}
                            onChange={(e) =>
                            setFormValues({ ...formValues, status: e.target.checked ? 'Active' : 'Inactive' })
                            }
                            name="status"
                            color="primary"
                        />
                    }
                    label={formValues.status === 'Active' ? 'Status: Active' : 'Status: Inactive'}
                />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{p: '16px 24px'}}>
          <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
          <Button onClick={handleSaveStaff} variant="contained" color="primary">
            {isEditMode ? 'Save Changes' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HospitalStaff;
