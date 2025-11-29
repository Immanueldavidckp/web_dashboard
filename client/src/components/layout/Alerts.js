import React, { useContext } from 'react';
import { Alert as MuiAlert } from '@mui/material';
import AlertContext from '../../context/AlertContext';

const Alerts = () => {
  const alertContext = useContext(AlertContext);

  return (
    alertContext.alerts.length > 0 &&
    alertContext.alerts.map(alert => (
      <MuiAlert key={alert.id} severity={alert.type} sx={{ mb: 2 }}>
        {alert.msg}
      </MuiAlert>
    ))
  );
};

export default Alerts;