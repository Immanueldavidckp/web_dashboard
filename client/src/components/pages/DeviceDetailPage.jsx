import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  Avatar,
  Tooltip,
  IconButton,
  Alert,
  AlertTitle,
  useTheme,
  Stack,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  Battery20,
  Battery50,
  Battery80,
  BatteryFull,
  Speed,
  Thermostat,
  AccessTime,
  Build,
  LocationOn,
  Refresh,
  Timeline,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  MyLocation,
  Sensors,
  Straighten,
  Rotate90DegreesCcw,
  DeviceThermostat,
  Satellite,
  SignalCellularAlt,
  OpenInNew
} from '@mui/icons-material';

const DeviceDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchDeviceDetails();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDeviceDetails, 30000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const fetchDeviceDetails = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/devices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const allDevices = data.items || [];
      
      const deviceRecords = allDevices.filter(d => d.device_id === deviceId);
      
      if (deviceRecords.length === 0) {
        throw new Error('Device not found');
      }
      
      const latestDevice = deviceRecords.sort((a, b) => {
        const timeA = new Date(a.on_off_time || a.timestamp || 0);
        const timeB = new Date(b.on_off_time || b.timestamp || 0);
        return timeB - timeA;
      })[0];
      
      setDevice(latestDevice);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error('Error fetching device details:', error);
      setError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getBatteryIcon = (battery) => {
    if (battery >= 80) return <BatteryFull sx={{ color: '#4caf50' }} />;
    if (battery >= 50) return <Battery80 sx={{ color: '#4caf50' }} />;
    if (battery >= 20) return <Battery50 sx={{ color: '#ff9800' }} />;
    return <Battery20 sx={{ color: '#f44336' }} />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'maintenance': return <Warning sx={{ color: '#ff9800' }} />;
      case 'inactive': return <ErrorIcon sx={{ color: '#9e9e9e' }} />;
      default: return null;
    }
  };

  const getBatteryColor = (battery) => {
    if (battery >= 80) return '#4caf50';
    if (battery >= 50) return '#8bc34a';
    if (battery >= 20) return '#ff9800';
    return '#f44336';
  };

  const getHealthStatus = () => {
    if (!device) return { status: 'Unknown', color: '#9e9e9e', score: 0 };
    
    const battery = device.battery_monitor || 0;
    const temp = device.engine_temp || 0;
    const rpm = device.engine_rpm || 0;
    
    let score = 100;
    
    if (battery < 20) score -= 30;
    else if (battery < 50) score -= 15;
    
    if (temp > 90) score -= 25;
    else if (temp > 80) score -= 10;
    
    if (rpm > 3000) score -= 15;
    
    if (score >= 80) return { status: 'Excellent', color: '#4caf50', score };
    if (score >= 60) return { status: 'Good', color: '#8bc34a', score };
    if (score >= 40) return { status: 'Fair', color: '#ff9800', score };
    return { status: 'Poor', color: '#f44336', score };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Device Data...</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !device) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/devices')} variant="contained">
          Back to Devices
        </Button>
        <Alert severity="error" sx={{ mt: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error ? error.message : 'Device not found'}
        </Alert>
      </Box>
    );
  }

  const staticMapUrl = device.location?.lat && device.location?.long
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${device.location.long - 0.01},${device.location.lat - 0.01},${device.location.long + 0.01},${device.location.lat + 0.01}&layer=mapnik&marker=${device.location.lat},${device.location.long}`
    : null;

  const healthStatus = getHealthStatus();

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header Section with Gradient Background */}
      <Card 
        sx={{ 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 3,
          boxShadow: 4
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate('/devices')}
                sx={{ 
                  color: 'white', 
                  mb: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Back to Fleet
              </Button>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {device.device_id}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {device.machine_details || 'Equipment Details'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Chip 
                  icon={getStatusIcon(device.status)}
                  label={device.status || 'Unknown'} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                />
                <Chip 
                  icon={<AccessTime />}
                  label={`Updated: ${lastUpdate.toLocaleTimeString()}`}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={fetchDeviceDetails}
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </Tooltip>
              <Box 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  p: 2, 
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {healthStatus.score}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Health Score
                </Typography>
                <Chip 
                  label={healthStatus.status}
                  size="small"
                  sx={{ 
                    mt: 1,
                    bgcolor: healthStatus.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Real-time Sensor Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: 3,
              border: `2px solid ${getBatteryColor(device.battery_monitor)}`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: `${getBatteryColor(device.battery_monitor)}20`, width: 56, height: 56 }}>
                  {getBatteryIcon(device.battery_monitor)}
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: getBatteryColor(device.battery_monitor) }}>
                    {device.battery_monitor?.toFixed(0) || '0'}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Battery Level
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={device.battery_monitor || 0}
                sx={{ 
                  mt: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getBatteryColor(device.battery_monitor),
                    borderRadius: 4
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #2196f3',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.2)', width: 56, height: 56 }}>
                  <Speed sx={{ color: '#2196f3', fontSize: 32 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                    {device.engine_rpm || '0'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Engine RPM
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="caption" color="success.main">
                  Normal Range
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #ff5722',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 87, 34, 0.2)', width: 56, height: 56 }}>
                  <Thermostat sx={{ color: '#ff5722', fontSize: 32 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
                    {device.engine_temp || '0'}°
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Engine Temperature
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {device.engine_temp > 80 ? (
                  <>
                    <TrendingUp fontSize="small" color="error" />
                    <Typography variant="caption" color="error.main">High Temperature</Typography>
                  </>
                ) : (
                  <>
                    <CheckCircle fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">Optimal</Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: 3,
              border: '2px solid #9c27b0',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(156, 39, 176, 0.2)', width: 56, height: 56 }}>
                  <Build sx={{ color: '#9c27b0', fontSize: 32 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    {device.oil_pressure || '0'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Oil Pressure (PSI)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <CheckCircle fontSize="small" color="success" />
                <Typography variant="caption" color="success.main">Normal</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Information Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline /> Device Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography color="text.secondary">Device ID:</Typography>
                  <Typography fontWeight="bold">{device.device_id}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography color="text.secondary">Machine Type:</Typography>
                  <Typography fontWeight="bold">{device.machine_details || 'N/A'}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography color="text.secondary">Status:</Typography>
                  <Chip 
                    label={device.status || 'Unknown'} 
                    color={getStatusColor(device.status)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography color="text.secondary">Last Update:</Typography>
                  <Typography fontWeight="bold">
                    {device.on_off_time ? new Date(device.on_off_time).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography color="text.secondary">Health Score:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight="bold" sx={{ color: healthStatus.color }}>
                      {healthStatus.score}/100
                    </Typography>
                    <Chip 
                      label={healthStatus.status}
                      size="small"
                      sx={{ bgcolor: healthStatus.color, color: 'white' }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sensors /> Sensor Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      borderRadius: 2,
                      border: '2px solid rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {device.battery_monitor?.toFixed(0) || '0'}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Battery</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                      borderRadius: 2,
                      border: '2px solid rgba(33, 150, 243, 0.3)'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                      {device.engine_rpm || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">RPM</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(255, 87, 34, 0.1)',
                      borderRadius: 2,
                      border: '2px solid rgba(255, 87, 34, 0.3)'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
                      {device.engine_temp || '0'}°C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Temperature</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(156, 39, 176, 0.1)',
                      borderRadius: 2,
                      border: '2px solid rgba(156, 39, 176, 0.3)'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {device.oil_pressure || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Oil (PSI)</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Map */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="error" /> Live Location
                </Typography>
                {device.location?.lat && device.location?.long && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNew />}
                    onClick={() => window.open(`https://www.google.com/maps?q=${device.location.lat},${device.location.long}`, '_blank')}
                  >
                    Open in Google Maps
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {device.location?.lat && device.location?.long ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<MyLocation />}
                      label={`Lat: ${device.location.lat?.toFixed(6)}`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip 
                      icon={<MyLocation />}
                      label={`Long: ${device.location.long?.toFixed(6)}`}
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 450, 
                      border: '2px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: 2
                    }}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={staticMapUrl}
                      allowFullScreen
                      title="Device Location"
                    />
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  <AlertTitle>Location Unavailable</AlertTitle>
                  GPS coordinates are not available for this device.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* MPU6050 Sensor Data */}
        {device.mpu6050 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sensors color="primary" /> MPU6050 Motion Sensor
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  {device.mpu6050.accel && (
                    <Grid item xs={12} md={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(33, 150, 243, 0.1)',
                          border: '2px solid rgba(33, 150, 243, 0.3)',
                          borderRadius: 2
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#2196f3' }}>
                              <Straighten />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                              Accelerometer
                            </Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                              <Typography color="text.secondary">X-Axis:</Typography>
                              <Typography fontWeight="bold">{device.mpu6050.accel.x?.toFixed(3) || 'N/A'} g</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                              <Typography color="text.secondary">Y-Axis:</Typography>
                              <Typography fontWeight="bold">{device.mpu6050.accel.y?.toFixed(3) || 'N/A'} g</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                              <Typography color="text.secondary">Z-Axis:</Typography>
                              <Typography fontWeight="bold">{device.mpu6050.accel.z?.toFixed(3) || 'N/A'} g</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  
                  {device.mpu6050.gyro && (
                    <Grid item xs={12} md={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(156, 39, 176, 0.1)',
                          border: '2px solid rgba(156, 39, 176, 0.3)',
                          borderRadius: 2
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#9c27b0' }}>
                              <Rotate90DegreesCcw />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                              Gyroscope
                            </Typography>
                          </Box>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                              <Typography color="text.secondary">X-Axis:</Typography>
                              <Typography fontWeight="bold">{device.mpu6050.gyro.x?.toFixed(2) || 'N/A'}°/s</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                              <Typography color="text.secondary">Y-Axis:</Typography>
                              <Typography fontWeight="bold">{device.mpu6050.gyro.y?.toFixed(2) || 'N/A'}°/s</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                              <Typography color="text.secondary">Z-Axis:</Typography>
                              <Typography fontWeight="bold">{device.mpu6050.gyro.z?.toFixed(2) || 'N/A'}°/s</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  
                  {device.mpu6050.temp !== undefined && (
                    <Grid item xs={12} md={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(255, 152, 0, 0.1)',
                          border: '2px solid rgba(255, 152, 0, 0.3)',
                          borderRadius: 2
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#ff9800' }}>
                              <DeviceThermostat />
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                              Sensor Temperature
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                              {device.mpu6050.temp?.toFixed(1) || 'N/A'}°C
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Internal sensor reading
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* GNSS Data */}
        {device.gnss && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Satellite color="info" /> GNSS Satellite Data
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  {device.gnss.satellites !== undefined && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(33, 150, 243, 0.1)',
                          border: '2px solid rgba(33, 150, 243, 0.3)',
                          textAlign: 'center',
                          p: 2
                        }}
                      >
                        <Avatar sx={{ bgcolor: '#2196f3', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
                          <Satellite sx={{ fontSize: 36 }} />
                        </Avatar>
                        <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                          {device.gnss.satellites}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                          Connected Satellites
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {device.gnss.accuracy !== undefined && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card 
                        sx={{ 
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          border: '2px solid rgba(76, 175, 80, 0.3)',
                          textAlign: 'center',
                          p: 2
                        }}
                      >
                        <Avatar sx={{ bgcolor: '#4caf50', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
                          <SignalCellularAlt sx={{ fontSize: 36 }} />
                        </Avatar>
                        <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {device.gnss.accuracy}m
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                          Position Accuracy
                        </Typography>
                      </Card>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      sx={{ 
                        bgcolor: 'rgba(156, 39, 176, 0.1)',
                        border: '2px solid rgba(156, 39, 176, 0.3)',
                        textAlign: 'center',
                        p: 2
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#9c27b0', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
                        <CheckCircle sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                        {device.gnss.satellites >= 4 ? 'ACTIVE' : 'WEAK'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        GPS Status
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default DeviceDetailPage;
