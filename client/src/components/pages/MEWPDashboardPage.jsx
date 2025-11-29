import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deviceService from '../../services/deviceService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const MEWPDashboardPage = () => {
  const { variant } = useParams();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(variant?.toUpperCase() || 'DD');

  const variantConfig = {
    DD: { name: 'D Series Diesel', color: '#2196F3' },
    DB: { name: 'D Series Battery', color: '#4CAF50' },
    MD: { name: 'M Series Diesel', color: '#9C27B0' },
    MB: { name: 'M Series Battery', color: '#AB47BC' },
    TD: { name: 'T Series Diesel', color: '#F44336' },
    TB: { name: 'T Series Battery', color: '#EF5350' }
  };

  useEffect(() => {
    if (variant) {
      setSelectedVariant(variant.toUpperCase());
    }
  }, [variant]);

  useEffect(() => {
    fetchMEWPDevices(selectedVariant);
  }, [selectedVariant]);

  const fetchMEWPDevices = async (variantCode) => {
    try {
      setLoading(true);
      const mewpDevices = await deviceService.getDevicesByVariant(variantCode);
      setDevices(mewpDevices);
      setError(null);
    } catch (err) {
      setError('Failed to fetch MEWP devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (event, newVariant) => {
    setSelectedVariant(newVariant);
    navigate(`/mewp/${newVariant.toLowerCase()}`);
  };

  const getTopParameters = (variantCode) => {
    const params = deviceService.getVariantParameters(variantCode);
    return params.slice(0, 6);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ConstructionIcon sx={{ fontSize: 40, mr: 2, color: variantConfig[selectedVariant]?.color || '#2196F3' }} />
        <Typography variant="h4" component="h1">
          MEWP {variantConfig[selectedVariant]?.name || 'Dashboard'}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedVariant} onChange={handleVariantChange} variant="scrollable" scrollButtons="auto">
          {Object.keys(variantConfig).map((key) => (
            <Tab key={key} label={variantConfig[key].name} value={key} />
          ))}
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {devices.length === 0 ? (
        <Alert severity="info">
          No {variantConfig[selectedVariant]?.name} devices found. Add a device to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {devices.map((device) => {
            const topParams = getTopParameters(selectedVariant);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={device.device_id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 6 },
                    borderTop: `4px solid ${variantConfig[selectedVariant]?.color || '#2196F3'}`
                  }}
                  onClick={() => navigate(`/devices/${device.device_id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {device.device_id}
                    </Typography>
                    
                    <Chip 
                      label={`${selectedVariant} Series`}
                      size="small"
                      sx={{ 
                        mb: 2,
                        backgroundColor: variantConfig[selectedVariant]?.color || '#2196F3',
                        color: 'white'
                      }}
                    />

                    {topParams.map(param => (
                      <Box 
                        key={param}
                        display="flex" 
                        justifyContent="space-between" 
                        mb={1}
                        sx={{ borderBottom: '1px solid #f0f0f0', pb: 0.5 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {deviceService.formatParameterName(param)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {device[param] !== undefined 
                            ? deviceService.formatParameterValue(param, device[param])
                            : 'N/A'
                          }
                        </Typography>
                      </Box>
                    ))}

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

export default MEWPDashboardPage;
