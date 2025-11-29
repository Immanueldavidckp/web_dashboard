import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Paper,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  PowerSettingsNew,
  LocationOn,
  Schedule,
  Speed,
  TrendingUp,
  Refresh,
  ArrowBack,
  Settings,
  Info
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const TowerLightPage = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    averageRegulator: 0,
    totalRuntime: 0
  });

  useEffect(() => {
    fetchTowerLights();
  }, [deviceId]);

  const fetchTowerLights = async () => {
    try {
      setLoading(true);
      
      if (deviceId) {
        // Fetch specific device details
        const device = await deviceService.getDeviceById(deviceId);
        setSelectedDevice(device);
        
        // Fetch device history
        const history = await deviceService.getDeviceHistory(deviceId, 50);
        setDeviceHistory(history);
      } else {
        // Fetch all tower lights
        const towerLights = await deviceService.getDevicesByCategory('tower-light');
        setDevices(towerLights);
        
        // Calculate statistics
        const totalDevices = towerLights.length;
        const activeDevices = towerLights.filter(d => d.status === 'ON').length;
        const totalRegulator = towerLights.reduce((sum, d) => sum + (d.regulator_level || 0), 0);
        const averageRegulator = totalDevices > 0 ? Math.round(totalRegulator / totalDevices) : 0;
        
        setStats({
          totalDevices,
          activeDevices,
          averageRegulator,
          totalRuntime: totalDevices * 120
        });
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch tower lights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'ON' ? '#4caf50' : '#9e9e9e';
  };

  const getRegulatorColor = (level) => {
    if (level >= 75) return '#4caf50';
    if (level >= 50) return '#ff9800';
    if (level >= 25) return '#ff5722';
    return '#f44336';
  };

  // If loading
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // If error
  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Box>
    );
  }

  // DETAILED DEVICE VIEW
  if (deviceId && selectedDevice) {
    // Prepare historical data for charts
    const historyLabels = deviceHistory.slice(0, 10).reverse().map((d, i) => 
      new Date(d.timestamp).toLocaleTimeString()
    );
    
    const regulatorHistory = deviceHistory.slice(0, 10).reverse().map(d => d.regulator_level || 0);

    const historicalChartData = {
      labels: historyLabels,
      datasets: [{
        label: 'Regulator Level (%)',
        data: regulatorHistory,
        fill: true,
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderColor: 'rgb(255, 193, 7)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(255, 193, 7)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };

    return (
      <Box p={3}>
        {/* Header with Back Button */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate('/tower-lights')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <LightbulbIcon sx={{ fontSize: 48, mr: 2, color: '#FFC107' }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="700">
                {selectedDevice.device_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tower Light Detailed View
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip 
              label={selectedDevice.status || 'Unknown'}
              color={selectedDevice.status === 'ON' ? 'success' : 'default'}
              size="large"
              icon={<PowerSettingsNew />}
              sx={{ fontSize: '1rem', py: 2, px: 1 }}
            />
          </Box>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Current Status
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  {selectedDevice.status || 'Unknown'}
                </Typography>
                <PowerSettingsNew sx={{ fontSize: 40, opacity: 0.3, mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Regulator Level
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  {selectedDevice.regulator_level || 0}%
                </Typography>
                <Speed sx={{ fontSize: 40, opacity: 0.3, mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Location
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {selectedDevice.location ? 
                    `${selectedDevice.location.lat?.toFixed(4)}, ${selectedDevice.location.lon?.toFixed(4)}` : 
                    'N/A'}
                </Typography>
                <LocationOn sx={{ fontSize: 40, opacity: 0.3, mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {new Date(selectedDevice.timestamp).toLocaleString()}
                </Typography>
                <Schedule sx={{ fontSize: 40, opacity: 0.3, mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Device Information */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="600" display="flex" alignItems="center">
                  <Info sx={{ mr: 1 }} />
                  Device Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Device ID
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedDevice.device_id}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Machine Details
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedDevice.machine_details || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Device Type
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      Tower Light
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Category
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      TL
                    </Typography>
                  </Grid>

                  {selectedDevice.location && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Latitude
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {selectedDevice.location.lat?.toFixed(6)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Longitude
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {selectedDevice.location.lon?.toFixed(6)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Current Regulator Level
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                  <Typography 
                    variant="h1" 
                    fontWeight="700" 
                    color={getRegulatorColor(selectedDevice.regulator_level || 0)}
                    sx={{ mb: 2 }}
                  >
                    {selectedDevice.regulator_level || 0}%
                  </Typography>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedDevice.regulator_level || 0}
                    sx={{ 
                      width: '100%',
                      height: 20, 
                      borderRadius: 10,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRegulatorColor(selectedDevice.regulator_level || 0),
                        borderRadius: 10
                      }
                    }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {selectedDevice.regulator_level >= 75 ? 'Excellent' :
                     selectedDevice.regulator_level >= 50 ? 'Good' :
                     selectedDevice.regulator_level >= 25 ? 'Fair' : 'Low'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Historical Data Chart */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Regulator Level History (Last 10 Records)
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box height={300}>
                  <Line 
                    data={historicalChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: 'top' }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true,
                          max: 100,
                          title: { display: true, text: 'Regulator Level (%)' }
                        },
                        x: {
                          title: { display: true, text: 'Time' }
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Historical Data Table */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Device History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Timestamp</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Regulator Level</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deviceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No historical data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    deviceHistory.slice(0, 20).map((record, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status || 'Unknown'}
                            color={record.status === 'ON' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontWeight="600" color={getRegulatorColor(record.regulator_level || 0)}>
                              {record.regulator_level || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {record.location ? 
                            `${record.location.lat?.toFixed(4)}, ${record.location.lon?.toFixed(4)}` : 
                            'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // OVERVIEW PAGE - List all Tower Lights
  const regulatorChartData = {
    labels: ['10%', '25%', '50%', '75%', '100%'],
    datasets: [{
      label: 'Devices by Regulator Level',
      data: [
        devices.filter(d => d.regulator_level === 10).length,
        devices.filter(d => d.regulator_level === 25).length,
        devices.filter(d => d.regulator_level === 50).length,
        devices.filter(d => d.regulator_level === 75).length,
        devices.filter(d => d.regulator_level === 100).length
      ],
      backgroundColor: [
        'rgba(244, 67, 54, 0.7)',
        'rgba(255, 87, 34, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(156, 39, 176, 0.7)',
        'rgba(76, 175, 80, 0.7)'
      ],
      borderColor: [
        'rgb(244, 67, 54)',
        'rgb(255, 87, 34)',
        'rgb(255, 152, 0)',
        'rgb(156, 39, 176)',
        'rgb(76, 175, 80)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  const statusChartData = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [stats.activeDevices, stats.totalDevices - stats.activeDevices],
      backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(158, 158, 158, 0.8)'],
      borderColor: ['rgb(76, 175, 80)', 'rgb(158, 158, 158)'],
      borderWidth: 3
    }]
  };

  const runtimeChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Average Runtime (hours)',
      data: [8, 9, 7, 10, 8, 6, 5],
      fill: true,
      backgroundColor: 'rgba(255, 193, 7, 0.2)',
      borderColor: 'rgb(255, 193, 7)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(255, 193, 7)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  return (
    <Box p={3}>
      {/* Header Section */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center">
          <LightbulbIcon sx={{ fontSize: 48, mr: 2, color: '#FFC107' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700">
              Tower Light Monitoring
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time monitoring and analytics
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchTowerLights} color="primary" size="large">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Devices
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {stats.totalDevices}
                  </Typography>
                </Box>
                <LightbulbIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Now
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {stats.activeDevices}
                  </Typography>
                </Box>
                <PowerSettingsNew sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Avg Regulator
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {stats.averageRegulator}%
                  </Typography>
                </Box>
                <Speed sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Runtime
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {stats.totalRuntime}h
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Status Distribution
              </Typography>
              <Box height={250} display="flex" alignItems="center" justifyContent="center">
                <Doughnut 
                  data={statusChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Regulator Level Distribution
              </Typography>
              <Box height={250}>
                <Bar 
                  data={regulatorChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Weekly Runtime Trend
              </Typography>
              <Box height={250}>
                <Line 
                  data={runtimeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Device Cards */}
      {devices.length === 0 ? (
        <Alert severity="info" variant="filled" sx={{ borderRadius: 2 }}>
          No tower lights found. Add a tower light device (TL_XXX) to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {devices.map((device) => (
            <Grid item xs={12} sm={6} md={4} key={device.device_id}>
              <Card 
                elevation={4}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  },
                  borderTop: `4px solid ${getStatusColor(device.status)}`
                }}
                onClick={() => navigate(`/tower-lights/${device.device_id}`)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="700">
                      {device.device_id}
                    </Typography>
                    <Chip 
                      label={device.status || 'Unknown'}
                      color={device.status === 'ON' ? 'success' : 'default'}
                      size="small"
                      icon={<PowerSettingsNew />}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary" fontWeight="600">
                        Regulator Level
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color={getRegulatorColor(device.regulator_level || 0)}>
                        {device.regulator_level || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={device.regulator_level || 0}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getRegulatorColor(device.regulator_level || 0),
                          borderRadius: 5
                        }
                      }}
                    />
                  </Box>

                  {device.location && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                        {device.location.lat?.toFixed(4)}, {device.location.lon?.toFixed(4)}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center">
                    <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(device.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TowerLightPage;