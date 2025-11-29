import React, { useState, useEffect } from 'react';
import deviceService from '../services/deviceService';
import './DeviceDashboard.css';

const DeviceDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('EC200U_001');
  const [latestData, setLatestData] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [deviceStats, setDeviceStats] = useState(null);
  const [batteryStats, setBatteryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData();
      const interval = setInterval(fetchDeviceData, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const response = await deviceService.getAllDevices();
      console.log('Fetched devices response:', response);
      if (response && response.items) {
        setDevices(response.items);
      } else {
        console.error('Invalid devices response structure:', response);
        setError('Failed to fetch devices data');
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to fetch devices');
    }
  };

  const fetchDeviceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching device data for:', selectedDevice);
      const [latestRes, historyRes, statsRes, deviceStatsRes, batteryStatsRes] = await Promise.all([
        deviceService.getLatestData(selectedDevice).catch(err => {
          console.error('Error fetching latest data:', err);
          return null;
        }),
        deviceService.getHistory(selectedDevice, 20).catch(err => {
          console.error('Error fetching history:', err);
          return [];
        }),
        deviceService.getStats(selectedDevice, 24).catch(err => {
          console.error('Error fetching stats:', err);
          return null;
        }),
        deviceService.getDeviceStats().catch(err => {
          console.error('Error fetching device stats:', err);
          return { totalDevices: 0, active: 0, maintenance: 0, inactive: 0 };
        }),
        deviceService.getBatteryStats().catch(err => {
          console.error('Error fetching battery stats:', err);
          return { good: 0, warning: 0, critical: 0 };
        })
      ]);

      console.log('Fetched data:', {
        latestData: latestRes,
        history: historyRes,
        stats: statsRes,
        deviceStats: deviceStatsRes,
        batteryStats: batteryStatsRes
      });

      setLatestData(latestRes);
      setHistory(historyRes || []);
      setStats(statsRes);
      setDeviceStats(deviceStatsRes);
      setBatteryStats(batteryStatsRes);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch device data';
      console.error('Error in fetchDeviceData:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !latestData) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error && !latestData) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Telematics Dashboard</h1>
        <div className="dashboard-summary">
          {deviceStats && (
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Devices:</span>
                <span className="stat-value">{deviceStats.totalDevices || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active:</span>
                <span className="stat-value">{deviceStats.active || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Maintenance:</span>
                <span className="stat-value">{deviceStats.maintenance || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Inactive:</span>
                <span className="stat-value">{deviceStats.inactive || 0}</span>
              </div>
            </div>
          )}
          {batteryStats && (
            <div className="battery-stats">
              <div className="stat-item">
                <span className="stat-label">Battery Good:</span>
                <span className="stat-value">{batteryStats.good || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Battery Warning:</span>
                <span className="stat-value">{batteryStats.warning || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Battery Critical:</span>
                <span className="stat-value">{batteryStats.critical || 0}</span>
              </div>
            </div>
          )}
        </div>
        <select 
          value={selectedDevice} 
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="device-selector"
        >
          {devices.map(device => (
            <option key={device.device_id} value={device.device_id}>
              {device.device_id} - {device.machine_details}
            </option>
          ))}
        </select>
      </header>

      {latestData && (
        <div className="current-status">
          <h2>Current Status</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Engine RPM</div>
              <div className="metric-value">{latestData.engine_rpm}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Engine Temperature</div>
              <div className="metric-value">{latestData.engine_temp}°C</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Oil Pressure</div>
              <div className="metric-value">{latestData.oil_pressure} PSI</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Battery</div>
              <div className="metric-value">{latestData.battery_monitor}V</div>
            </div>
          </div>
          <div className="last-update">
            Last updated: {formatTimestamp(latestData.timestamp)}
          </div>
        </div>
      )}

      {stats && (
        <div className="statistics">
          <h2>24 Hour Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Engine RPM</h3>
              <div>Avg: {stats.engine_rpm.avg}</div>
              <div>Min: {stats.engine_rpm.min}</div>
              <div>Max: {stats.engine_rpm.max}</div>
            </div>
            <div className="stat-card">
              <h3>Engine Temp</h3>
              <div>Avg: {stats.engine_temp.avg}°C</div>
              <div>Min: {stats.engine_temp.min}°C</div>
              <div>Max: {stats.engine_temp.max}°C</div>
            </div>
            <div className="stat-card">
              <h3>Oil Pressure</h3>
              <div>Avg: {stats.oil_pressure.avg} PSI</div>
              <div>Min: {stats.oil_pressure.min} PSI</div>
              <div>Max: {stats.oil_pressure.max} PSI</div>
            </div>
            <div className="stat-card">
              <h3>Battery</h3>
              <div>Avg: {stats.battery_monitor.avg}V</div>
              <div>Min: {stats.battery_monitor.min}V</div>
              <div>Max: {stats.battery_monitor.max}V</div>
            </div>
          </div>
        </div>
      )}

      <div className="history">
        <h2>Recent History</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>RPM</th>
                <th>Temp (°C)</th>
                <th>Pressure (PSI)</th>
                <th>Battery (V)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index}>
                  <td>{formatTimestamp(record.timestamp)}</td>
                  <td>{record.engine_rpm}</td>
                  <td>{record.engine_temp}</td>
                  <td>{record.oil_pressure}</td>
                  <td>{record.battery_monitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeviceDashboard;