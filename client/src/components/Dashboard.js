import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  useTheme,
  IconButton,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Avatar,
  Badge,
  Divider,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
  TableSortLabel,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Doughnut, 
  Bar, 
  Line,
  Radar,
  PolarArea
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler,
  RadialLinearScale
} from 'chart.js';

// Icons
import DevicesIcon from '@mui/icons-material/Devices';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SpeedIcon from '@mui/icons-material/Speed';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ConstructionIcon from '@mui/icons-material/Construction';

import deviceService from '../services/deviceService';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler,
  RadialLinearScale
);

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Dashboard data states
  const [deviceStats, setDeviceStats] = useState(null);
  const [fuelEfficiency, setFuelEfficiency] = useState(null);
  const [fleetHealth, setFleetHealth] = useState(null);
  const [downtime, setDowntime] = useState(null);
  const [equipmentBreakdown, setEquipmentBreakdown] = useState(null);
  const [batteryStats, setBatteryStats] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [equipmentComparison, setEquipmentComparison] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // UI states
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [orderBy, setOrderBy] = useState('device');
  const [order, setOrder] = useState('asc');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Optimized fetch function with background update support
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setUpdating(true);
      }
      
      setError(null);

      const [
        stats,
        fuel,
        health,
        dt,
        equipment,
        battery,
        usage,
        revenue,
        performance,
        comparison,
        location,
        alertsData,
        activity
      ] = await Promise.all([
        deviceService.getDeviceStats(),
        deviceService.getFuelEfficiency(),
        deviceService.getFleetHealth(),
        deviceService.getDowntime(),
        deviceService.getEquipmentBreakdown(),
        deviceService.getBatteryStats(),
        deviceService.getUsageData(),
        deviceService.getRevenueData(),
        deviceService.getPerformanceData(),
        deviceService.getEquipmentComparison(),
        deviceService.getLocationData(),
        deviceService.getAlerts(),
        deviceService.getRecentActivity()
      ]);

      setDeviceStats(stats);
      setFuelEfficiency(fuel);
      setFleetHealth(health);
      setDowntime(dt);
      setEquipmentBreakdown(equipment);
      setBatteryStats(battery);
      setUsageData(usage);
      setRevenueData(revenue);
      setPerformanceData(performance);
      setEquipmentComparison(comparison);
      setLocationData(location);
      setAlerts(alertsData);
      setRecentActivity(activity);
      
      setLastUpdate(new Date());
      
      if (!showLoading) {
        setSnackbar({ open: true, message: 'Dashboard updated successfully' });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection.');
      
      if (!showLoading) {
        setSnackbar({ open: true, message: 'Failed to update dashboard' });
      }
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Background auto-refresh every 30 seconds (without showing loading spinner)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchDashboardData(false);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExportClick = (event) => {
    setExportAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchor(null);
  };

  const handleExportPDF = () => {
    deviceService.exportToPDF({ deviceStats, recentActivity, startDate, endDate });
    handleExportClose();
  };

  const handleExportExcel = () => {
    deviceService.exportToExcel({ deviceStats, recentActivity, startDate, endDate });
    handleExportClose();
  };

  const handleExportCSV = () => {
    deviceService.exportToCSV(recentActivity, startDate, endDate);
    handleExportClose();
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '' });
  };

  // Show full-page loading only on initial load
  if (loading && !deviceStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column" gap={2}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error && !deviceStats) {
    return (
      <Box m={3}>
        <Alert severity="error" variant="filled">
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          {error}
          <Button color="inherit" onClick={() => fetchDashboardData(true)} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  // Chart configurations
  const fleetHealthChart = {
    labels: ['Good', 'Fair', 'Critical', 'Offline'],
    datasets: [{
      data: [
        fleetHealth?.good || 0,
        fleetHealth?.fair || 0,
        fleetHealth?.critical || 0,
        fleetHealth?.offline || 0
      ],
      backgroundColor: [
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 152, 0, 0.8)',
        'rgba(244, 67, 54, 0.8)',
        'rgba(158, 158, 158, 0.8)'
      ],
      borderWidth: 2
    }]
  };

  const batteryHealthChart = {
    labels: ['Good', 'Warning', 'Critical'],
    datasets: [{
      data: [
        batteryStats?.good || 0,
        batteryStats?.warning || 0,
        batteryStats?.critical || 0
      ],
      backgroundColor: [
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 152, 0, 0.8)',
        'rgba(244, 67, 54, 0.8)'
      ],
      borderWidth: 2
    }]
  };

  const usageChartData = usageData ? {
    labels: usageData.labels,
    datasets: [{
      label: 'Daily Usage (hours)',
      data: usageData.data,
      fill: true,
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      borderColor: 'rgb(33, 150, 243)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: 'rgb(33, 150, 243)'
    }]
  } : null;

  const revenueChartData = revenueData ? {
    labels: revenueData.labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueData.data,
      backgroundColor: 'rgba(76, 175, 80, 0.7)',
      borderColor: 'rgb(76, 175, 80)',
      borderWidth: 2,
      borderRadius: 8
    }]
  } : null;

  return (
    <Box p={3}>
      {/* Header with Last Update Time and Refresh Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="700">
            Dashboard Overview
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Typography variant="body2" color="text.secondary">
              {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Real-time monitoring and analytics'}
            </Typography>
            {updating && (
              <Chip 
                label="Updating..." 
                size="small" 
                color="primary" 
                icon={<CircularProgress size={12} color="inherit" />}
              />
            )}
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleManualRefresh} color="primary" disabled={updating}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleExportClick}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={handleExportPDF}>
              <ListItemIcon><PictureAsPdfIcon /></ListItemIcon>
              <ListItemText>Export to PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportExcel}>
              <ListItemIcon><TableChartIcon /></ListItemIcon>
              <ListItemText>Export to Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportCSV}>
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText>Export to CSV</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Box mb={3}>
          {alerts.map((alert, index) => (
            <Alert 
              key={index} 
              severity={alert.severity} 
              sx={{ mb: 1 }}
              icon={<WarningIcon />}
            >
              <AlertTitle>{alert.title}</AlertTitle>
              {alert.message} — <strong>{alert.time}</strong>
            </Alert>
          ))}
        </Box>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Total Devices */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Devices
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {deviceStats?.totalDevices || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon sx={{ fontSize: 20, mr: 0.5 }} />
                    <Typography variant="caption">
                      +{deviceStats?.trend || 0}% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <DevicesIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Devices */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Active Now
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {deviceStats?.active || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {deviceStats?.inactive || 0} inactive, {deviceStats?.maintenance || 0} in maintenance
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PowerSettingsNewIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Efficiency */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Avg Fuel Efficiency
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {fuelEfficiency?.average || 0}%
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon sx={{ fontSize: 20, mr: 0.5 }} />
                    <Typography variant="caption">
                      +{fuelEfficiency?.trend || 0}% improvement
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <LocalGasStationIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Downtime */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Downtime
                  </Typography>
                  <Typography variant="h3" fontWeight="700">
                    {downtime?.total || 0}h
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingDownIcon sx={{ fontSize: 20, mr: 0.5 }} />
                    <Typography variant="caption">
                      {downtime?.trend || 0}% vs last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <SpeedIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Equipment" />
          <Tab label="Analytics" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      {/* Tab Panel 0: Overview */}
      {selectedTab === 0 && (
        <>
          {/* Equipment Breakdown Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardHeader
                  avatar={<ConstructionIcon sx={{ color: '#2196F3', fontSize: 32 }} />}
                  title="MEWP Equipment"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">Total Units</Typography>
                    <Typography variant="h6" fontWeight="700">{equipmentBreakdown?.mewp?.total || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Active</Typography>
                    <Chip label={equipmentBreakdown?.mewp?.active || 0} color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Maintenance</Typography>
                    <Chip label={equipmentBreakdown?.mewp?.maintenance || 0} color="warning" size="small" />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(equipmentBreakdown?.mewp?.active / equipmentBreakdown?.mewp?.total * 100) || 0}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{(equipmentBreakdown?.mewp?.revenue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardHeader
                  avatar={<LightbulbIcon sx={{ color: '#FFC107', fontSize: 32 }} />}
                  title="Tower Lights"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">Total Units</Typography>
                    <Typography variant="h6" fontWeight="700">{equipmentBreakdown?.towerLight?.total || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Active</Typography>
                    <Chip label={equipmentBreakdown?.towerLight?.active || 0} color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Maintenance</Typography>
                    <Chip label={equipmentBreakdown?.towerLight?.maintenance || 0} color="warning" size="small" />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(equipmentBreakdown?.towerLight?.active / equipmentBreakdown?.towerLight?.total * 100) || 0}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    color="warning"
                  />
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{(equipmentBreakdown?.towerLight?.revenue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardHeader
                  avatar={<BatteryChargingFullIcon sx={{ color: '#4CAF50', fontSize: 32 }} />}
                  title="Battery Packs"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">Total Units</Typography>
                    <Typography variant="h6" fontWeight="700">{equipmentBreakdown?.battery?.total || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Active</Typography>
                    <Chip label={equipmentBreakdown?.battery?.active || 0} color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Maintenance</Typography>
                    <Chip label={equipmentBreakdown?.battery?.maintenance || 0} color="warning" size="small" />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(equipmentBreakdown?.battery?.active / equipmentBreakdown?.battery?.total * 100) || 0}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    color="success"
                  />
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{(equipmentBreakdown?.battery?.revenue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader title="Fleet Health Status" titleTypographyProps={{ fontWeight: 600 }} />
                <CardContent>
                  <Box height={300} display="flex" alignItems="center" justifyContent="center">
                    <Doughnut 
                      data={fleetHealthChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader title="Battery Health" titleTypographyProps={{ fontWeight: 600 }} />
                <CardContent>
                  <Box height={300} display="flex" alignItems="center" justifyContent="center">
                    <Doughnut 
                      data={batteryHealthChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Tab Panel 1: Equipment */}
      {selectedTab === 1 && equipmentComparison && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader title="Equipment Comparison" titleTypographyProps={{ fontWeight: 600 }} />
              <CardContent>
                <Box height={400}>
                  <Bar 
                    data={equipmentComparison}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {performanceData && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardHeader title="Performance Metrics" titleTypographyProps={{ fontWeight: 600 }} />
                <CardContent>
                  <Box height={400}>
                    <Radar 
                      data={performanceData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        scales: { r: { beginAtZero: true, max: 100 } }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab Panel 2: Analytics */}
      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {usageChartData && (
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader title="Weekly Usage Trend" titleTypographyProps={{ fontWeight: 600 }} />
                <CardContent>
                  <Box height={300}>
                    <Line 
                      data={usageChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {revenueChartData && (
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardHeader title="Monthly Revenue" titleTypographyProps={{ fontWeight: 600 }} />
                <CardContent>
                  <Box height={300}>
                    <Bar 
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                      }}
                    />
                  </Box>
                  {revenueData?.stats && (
                    <Box mt={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Today</Typography>
                          <Typography variant="h6">₹{revenueData.stats.today.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">This Month</Typography>
                          <Typography variant="h6">₹{revenueData.stats.month.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Growth</Typography>
                          <Typography variant="h6" color="success.main">+{revenueData.stats.trend}%</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {locationData && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardHeader title="Location Distribution" titleTypographyProps={{ fontWeight: 600 }} />
                <CardContent>
                  <Box height={300} display="flex" alignItems="center" justifyContent="center">
                    <PolarArea 
                      data={locationData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right' } }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab Panel 3: Activity */}
      {selectedTab === 3 && (
        <Card elevation={3}>
          <CardHeader 
            title="Recent Device Activity" 
            titleTypographyProps={{ fontWeight: 600 }}
            action={
              <TextField
                size="small"
                placeholder="Search activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'device'}
                        direction={orderBy === 'device' ? order : 'asc'}
                        onClick={() => handleSort('device')}
                      >
                        Device ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'time'}
                        direction={orderBy === 'time' ? order : 'asc'}
                        onClick={() => handleSort('time')}
                      >
                        Time
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity
                    .filter(activity => 
                      !searchTerm || 
                      activity.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      activity.location.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 15)
                    .map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{activity.device}</TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.type} 
                            size="small" 
                            color={
                              activity.type === 'ME' ? 'primary' : 
                              activity.type === 'TL' ? 'warning' : 
                              'success'
                            }
                          />
                        </TableCell>
                        <TableCell>{activity.activity}</TableCell>
                        <TableCell>{activity.location}</TableCell>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell>
                          <Chip label={activity.status} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Update Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default Dashboard;