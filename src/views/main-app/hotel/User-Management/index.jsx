import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  FormHelperText,
  Divider,
  Avatar,
  Switch,
  InputBase
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Sample data for staff members
const initialStaff = [
  { 
    id: 1, 
    name: 'John Smith', 
    role: 'Waiter', 
    email: 'john.smith@hotel.com', 
    phone: '(555) 123-4567', 
    dateJoined: '2023-04-15', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 2, 
    name: 'Maria Rodriguez', 
    role: 'Chef', 
    email: 'maria.r@hotel.com', 
    phone: '(555) 234-5678', 
    dateJoined: '2022-11-08', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 3, 
    name: 'David Chen', 
    role: 'Cashier', 
    email: 'david.chen@hotel.com', 
    phone: '(555) 345-6789', 
    dateJoined: '2023-07-21', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 4, 
    name: 'Sarah Johnson', 
    role: 'Admin', 
    email: 'sarah.j@hotel.com', 
    phone: '(555) 456-7890', 
    dateJoined: '2022-03-12', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 5, 
    name: 'Michael Brown', 
    role: 'Waiter', 
    email: 'michael.b@hotel.com', 
    phone: '(555) 567-8901', 
    dateJoined: '2023-10-05', 
    status: 'Inactive', 
    avatar: null 
  },
  { 
    id: 6, 
    name: 'Lisa Wong', 
    role: 'Chef', 
    email: 'lisa.wong@hotel.com', 
    phone: '(555) 678-9012', 
    dateJoined: '2023-01-19', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 7, 
    name: 'Robert Davis', 
    role: 'Cashier', 
    email: 'robert.d@hotel.com', 
    phone: '(555) 789-0123', 
    dateJoined: '2022-09-30', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 8, 
    name: 'Jennifer Lee', 
    role: 'Waiter', 
    email: 'jennifer.l@hotel.com', 
    phone: '(555) 890-1234', 
    dateJoined: '2023-05-17', 
    status: 'Inactive', 
    avatar: null 
  },
  { 
    id: 9, 
    name: 'Daniel Wilson', 
    role: 'Admin', 
    email: 'daniel.w@hotel.com', 
    phone: '(555) 901-2345', 
    dateJoined: '2022-06-22', 
    status: 'Active', 
    avatar: null 
  },
  { 
    id: 10, 
    name: 'Emily Garcia', 
    role: 'Chef', 
    email: 'emily.g@hotel.com', 
    phone: '(555) 012-3456', 
    dateJoined: '2023-08-09', 
    status: 'Active', 
    avatar: null 
  }
];

