import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Grid, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, InputLabel, 
  Select, MenuItem, Divider, Chip, CircularProgress, Card, CardContent, 
  Avatar, Alert, Tooltip, Switch, FormControlLabel, Stack, 
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon, Delete as DeleteIcon, MyLocation as MyLocationIcon,
  Warning, Refresh, ZoomIn, ZoomOut, DevicesOther,
  BatteryAlert, Battery20, Build, EmojiObjects, AltRoute, Battery90,
  FilterList, Close
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper - SAME AS DeviceManagementPage
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

// Stats Card
const StatsCard = ({ title, value, icon, color, subtitle, onClick, selected }) => {
  return (
    <Card 
      onClick={onClick}
      sx={{ 
        borderRadius: 3, boxShadow: selected ? 6 : 3,
        border: selected ? `3px solid ${color}` : `2px solid ${color}`,
        transition: 'all 0.3s ease', cursor: 'pointer',
        bgcolor: selected ? `${color}15` : 'background.paper',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 6, bgcolor: `${color}10` }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Avatar sx={{ bgcolor: `${color}30`, width: 56, height: 56 }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 32 } })}
          </Avatar>
          <Typography variant="h2" sx={{ fontWeight: 'bold', color }}>{value}</Typography>
        </Box>
        <Typography variant="body1" fontWeight="bold">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
};

// Map Controller
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Device Popup
const DeviceInfo = ({ device }) => (
  <Box sx={{ minWidth: 220 }}>
    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: 'primary.main' }}>
      {device.device_id}
    </Typography>
    <Divider sx={{ my: 1 }} />
    <Stack spacing={0.8}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">Type:</Typography>
        <Chip label={device.type} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">Location:</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
          {device.location[0].toFixed(4)}, {device.location[1].toFixed(4)}
        </Typography>
      </Box>
      {device.regulator_level !== undefined && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Regulator:</Typography>
          <Typography variant="caption" fontWeight="bold" color="success.main">{device.regulator_level}%</Typography>
        </Box>
      )}
    </Stack>
  </Box>
);

