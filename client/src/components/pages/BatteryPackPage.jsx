import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import deviceService from '../../services/deviceService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

const BatteryPackPage = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatteryPacks();
  }, []);

  const fetchBatteryPacks = async () => {
    try {
      setLoading(true);
      const batteryPacks = await deviceService.getDevicesByCategory('battery-pack');
      setDevices(batteryPacks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch battery packs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (voltage) => {
    if (voltage >= 12) return 'success';
    if (voltage >= 11) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <BatteryChargingFullIcon sx={{ fontSize: 40, mr: 2, color: '#4CAF50' }} />
        <Typography variant="h4" component="h1">
          Battery Pack Monitoring
        </Typography>
      </Box>

      {devices.length === 0 ? (
        <Alert severity="info">No battery packs found. Add a battery pack device to get started.</Alert>
      ) : (
        <Grid container spacing={3}>
          {devices.map((device) => {
            const voltage = device.battery_monitor || 0;
            const batteryPercent = Math.min(100, Math.max(0, ((voltage - 10) / 2.6) * 100));
            
            return (
              <Grid item xs={12} sm={6} md={4} key={device.device_id}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                  onClick={() => navigate(`/devices/${device.device_id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {device.device_id}
                    </Typography>
                    
                    <Box my={3}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Voltage
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color={getBatteryColor(voltage)}>
                          {voltage.toFixed(2)} V
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={batteryPercent} 
                        color={getBatteryColor(voltage)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      
                      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        {batteryPercent.toFixed(0)}% Capacity
                      </Typography>
                    </Box>

                    {device.location && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body2" fontSize="0.75rem">
                          {device.location.lat?.toFixed(4)}, {device.location.lon?.toFixed(4)}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                      Last updated: {new Date(device.timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default BatteryPackPage;
