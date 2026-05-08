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
  Switch,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  FormHelperText,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Sample data for menu items
const initialMenuItems = [
  { id: 1, name: 'Grilled Salmon', category: 'Food', price: 24.99, description: 'Fresh salmon fillet grilled to perfection with herbs', available: true, image: 'salmon.jpg' },
  { id: 2, name: 'Caesar Salad', category: 'Food', price: 12.50, description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan', available: true, image: 'caesar.jpg' },
  { id: 3, name: 'Margarita', category: 'Beverage', price: 9.99, description: 'Classic cocktail with tequila, lime juice, and triple sec', available: true, image: 'margarita.jpg' },
  { id: 4, name: 'Chocolate Cake', category: 'Food', price: 8.50, description: 'Rich chocolate cake with ganache frosting', available: false, image: 'chocolate-cake.jpg' },
  { id: 5, name: 'Espresso', category: 'Beverage', price: 3.99, description: 'Strong Italian coffee brew', available: true, image: 'espresso.jpg' },
  { id: 6, name: 'Club Sandwich', category: 'Food', price: 14.75, description: 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato', available: true, image: 'club-sandwich.jpg' },
  { id: 7, name: 'Red Wine', category: 'Beverage', price: 7.50, description: 'House red wine, served by the glass', available: true, image: 'red-wine.jpg' },
  { id: 8, name: 'Beef Burger', category: 'Food', price: 16.99, description: 'Angus beef patty with cheese, lettuce, tomato, and special sauce', available: true, image: 'burger.jpg' },
  { id: 9, name: 'Mojito', category: 'Beverage', price: 8.99, description: 'Refreshing cocktail with white rum, mint, lime, and soda water', available: true, image: 'mojito.jpg' },
  { id: 10, name: 'Fruit Platter', category: 'Food', price: 10.50, description: 'Assortment of seasonal fresh fruits', available: false, image: 'fruit-platter.jpg' },
];

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [filteredItems, setFilteredItems] = useState(initialMenuItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formError, setFormError] = useState({});

  // Initial form state
  const emptyForm = {
    name: '',
    category: 'Food',
    price: '',
    description: '',
    available: true,
    image: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // Apply filters when category filter or search query changes
  useEffect(() => {
    let results = menuItems;
    
    // Apply category filter
    if (categoryFilter !== 'All') {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) || 
        item.description.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setFilteredItems(results);
    setPage(0);
  }, [categoryFilter, searchQuery, menuItems]);

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
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price) errors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) 
      errors.price = 'Price must be a positive number';
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = () => {
    if (!validateForm()) return;
    
    const numericPrice = parseFloat(formData.price);
    
    if (currentItem) {
      // Update existing item
      const updatedItems = menuItems.map(item => 
        item.id === currentItem.id ? { ...formData, price: numericPrice } : item
      );
      setMenuItems(updatedItems);
      setSnackbar({ open: true, message: 'Menu item updated successfully', severity: 'success' });
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1,
        price: numericPrice
      };
      setMenuItems([...menuItems, newItem]);
      setSnackbar({ open: true, message: 'Menu item added successfully', severity: 'success' });
    }
    
    handleCloseDialog();
  };

  const handleToggleAvailability = (id) => {
    const updatedItems = menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    );
    setMenuItems(updatedItems);
    setSnackbar({ 
      open: true, 
      message: 'Item availability updated', 
      severity: 'info' 
    });
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = menuItems.filter(item => item.id !== id);
      setMenuItems(updatedItems);
      setSnackbar({ open: true, message: 'Menu item deleted', severity: 'warning' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="medium">
          Manage Hotel Menu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
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
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Beverage">Beverage</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Menu Items Table */}
      <Paper elevation={3} sx={{ width: '100%', mb: 3 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Availability</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.category} 
                          color={item.category === 'Food' ? 'primary' : 'secondary'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography noWrap>{item.description}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Switch 
                          checked={item.available}
                          onChange={() => handleToggleAvailability(item.id)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
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
                      No menu items found
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
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Beverage">Beverage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                fullWidth
                value={formData.price}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!formError.price}
                helperText={formError.price}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formError.description}
                helperText={formError.description}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="image"
                label="Image URL"
                fullWidth
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Enter image URL or file path"
              />
              <FormHelperText>Optional - Image reference for the menu item</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" variant="standard">
                <Box display="flex" alignItems="center">
                  <Switch
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                    color="success"
                  />
                  <Typography variant="body1">
                    {formData.available ? 'Available on menu' : 'Not available'}
                  </Typography>
                </Box>
              </FormControl>
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

export default MenuManagement;