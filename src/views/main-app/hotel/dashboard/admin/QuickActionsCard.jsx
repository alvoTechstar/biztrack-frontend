// src/components/QuickActionsCard.jsx
import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import { Menu as MenuIcon, BarChart as BarChartIcon, PersonAdd as PersonAddIcon, Warning as WarningIcon } from '@mui/icons-material';

const QuickActionsCard = ({ onManageMenu, onViewSales, onAddStaff, onManageInventory }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>Quick Actions</Typography>
      <Stack spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<MenuIcon />}
          sx={{ justifyContent: 'flex-start', py: 1 }}
          onClick={onManageMenu}
        >
          Manage Menu
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<BarChartIcon />}
          sx={{ justifyContent: 'flex-start', py: 1 }}
          onClick={onViewSales}
        >
          View Sales Reports
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PersonAddIcon />}
          sx={{ justifyContent: 'flex-start', py: 1 }}
          onClick={onAddStaff}
        >
          Add New Staff
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<WarningIcon />}
          sx={{ justifyContent: 'flex-start', py: 1 }}
          onClick={onManageInventory}
        >
          Manage Inventory
        </Button>
      </Stack>
    </Paper>
  );
};

export default QuickActionsCard;