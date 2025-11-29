import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TablePagination,
  CircularProgress,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Toolbar,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, Add, Search } from '@mui/icons-material';

const getStatusChip = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'on':
      return <Chip label="Active" color="success" size="small" />;
    case 'inactive':
    case 'off':
      return <Chip label="Inactive" color="default" size="small" />;
    case 'maintenance':
      return <Chip label="Maintenance" color="warning" size="small" />;
    default:
      return <Chip label={status || 'Unknown'} size="small" />;
  }
};

// Helper function to get device type label
const getDeviceType = (deviceId) => {
  if (!deviceId) return 'Unknown';
  
  if (deviceId.startsWith('TL_')) return 'Tower Light';
  if (deviceId.startsWith('BA_')) return 'Battery Pack';
  if (deviceId.startsWith('ME_DD')) return 'MEWP D-Diesel';
  if (deviceId.startsWith('ME_DB')) return 'MEWP D-Battery';
  if (deviceId.startsWith('ME_MD')) return 'MEWP M-Diesel';
  if (deviceId.startsWith('ME_MB')) return 'MEWP M-Battery';
  if (deviceId.startsWith('ME_TD')) return 'MEWP T-Diesel';
  if (deviceId.startsWith('ME_TB')) return 'MEWP T-Battery';
  if (deviceId.startsWith('ME_')) return 'MEWP';
  
  return 'Unknown';
};

const DeviceManagementPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({ device_id: '', machine_details: '', location: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/devices');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        
        let allDevices = [];
        
        // Handle different possible response structures
        if (data.items) {
          allDevices = data.items;
        } else if (data.devices) {
          allDevices = data.devices;
        } else if (data.devices_by_type) {
          // Flatten the devices_by_type object
          allDevices = Object.values(data.devices_by_type).flat();
        } else if (Array.isArray(data)) {
          allDevices = data;
        }
        
        console.log('All devices extracted:', allDevices);
        
        // Remove duplicates - keep only the latest record for each device_id
        const uniqueDevicesMap = new Map();
        
        allDevices.forEach(device => {
          const deviceId = device.device_id;
          
          if (!deviceId) return;
          
          if (deviceId.toLowerCase() === 'unknown') {
            const uniqueKey = `unknown_${device.timestamp || device.on_off_time || Math.random()}`;
            uniqueDevicesMap.set(uniqueKey, device);
          } else {
            const existing = uniqueDevicesMap.get(deviceId);
            
            if (!existing) {
              uniqueDevicesMap.set(deviceId, device);
            } else {
              const existingTime = new Date(existing.timestamp || existing.on_off_time || 0);
              const currentTime = new Date(device.timestamp || device.on_off_time || 0);
              
              if (currentTime > existingTime) {
                uniqueDevicesMap.set(deviceId, device);
              }
            }
          }
        });
        
        const uniqueDevices = Array.from(uniqueDevicesMap.values());
        console.log('Unique devices:', uniqueDevices);
        
        setDevices(uniqueDevices);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewDevice = (deviceId) => {
    if (!deviceId) return;
    
    // Navigate to specific detail page based on device type
    if (deviceId.startsWith('TL_')) {
      navigate(`/tower-lights/${deviceId}`);
    } else if (deviceId.startsWith('BA_')) {
      navigate(`/battery-pack/${deviceId}`);
    } else if (deviceId.startsWith('ME_')) {
      navigate(`/mewp-detail/${deviceId}`);
    } else {
      navigate(`/devices/${deviceId}`);
    }
  };

  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewDevice({ device_id: '', machine_details: '', location: '' });
  };

  const handleNewDeviceChange = (event) => {
    setNewDevice({ ...newDevice, [event.target.name]: event.target.value });
  };

  const handleAddNewDevice = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDevice,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        const addedDevice = await response.json();
        setDevices([...devices, addedDevice]);
        handleAddDialogClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  const filteredDevices = devices.filter((device) => {
    const searchLower = searchTerm.toLowerCase();
    const deviceId = device.device_id || '';
    const machineDetails = device.machine_details || '';
    const deviceType = getDeviceType(deviceId).toLowerCase();
    const location = device.location?.lat ? `${device.location.lat}, ${device.location.lon}` : '';
    
    return (
      deviceId.toLowerCase().includes(searchLower) ||
      machineDetails.toLowerCase().includes(searchLower) ||
      deviceType.includes(searchLower) ||
      location.includes(searchLower)
    );
  });

  const paginatedDevices = filteredDevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Device Management
      </Typography>
      <Paper>
        <Toolbar>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search Devices..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleAddDialogOpen}>
            Add Device
          </Button>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Device Type</TableCell>
                <TableCell>Machine Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Battery (%)</TableCell>
                <TableCell>Engine RPM</TableCell>
                <TableCell>Engine Temp (°C)</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevices.map((device, index) => (
                  <TableRow key={`${device.device_id}_${index}`} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{device.device_id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getDeviceType(device.device_id)} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{device.machine_details || 'N/A'}</TableCell>
                    <TableCell>{getStatusChip(device.status)}</TableCell>
                    <TableCell>
                      {device.battery_monitor 
                        ? `${device.battery_monitor.toFixed(1)}V` 
                        : device.soc 
                        ? `${device.soc.toFixed(0)}%` 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{device.engine_rpm || device.engine_speed || 'N/A'}</TableCell>
                    <TableCell>{device.engine_temp || device.coolant_temperature || 'N/A'}</TableCell>
                    <TableCell>
                      {device.timestamp 
                        ? new Date(device.timestamp).toLocaleString() 
                        : device.on_off_time 
                        ? new Date(device.on_off_time).toLocaleString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDevice(device.device_id)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDevices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Dialog open={addDialogOpen} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="device_id"
            label="Device ID"
            type="text"
            fullWidth
            variant="standard"
            value={newDevice.device_id || ''}
            onChange={handleNewDeviceChange}
            helperText="Format: TL_XXX (Tower Light), BA_XXX (Battery Pack), ME_DD_XXX (MEWP D-Diesel), etc."
          />
          <TextField
            margin="dense"
            name="machine_details"
            label="Machine Details"
            type="text"
            fullWidth
            variant="standard"
            value={newDevice.machine_details || ''}
            onChange={handleNewDeviceChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location (lat, lon)"
            type="text"
            fullWidth
            variant="standard"
            value={newDevice.location || ''}
            onChange={handleNewDeviceChange}
            helperText="Enter as: latitude, longitude (e.g., 12.9716, 77.5946)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button onClick={handleAddNewDevice} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// CRITICAL: Make sure this is a default export
export default DeviceManagementPage;