// Role configuration with colors
const roleConfig = {
  'Waiter': { color: 'primary' },
  'Chef': { color: 'error' },
  'Cashier': { color: 'success' },
  'Admin': { color: 'warning' },
  'Manager': { color: 'info' }
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState(initialStaff);
  const [filteredStaff, setFilteredStaff] = useState(initialStaff);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formError, setFormError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Initial form state
  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    role: 'Waiter',
    status: 'Active',
    password: '',
    confirmPassword: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // Apply filters when role filter or search query changes
  useEffect(() => {
    let results = staffMembers;
    
    // Apply role filter
    if (roleFilter !== 'All') {
      results = results.filter(staff => staff.role === roleFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(staff => 
        staff.name.toLowerCase().includes(lowercaseQuery) || 
        staff.email.toLowerCase().includes(lowercaseQuery) ||
        staff.phone.includes(searchQuery)
      );
    }
    
    setFilteredStaff(results);
    setPage(0);
  }, [roleFilter, searchQuery, staffMembers]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (staff = null) => {
    if (staff) {
      setCurrentStaff(staff);
      setFormData({ 
        ...staff,
        password: '',
        confirmPassword: ''
      });
    } else {
      setCurrentStaff(null);
      setFormData(emptyForm);
    }
    setFormError({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentStaff(null);
    setFormData(emptyForm);
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user changes it
    if (formError[name]) {
      setFormError({
        ...formError,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone)) errors.phone = 'Format: (555) 123-4567';
    
    // Password validation only for new staff members
    if (!currentStaff) {
      if (!formData.password) errors.password = 'Password is required for new staff';
      else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleSaveStaff = () => {
    if (!validateForm()) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (currentStaff) {
      // Update existing staff
      const updatedStaff = staffMembers.map(staff => 
        staff.id === currentStaff.id ? { ...formData, dateJoined: staff.dateJoined } : staff
      );
      setStaffMembers(updatedStaff);
      setSnackbar({ open: true, message: 'Staff information updated successfully', severity: 'success' });
    } else {
      // Add new staff
      const newStaff = {
        ...formData,
        id: staffMembers.length > 0 ? Math.max(...staffMembers.map(staff => staff.id)) + 1 : 1,
        dateJoined: today,
        avatar: null
      };
      setStaffMembers([...staffMembers, newStaff]);
      setSnackbar({ open: true, message: 'New staff member added successfully', severity: 'success' });
    }
    
    handleCloseDialog();
  };

  const handleToggleStatus = (id) => {
    const updatedStaff = staffMembers.map(staff => 
      staff.id === id ? { ...staff, status: staff.status === 'Active' ? 'Inactive' : 'Active' } : staff
    );
    setStaffMembers(updatedStaff);
    
    const targetStaff = updatedStaff.find(staff => staff.id === id);
    setSnackbar({ 
      open: true, 
      message: `Staff member ${targetStaff.status === 'Active' ? 'activated' : 'deactivated'}`, 
      severity: targetStaff.status === 'Active' ? 'success' : 'info' 
    });
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      const updatedStaff = staffMembers.filter(staff => staff.id !== id);
      setStaffMembers(updatedStaff);
      setSnackbar({ open: true, message: 'Staff member removed', severity: 'warning' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="medium">
          Hotel Staff
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Staff
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="All">All Roles</MenuItem>
                  <MenuItem value="Waiter">Waiter</MenuItem>
                  <MenuItem value="Chef">Chef</MenuItem>
                  <MenuItem value="Cashier">Cashier</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Staff Table */}
      <Paper elevation={3} sx={{ width: '100%', mb: 3 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Staff Member</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Contact Information</TableCell>
                <TableCell>Date Joined</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((staff) => (
                    <TableRow key={staff.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            src={staff.avatar} 
                            alt={staff.name}
                            sx={{ 
                              bgcolor: staff.status === 'Active' ? 'primary.main' : 'text.disabled',
                              mr: 2 
                            }}
                          >
                            {getInitials(staff.name)}
                          </Avatar>
                          <Typography variant="body1">{staff.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={staff.role} 
                          color={roleConfig[staff.role]?.color || 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{staff.email}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{staff.phone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(staff.dateJoined)}</TableCell>
                      <TableCell align="center">
                        <Switch 
                          checked={staff.status === 'Active'}
                          onChange={() => handleToggleStatus(staff.id)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenDialog(staff)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteStaff(staff.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" py={2}>
                      {searchQuery || roleFilter !== 'All' 
                        ? 'No staff members match your filters' 
                        : 'No staff members found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStaff.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentStaff ? `Edit Staff: ${currentStaff.name}` : 'Add New Staff Member'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                error={!!formError.name}
                helperText={formError.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email Address"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                error={!!formError.email}
                helperText={formError.email}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                error={!!formError.phone}
                helperText={formError.phone || "Format: (555) 123-4567"}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Waiter">Waiter</MenuItem>
                  <MenuItem value="Chef">Chef</MenuItem>
                  <MenuItem value="Cashier">Cashier</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {!currentStaff && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!formError.password}
                    helperText={formError.password || "Minimum 8 characters"}
                    required={!currentStaff}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={!!formError.confirmPassword}
                    helperText={formError.confirmPassword}
                    required={!currentStaff}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset" variant="standard">
                    <Box display="flex" alignItems="center">
                      <Switch
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Show password
                      </Typography>
                    </Box>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSaveStaff} variant="contained" color="primary">
            {currentStaff ? 'Update Staff' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StaffManagement;