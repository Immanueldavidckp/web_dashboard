import React from 'react';
import { Box, Typography } from '@mui/material';

const MEWPDetailPage = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" component="h1">
        MEWP Detail Page
      </Typography>
      <Typography variant="body1">
        This is the detail page for a specific MEWP device.
      </Typography>
    </Box>
  );
};

export default MEWPDetailPage;