const GeofencingPage = () => {
  const theme = useTheme();
  const mapRef = useRef(null);
  
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mapCenter, setMapCenter] = useState([12.8745, 77.3912]);
  const [mapZoom, setMapZoom] = useState(12);
  const [showGeofences, setShowGeofences] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [openGeofenceDialog, setOpenGeofenceDialog] = useState(false);
  const [geofenceFormData, setGeofenceFormData] = useState({
    name: '', description: '', type: 'circle',
    circle: { center: [12.8745, 77.3912], radius: 1000 },
    polygon: { paths: [] }, color: '#4caf50'
  });

  // Fetch devices - EXACT SAME LOGIC AS DeviceManagementPage
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      console.log('🔍 Fetching devices from API...');
      
      const response = await fetch('http://localhost:5000/api/devices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 RAW API Response:', data);
      
      let allDevices = [];
      
      // Handle different possible response structures - CRITICAL FIX
      if (data.items) {
        allDevices = data.items;
        console.log('✅ Using data.items');
      } else if (data.devices) {
        allDevices = data.devices;
        console.log('✅ Using data.devices');
      } else if (data.devices_by_type) {
        // Flatten the devices_by_type object
        allDevices = Object.values(data.devices_by_type).flat();
        console.log('✅ Using data.devices_by_type (flattened)');
      } else if (Array.isArray(data)) {
        allDevices = data;
        console.log('✅ Using data as array');
      } else {
        console.error('❌ Unknown response format!');
        console.log('Available keys:', Object.keys(data));
      }
      
      console.log('📋 Total devices extracted:', allDevices.length);
      
      if (allDevices.length > 0) {
        console.log('🔍 Sample device:', allDevices[0]);
      }
      
      // Remove duplicates - SAME AS DeviceManagementPage
      const uniqueDevicesMap = new Map();
      
      allDevices.forEach(device => {
        const deviceId = device.device_id;
        
        if (!deviceId) {
          console.log('⚠️ Skipping device with no ID');
          return;
        }
        
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
      console.log('✅ Unique devices after deduplication:', uniqueDevices.length);
      
      // Process devices for map
      const processed = uniqueDevices.map(device => {
        console.log(`\n🔍 Processing device: ${device.device_id}`);
        
        // Try to extract location
        let location = null;
        
        // Try format 1: latitude/longitude
        if (device.latitude !== undefined && device.longitude !== undefined) {
          location = [parseFloat(device.latitude), parseFloat(device.longitude)];
          console.log(`  ✅ Location from latitude/longitude:`, location);
        }
        // Try format 2: lat/lng
        else if (device.lat !== undefined && device.lng !== undefined) {
          location = [parseFloat(device.lat), parseFloat(device.lng)];
          console.log(`  ✅ Location from lat/lng:`, location);
        }
        // Try format 3: location object
        else if (device.location && typeof device.location === 'object') {
          if (device.location.lat !== undefined && device.location.lng !== undefined) {
            location = [parseFloat(device.location.lat), parseFloat(device.location.lng)];
            console.log(`  ✅ Location from location.lat/lng:`, location);
          } else if (device.location.lat !== undefined && device.location.lon !== undefined) {
            location = [parseFloat(device.location.lat), parseFloat(device.location.lon)];
            console.log(`  ✅ Location from location.lat/lon:`, location);
          }
        }
        
        if (!location || isNaN(location[0]) || isNaN(location[1])) {
          console.warn(`  ⚠️ ${device.device_id} - No valid location`);
          return null;
        }
        
        console.log(`  ✅ Final location:`, location);
        
        return {
          ...device,
          name: device.device_id,
          type: getDeviceType(device.device_id),
          status: device.status || 'active',
          location,
          regulator_level: device.regulator_level,
          lastUpdate: device.on_off_time || device.timestamp
        };
      }).filter(Boolean);
      
      console.log('\n✅ FINAL: Devices with valid locations:', processed.length);
      console.log('Device list:', processed.map(d => ({ id: d.device_id, type: d.type, loc: d.location })));
      
      if (processed.length === 0) {
        console.error('❌ NO DEVICES WITH LOCATION DATA!');
        alert('⚠️ No devices with GPS coordinates found!\n\nYour devices exist but have no location data.\nPlease add latitude/longitude fields to your AWS DynamoDB records.');
      } else {
        // Auto-center on first device
        setMapCenter(processed[0].location);
        setMapZoom(13);
        
        // Fit bounds if multiple devices
        if (processed.length > 1 && mapRef.current) {
          setTimeout(() => {
            const bounds = L.latLngBounds(processed.map(d => d.location));
            mapRef.current.fitBounds(bounds, { padding: [80, 80] });
          }, 500);
        }
      }
      
      setDevices(processed);
      setFilteredDevices(processed);
      
      // Create geofence
      if (processed.length > 0) {
        setGeofences([{
          id: '1',
          name: 'Work Zone',
          type: 'circle',
          circle: { center: processed[0].location, radius: 2000 },
          color: '#4caf50'
        }]);
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error loading devices: ' + error.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const stats = {
    total: devices.length,
    mewp: devices.filter(d => d.type.includes('MEWP')).length,
    towerLight: devices.filter(d => d.type === 'Tower Light').length,
    battery: devices.filter(d => d.type === 'Battery Pack').length,
    lowHealth: devices.filter(d => (d.regulator_level || 0) < 20).length,
    lowBattery: devices.filter(d => {
      const level = d.regulator_level || 0;
      return level >= 20 && level < 50;
    }).length,
    maintenance: devices.filter(d => d.status === 'maintenance').length
  };

  // Filter handler
  const handleFilterClick = (filterType) => {
    setSelectedFilter(filterType);
    let filtered = [...devices];
    
    switch(filterType) {
      case 'mewp': filtered = devices.filter(d => d.type.includes('MEWP')); break;
      case 'towerLight': filtered = devices.filter(d => d.type === 'Tower Light'); break;
      case 'battery': filtered = devices.filter(d => d.type === 'Battery Pack'); break;
      case 'lowHealth': filtered = devices.filter(d => (d.regulator_level || 0) < 20); break;
      case 'lowBattery': filtered = devices.filter(d => {
        const level = d.regulator_level || 0;
        return level >= 20 && level < 50;
      }); break;
      case 'maintenance': filtered = devices.filter(d => d.status === 'maintenance'); break;
      default: filtered = devices;
    }
    
    setFilteredDevices(filtered);
    
    if (filtered.length > 0 && mapRef.current) {
      setTimeout(() => {
        const bounds = L.latLngBounds(filtered.map(d => d.location));
        mapRef.current.fitBounds(bounds, { padding: [80, 80] });
      }, 100);
    }
  };

  // Marker color
  const getMarkerColor = (device) => {
    if ((device.regulator_level || 0) < 20) return '#f44336';
    if (device.status === 'maintenance') return '#ff9800';
    if (device.type.includes('MEWP')) return '#2196f3';
    if (device.type === 'Battery Pack') return '#4caf50';
    if (device.type === 'Tower Light') return '#ff9800';
    return '#9e9e9e';
  };

  // Create marker
  const createMarkerIcon = (device) => {
    const color = getMarkerColor(device);
    const label = device.type.includes('MEWP') ? 'M' : device.type === 'Battery Pack' ? 'B' : device.type === 'Tower Light' ? 'L' : '?';
    
    return L.divIcon({
      html: `<div style="
        background-color: ${color}; width: 40px; height: 40px; border-radius: 50%;
        border: 4px solid white; display: flex; align-items: center; justify-content: center;
        font-weight: bold; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        font-size: 18px; font-family: Arial;
      ">${label}</div>`,
      iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20]
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Fleet Data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            🗺️ Fleet Geofencing System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time tracking • {filteredDevices.length} of {devices.length} devices • Bangalore, India
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {devices.length === 0 && (
            <Alert severity="warning" sx={{ py: 1 }}>Check browser console for details</Alert>
          )}
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} disabled={refreshing}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenGeofenceDialog(true)}>
            Create Geofence
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards - FIXED Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total" value={stats.total} icon={<DevicesOther />} color="#2196f3"
            subtitle="All devices" onClick={() => handleFilterClick('all')} selected={selectedFilter === 'all'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="MEWPs" value={stats.mewp} icon={<AltRoute />} color="#1976d2"
            subtitle="Platforms" onClick={() => handleFilterClick('mewp')} selected={selectedFilter === 'mewp'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Tower Lights" value={stats.towerLight} icon={<EmojiObjects />} color="#ff9800"
            subtitle="Lights" onClick={() => handleFilterClick('towerLight')} selected={selectedFilter === 'towerLight'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Batteries" value={stats.battery} icon={<Battery90 />} color="#4caf50"
            subtitle="Packs" onClick={() => handleFilterClick('battery')} selected={selectedFilter === 'battery'} />
        </Grid>
      </Grid>

      {/* Map */}
      <Card sx={{ borderRadius: 3, boxShadow: 4, overflow: 'hidden', position: 'relative', height: 'calc(100vh - 360px)', minHeight: '600px' }}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%' }} ref={mapRef}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
            maxZoom={19}
          />
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Geofences */}
          {showGeofences && geofences.map(geo => (
            <Circle key={geo.id} center={geo.circle.center} radius={geo.circle.radius}
              pathOptions={{ color: geo.color, fillOpacity: 0.15 }} />
          ))}

          {/* Devices */}
          {filteredDevices.map((device, idx) => (
            <Marker key={idx} position={device.location} icon={createMarkerIcon(device)}>
              <Popup><DeviceInfo device={device} /></Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Controls */}
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <Stack spacing={1}>
            <Tooltip title="Zoom In">
              <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }} onClick={() => setMapZoom(z => Math.min(z + 1, 19))}>
                <ZoomIn color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }} onClick={() => setMapZoom(z => Math.max(z - 1, 3))}>
                <ZoomOut color="primary" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Legend */}
        <Card sx={{ position: 'absolute', bottom: 20, left: 20, p: 2, zIndex: 1000, minWidth: 180 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Map Legend</Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#2196f3', border: '2px solid white' }} />
              <Typography variant="caption">MEWP</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#ff9800', border: '2px solid white' }} />
              <Typography variant="caption">Tower Light</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4caf50', border: '2px solid white' }} />
              <Typography variant="caption">Battery</Typography>
            </Box>
            <Divider />
            <FormControlLabel
              control={<Switch checked={showGeofences} onChange={e => setShowGeofences(e.target.checked)} size="small" />}
              label={<Typography variant="caption">Show Zones</Typography>}
            />
          </Stack>
        </Card>

        {/* Device Count */}
        <Card sx={{ position: 'absolute', top: 10, left: 10, p: 2, zIndex: 1000 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            📍 {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} on map
          </Typography>
        </Card>
      </Card>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
};

export default GeofencingPage;
