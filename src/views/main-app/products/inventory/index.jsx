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
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Sample data for inventory items
const initialInventory = [
  { 
    id: 1, 
    name: 'Rice', 
    category: 'Grains', 
    quantity: 45, 
    threshold: 20,
    unit: 'kg', 
    supplier: 'Global Foods Inc.',
    lastRestocked: '2025-04-10',
    notes: 'Basmati rice - premium quality'
  },
  { 
    id: 2, 
    name: 'Flour', 
    category: 'Baking', 
    quantity: 12, 
    threshold: 15,
    unit: 'kg', 
    supplier: 'Baker\'s Supplies',
    lastRestocked: '2025-04-05',
    notes: 'All-purpose flour'
  },
  { 
    id: 3, 
    name: 'Olive Oil', 
    category: 'Oils', 
    quantity: 8, 
    threshold: 10,
    unit: 'L', 
    supplier: 'Mediterranean Imports',
    lastRestocked: '2025-04-15',
    notes: 'Extra virgin olive oil'
  },
  { 
    id: 4, 
    name: 'Chicken', 
    category: 'Meat', 
    quantity: 25, 
    threshold: 20,
    unit: 'kg', 
    supplier: 'Fresh Farms',
    lastRestocked: '2025-04-20',
    notes: 'Boneless, skinless chicken breast'
  },
  { 
    id: 5, 
    name: 'Tomatoes', 
    category: 'Produce', 
    quantity: 5, 
    threshold: 10,
    unit: 'kg', 
    supplier: 'Local Farm Co-op',
    lastRestocked: '2025-04-18',
    notes: 'Roma tomatoes'
  },
  { 
    id: 6, 
    name: 'Coffee Beans', 
    category: 'Beverages', 
    quantity: 6, 
    threshold: 8,
    unit: 'kg', 
    supplier: 'Morning Brew Supply',
    lastRestocked: '2025-04-12',
    notes: 'Medium roast Arabica'
  },
  { 
    id: 7, 
    name: 'Sugar', 
    category: 'Baking', 
    quantity: 30, 
    threshold: 15,
    unit: 'kg', 
    supplier: 'Sweet Supplies Co.',
    lastRestocked: '2025-04-08',
    notes: 'Granulated white sugar'
  },
  { 
    id: 8, 
    name: 'Paper Napkins', 
    category: 'Supplies', 
    quantity: 12, 
    threshold: 20,
    unit: 'pcs', 
    supplier: 'Hotel Essentials',
    lastRestocked: '2025-04-05',
    notes: 'Standard white napkins, pack of 100'
  },
  { 
    id: 9, 
    name: 'Dish Soap', 
    category: 'Cleaning', 
    quantity: 15, 
    threshold: 10,
    unit: 'L', 
    supplier: 'Clean & Clear Products',
    lastRestocked: '2025-03-28',
    notes: 'Commercial grade dishwashing liquid'
  },
  { 
    id: 10, 
    name: 'Milk', 
    category: 'Dairy', 
    quantity: 18, 
    threshold: 20,
    unit: 'L', 
    supplier: 'Fresh Dairy Co.',
    lastRestocked: '2025-04-21',
    notes: 'Whole milk'
  }
];

// Category options
const categoryOptions = [
  'All',
  'Grains',
  'Baking',
  'Oils',
  'Meat',
  'Produce',
  'Beverages',
  'Dairy',
  'Supplies',
  'Cleaning'
];

// Unit options
const unitOptions = ['kg', 'L', 'pcs', 'g', 'mL', 'boxes', 'crates', 'bottles'];

