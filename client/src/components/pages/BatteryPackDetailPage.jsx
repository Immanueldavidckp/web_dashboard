import React from 'react';
import { Box, Typography } from '@mui/material';

const BatteryPackDetailPage = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" component="h1">
        Battery Pack Detail Page
      </Typography>
      <Typography variant="body1">
        This is the detail page for a specific Battery Pack.
      </Typography>
    </Box>
  );
};

export default BatteryPackDetailPage;