import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';

const countriesWithCities = {
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu'],
  USA: ['New York', 'Los Angeles', 'Chicago'],
  // Replace with API data for production
};

const currencyOptions = ['USD', 'KES'];

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    merchantCode: '',
    domain: '',
    orderId: '',
    transferReason: '',
    amount: '',
    narration: '',
    currency: 'KES',
    customerId: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    country: '',
    city: '',
    postalCode: '',
    street: '',
    state: ''
  });

  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Populate cities based on selected country
    const newCities = countriesWithCities[formData.country] || [];
    setCities(newCities);
    setFormData((prev) => ({ ...prev, city: '' }));
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box p={4}>
      <Typography variant="h6" gutterBottom>Transaction Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Merchant Code" name="merchantCode" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Domain" name="domain" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Order ID" name="orderId" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Transfer Reason" name="transferReason" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Amount" name="amount" type="number" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Narration" name="narration" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              label="Currency"
            >
              {currencyOptions.map((cur) => (
                <MenuItem key={cur} value={cur}>{cur}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom mt={4}>Customer Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Customer ID" name="customerId" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="First Name" name="firstName" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Last Name" name="lastName" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Email" name="email" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Mobile" name="mobile" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              label="Country"
            >
              {Object.keys(countriesWithCities).map((country) => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              name="city"
              value={formData.city}
              onChange={handleChange}
              label="City"
              disabled={!formData.country}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Postal Code" name="postalCode" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Street" name="street" fullWidth onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="State" name="state" fullWidth onChange={handleChange} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionForm;