const InventoryPage = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [filteredInventory, setFilteredInventory] = useState(initialInventory);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRestockDialog, setOpenRestockDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showLowStock, setShowLowStock] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formError, setFormError] = useState({});
  const [restockAmount, setRestockAmount] = useState('');

  // Initial form state
  const emptyForm = {
    name: '',
    category: '',
    quantity: '',
    threshold: '',
    unit: 'kg',
    supplier: '',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // Apply filters
  useEffect(() => {
    let results = inventory;
    
    // Apply low stock filter
    if (showLowStock) {
      results = results.filter(item => item.quantity < item.threshold);
    }
    
    // Apply category filter
    if (categoryFilter !== 'All') {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) || 
        item.supplier.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setFilteredInventory(results);
    setPage(0);
  }, [showLowStock, categoryFilter, searchQuery, inventory]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({ ...item });
    } else {
      setCurrentItem(null);
      setFormData(emptyForm);
    }
    setFormError({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
    setFormData(emptyForm);
  };

  const handleOpenRestockDialog = (item) => {
    setCurrentItem(item);
    setRestockAmount('');
    setFormError({});
    setOpenRestockDialog(true);
  };

  const handleCloseRestockDialog = () => {
    setOpenRestockDialog(false);
    setCurrentItem(null);
    setRestockAmount('');
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

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({
        ...formData,
        lastRestocked: formattedDate
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Item name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.quantity) errors.quantity = 'Quantity is required';
    else if (isNaN(formData.quantity) || parseFloat(formData.quantity) < 0) 
      errors.quantity = 'Quantity must be a positive number';
    
    if (!formData.threshold) errors.threshold = 'Low stock threshold is required';
    else if (isNaN(formData.threshold) || parseFloat(formData.threshold) < 0) 
      errors.threshold = 'Threshold must be a positive number';
    
    if (!formData.supplier.trim()) errors.supplier = 'Supplier name is required';
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRestockForm = () => {
    const errors = {};
    if (!restockAmount) errors.restockAmount = 'Restock amount is required';
    else if (isNaN(restockAmount) || parseFloat(restockAmount) <= 0) 
      errors.restockAmount = 'Amount must be a positive number';
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleSaveItem = () => {
    if (!validateForm()) return;
    
    const numericQuantity = parseFloat(formData.quantity);
    const numericThreshold = parseFloat(formData.threshold);
    
    if (currentItem) {
      // Update existing item
      const updatedInventory = inventory.map(item => 
        item.id === currentItem.id ? { 
          ...formData, 
          quantity: numericQuantity,
          threshold: numericThreshold
        } : item
      );
      setInventory(updatedInventory);
      setSnackbar({ open: true, message: 'Inventory item updated successfully', severity: 'success' });
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: inventory.length > 0 ? Math.max(...inventory.map(item => item.id)) + 1 : 1,
        quantity: numericQuantity,
        threshold: numericThreshold
      };
      setInventory([...inventory, newItem]);
      setSnackbar({ open: true, message: 'New inventory item added successfully', severity: 'success' });
    }
    
    handleCloseDialog();
  };

  const handleRestock = () => {
    if (!validateRestockForm()) return;
    
    const amount = parseFloat(restockAmount);
    const today = new Date().toISOString().split('T')[0];
    
    const updatedInventory = inventory.map(item => 
      item.id === currentItem.id ? { 
        ...item, 
        quantity: parseFloat(item.quantity) + amount,
        lastRestocked: today
      } : item
    );
    
    setInventory(updatedInventory);
    setSnackbar({ 
      open: true, 
      message: `${currentItem.name} restocked with ${amount} ${currentItem.unit}`, 
      severity: 'success' 
    });
    
    handleCloseRestockDialog();
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
      setSnackbar({ open: true, message: 'Inventory item deleted', severity: 'warning' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isLowStock = (item) => {
    return item.quantity < item.threshold;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="medium">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Inventory Item
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={showLowStock} 
                    onChange={(e) => setShowLowStock(e.target.checked)}
                    color="warning"
                  />
                } 
                label="Show Low Stock Only" 
              />
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Table */}
      <Paper elevation={3} sx={{ width: '100%', mb: 3 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Last Restocked</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow 
                      key={item.id} 
                      hover
                      sx={{ 
                        bgcolor: isLowStock(item) ? 'rgba(255, 152, 0, 0.08)' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {isLowStock(item) && (
                            <Tooltip title="Low Stock">
                              <WarningIcon 
                                color="warning" 
                                fontSize="small" 
                                sx={{ mr: 1 }} 
                              />
                            </Tooltip>
                          )}
                          <Typography fontWeight={isLowStock(item) ? 'medium' : 'normal'}>
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.category} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight={isLowStock(item) ? 'bold' : 'normal'}
                          color={isLowStock(item) ? 'warning.main' : 'inherit'}
                        >
                          {item.quantity} {item.unit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Threshold: {item.threshold} {item.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{formatDate(item.lastRestocked)}</TableCell>
                      <TableCell align="center">
                        <Box>
                          <Tooltip title="Restock">
                            <IconButton 
                              color="success" 
                              onClick={() => handleOpenRestockDialog(item)}
                              size="small"
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenDialog(item)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteItem(item.id)}
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
                      No inventory items found
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
          count={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentItem ? `Edit Item: ${currentItem.name}` : 'Add New Inventory Item'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Item Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                error={!!formError.name}
                helperText={formError.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formError.category} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleInputChange}
                >
                  {categoryOptions.filter(cat => cat !== 'All').map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formError.category && (
                  <FormHelperText>{formError.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={handleInputChange}
                error={!!formError.quantity}
                helperText={formError.quantity}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.unit}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="threshold"
                label="Low Stock Threshold"
                type="number"
                fullWidth
                value={formData.threshold}
                onChange={handleInputChange}
                error={!!formError.threshold}
                helperText={formError.threshold}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  label="Unit"
                  onChange={handleInputChange}
                >
                  {unitOptions.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="supplier"
                label="Supplier"
                fullWidth
                value={formData.supplier}
                onChange={handleInputChange}
                error={!!formError.supplier}
                helperText={formError.supplier}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Restocked"
                  value={new Date(formData.lastRestocked)}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      required: true 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Optional notes about this inventory item"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" color="primary">
            {currentItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={openRestockDialog} onClose={handleCloseRestockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Restock {currentItem?.name}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box py={1}>
            <Typography variant="body1" mb={2}>
              Current quantity: {currentItem?.quantity} {currentItem?.unit}
            </Typography>
            
            <TextField
              autoFocus
              label="Restock Amount"
              type="number"
              fullWidth
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              error={!!formError.restockAmount}
              helperText={formError.restockAmount}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {currentItem?.unit}
                  </InputAdornment>
                ),
              }}
            />
            
            {!formError.restockAmount && restockAmount && !isNaN(restockAmount) && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                New quantity will be: {parseFloat(currentItem?.quantity) + parseFloat(restockAmount)} {currentItem?.unit}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseRestockDialog} color="inherit">Cancel</Button>
          <Button onClick={handleRestock} variant="contained" color="success">
            Restock Item
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

export default InventoryPage;