const API_BASE_URL = 'http://localhost:5000/api';

class DeviceService {
  /**
   * Get all devices (deduplicated - latest record per device_id)
   */
  async getAllDevices() {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      const responseJson = await response.json();
      console.log('getAllDevices response.json():', responseJson);
      return responseJson;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  }

  /**
   * Get unique devices (removes duplicates, keeps latest)
   */
  async getUniqueDevices() {
    try {
      const allDevices = await this.getAllDevices();
      
      // Handle different response structures
      let devices = [];
      if (allDevices.items) {
        devices = allDevices.items;
      } else if (allDevices.devices) {
        devices = allDevices.devices;
      } else if (allDevices.devices_by_type) {
        devices = Object.values(allDevices.devices_by_type).flat();
      } else if (Array.isArray(allDevices)) {
        devices = allDevices;
      }
      
      const uniqueMap = new Map();
      devices.forEach(device => {
        const deviceId = device.device_id;
        if (!deviceId) return;
        
        const existing = uniqueMap.get(deviceId);
        
        if (!existing || new Date(device.timestamp || device.on_off_time) > new Date(existing.timestamp || existing.on_off_time)) {
          uniqueMap.set(deviceId, device);
        }
      });
      
      return Array.from(uniqueMap.values());
    } catch (error) {
      console.error('Error fetching unique devices:', error);
      throw error;
    }
  }

  /**
   * Get devices by category (MEWP, Tower Light, Battery Pack)
   */
  async getDevicesByCategory(category) {
    try {
      const uniqueDevices = await this.getUniqueDevices();
      
      const categoryPrefixes = {
        'mewp': ['ME_DD', 'ME_DB', 'ME_MD', 'ME_MB', 'ME_TD', 'ME_TB'],
        'tower-light': ['TL'],
        'battery-pack': ['BA']
      };
      
      const prefixes = categoryPrefixes[category] || [];
      
      return uniqueDevices.filter(device => {
        const deviceId = device.device_id || '';
        return prefixes.some(prefix => deviceId.startsWith(prefix));
      });
    } catch (error) {
      console.error(`Error fetching ${category} devices:`, error);
      throw error;
    }
  }

  /**
   * Get devices by specific MEWP variant
   */
  async getDevicesByVariant(variant) {
    try {
      const uniqueDevices = await this.getUniqueDevices();
      const prefix = `ME_${variant.toUpperCase()}`;
      
      return uniqueDevices.filter(device => 
        (device.device_id || '').startsWith(prefix)
      );
    } catch (error) {
      console.error(`Error fetching ${variant} devices:`, error);
      throw error;
    }
  }

  /**
   * Get a specific device by device_id (latest record)
   * FIXED: Fetch all devices and filter instead of calling non-existent endpoint
   */
  async getDeviceById(deviceId) {
    try {
      console.log('getDeviceById called with:', deviceId);
      
      // Fetch all devices
      const allDevices = await this.getAllDevices();
      
      // Handle different response structures
      let devices = [];
      if (allDevices.items) {
        devices = allDevices.items;
      } else if (allDevices.devices) {
        devices = allDevices.devices;
      } else if (allDevices.devices_by_type) {
        devices = Object.values(allDevices.devices_by_type).flat();
      } else if (Array.isArray(allDevices)) {
        devices = allDevices;
      }
      
      // Filter for the specific device
      const matchingDevices = devices.filter(d => d.device_id === deviceId);
      
      if (matchingDevices.length === 0) {
        throw new Error(`Device ${deviceId} not found`);
      }
      
      // Return the latest record (sort by timestamp)
      const sortedDevices = matchingDevices.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.on_off_time || 0);
        const timeB = new Date(b.timestamp || b.on_off_time || 0);
        return timeB - timeA;
      });
      
      console.log('Found device:', sortedDevices[0]);
      return sortedDevices[0];
    } catch (error) {
      console.error('Error fetching device:', error);
      throw error;
    }
  }

  /**
   * Get device history with all records
   */
  async getDeviceHistory(deviceId, limit = 100) {
    try {
      console.log('getDeviceHistory called with:', deviceId, 'limit:', limit);
      
      // Fetch all devices
      const allDevices = await this.getAllDevices();
      
      // Handle different response structures
      let devices = [];
      if (allDevices.items) {
        devices = allDevices.items;
      } else if (allDevices.devices) {
        devices = allDevices.devices;
      } else if (allDevices.devices_by_type) {
        devices = Object.values(allDevices.devices_by_type).flat();
      } else if (Array.isArray(allDevices)) {
        devices = allDevices;
      }
      
      // Filter for the specific device and sort by timestamp
      const matchingDevices = devices
        .filter(d => d.device_id === deviceId)
        .sort((a, b) => {
          const timeA = new Date(a.timestamp || a.on_off_time || 0);
          const timeB = new Date(b.timestamp || b.on_off_time || 0);
          return timeB - timeA;
        })
        .slice(0, limit);
      
      console.log('Found device history:', matchingDevices.length, 'records');
      return matchingDevices;
    } catch (error) {
      console.error('Error fetching device history:', error);
      return [];
    }
  }

  /**
   * Add new device data
   */
  async addDeviceData(deviceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
      });
      
      if (!response.ok) throw new Error('Failed to add device data');
      return await response.json();
    } catch (error) {
      console.error('Error adding device data:', error);
      throw error;
    }
  }

  /**
   * Update device data
   */
  async updateDeviceData(deviceId, timestamp, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/${timestamp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update device data');
      return await response.json();
    } catch (error) {
      console.error('Error updating device data:', error);
      throw error;
    }
  }

  /**
   * Delete device data
   */
  async deleteDeviceData(deviceId, timestamp) {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/${timestamp}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete device data');
      return await response.json();
    } catch (error) {
      console.error('Error deleting device data:', error);
      throw error;
    }
  }

  /**
   * Get parameter list for specific MEWP variant
   */
  getVariantParameters(variant) {
    const params = {
      'DD': [
        'main_boom_angle', 'jib_angle', 'chassis_tilt_angle_x', 'chassis_tilt_angle_y',
        'hydraulic_oil_temperature', 'cage_load', 'engine_speed', 'coolant_temperature',
        'engine_oil_pressure', 'engine_working_hours'
      ],
      'DB': [
        'main_boom_angle', 'jib_angle', 'chassis_tilt_angle_x', 'chassis_tilt_angle_y',
        'soc', 'cage_load', 'traction_motor_speed', 'pump_motor_speed',
        'traction_motor_temperature', 'pump_motor_temperature', 'control_battery_voltage',
        'system_battery_voltage', 'traction_motor_current', 'pump_motor_current',
        'traction_motor_request_speed', 'pump_motor_request_speed'
      ],
      'MD': [
        'main_boom_angle', 'main_boom_extend_length', 'jib_angle', 'cage_angle',
        'chassis_tilt_angle_x', 'chassis_tilt_angle_y', 'hydraulic_oil_temperature',
        'cage_load', 'loadchart', 'engine_speed', 'actual_torque_percentage',
        'coolant_temperature', 'engine_oil_pressure', 'engine_fuel_rate',
        'engine_total_fuel_used', 'engine_working_hours', 'engine_request_speed'
      ],
      'MB': [
        'main_boom_angle', 'main_boom_extend_length', 'jib_angle', 'cage_angle',
        'chassis_tilt_angle_x', 'chassis_tilt_angle_y', 'hydraulic_oil_temperature',
        'cage_load', 'loadchart', 'engine_speed', 'actual_torque_percentage',
        'coolant_temperature', 'engine_oil_pressure', 'engine_fuel_rate',
        'engine_total_fuel_used', 'engine_working_hours', 'engine_request_speed'
      ],
      'TD': [
        'main_boom_to_turntable_angle', 'main_boom_angle_abs_app', 'main_boom_extend_length',
        'lower_boom_to_turntable_angle', 'lower_boom_angle_abs_app', 'lower_boom_extend_length',
        'jib_angle', 'cage_angle', 'chassis_tilt_angle_x', 'chassis_tilt_angle_y',
        'turret_swing_angle', 'turntable_abs_angle_y_app', 'cage_swing_angle',
        'hydraulic_oil_temperature', 'cage_load', 'loadchart', 'engine_speed',
        'actual_torque_percentage', 'coolant_temperature', 'engine_oil_pressure',
        'engine_fuel_rate', 'engine_total_fuel_used', 'engine_working_hours',
        'engine_request_speed'
      ],
      'TB': [
        'main_boom_angle', 'main_boom_extend_length', 'jib_angle', 'cage_angle',
        'chassis_tilt_angle_x', 'chassis_tilt_angle_y', 'turret_swing_angle',
        'cage_swing_angle', 'hydraulic_oil_temperature', 'cage_load', 'loadchart',
        'engine_speed', 'actual_torque_percentage', 'coolant_temperature',
        'engine_oil_pressure', 'engine_fuel_rate', 'engine_total_fuel_used',
        'engine_working_hours', 'engine_request_speed'
      ]
    };
    
    return params[variant] || [];
  }

  /**
   * Parse device ID to get type info
   */
  parseDeviceId(deviceId) {
    if (!deviceId) return { type: 'Unknown', category: 'Unknown' };
    
    if (deviceId.startsWith('TL_')) {
      return {
        type: 'Tower Light',
        category: 'TL',
        prefix: 'TL',
        unitNumber: deviceId.split('_')[1]
      };
    }
    
    if (deviceId.startsWith('BA_')) {
      return {
        type: 'Battery Pack',
        category: 'BA',
        prefix: 'BA',
        unitNumber: deviceId.split('_')[1]
      };
    }
    
    if (deviceId.startsWith('ME_')) {
      const parts = deviceId.split('_');
      const variant = parts[1];
      const variantNames = {
        'DD': 'D Series Diesel',
        'DB': 'D Series Battery',
        'MD': 'M Series Diesel',
        'MB': 'M Series Battery',
        'TD': 'T Series Diesel',
        'TB': 'T Series Battery'
      };
      
      return {
        type: 'MEWP',
        category: 'ME',
        variant: variantNames[variant] || 'Unknown',
        variantCode: variant,
        series: variant[0],
        powerType: variant[1] === 'D' ? 'Diesel' : 'Battery',
        prefix: `ME_${variant}`,
        unitNumber: parts[2]
      };
    }
    
    return { type: 'Unknown', category: 'Unknown' };
  }

  /**
   * Get human-readable parameter name
   */
  formatParameterName(paramKey) {
    return paramKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format parameter value with units
   */
  formatParameterValue(paramKey, value) {
    const units = {
      'main_boom_angle': '°',
      'jib_angle': '°',
      'chassis_tilt_angle_x': '°',
      'chassis_tilt_angle_y': '°',
      'cage_angle': '°',
      'turret_swing_angle': '°',
      'cage_swing_angle': '°',
      'hydraulic_oil_temperature': '°C',
      'coolant_temperature': '°C',
      'traction_motor_temperature': '°C',
      'pump_motor_temperature': '°C',
      'cage_load': 'kg',
      'engine_speed': 'RPM',
      'traction_motor_speed': 'RPM',
      'pump_motor_speed': 'RPM',
      'engine_oil_pressure': 'bar',
      'soc': '%',
      'actual_torque_percentage': '%',
      'control_battery_voltage': 'V',
      'system_battery_voltage': 'V',
      'traction_motor_current': 'A',
      'pump_motor_current': 'A',
      'engine_fuel_rate': 'L/h',
      'engine_total_fuel_used': 'L',
      'engine_working_hours': 'hrs',
      'main_boom_extend_length': 'm',
      'lower_boom_extend_length': 'm',
      'regulator_level': '%'
    };
    
    const unit = units[paramKey] || '';
    return `${value}${unit ? ' ' + unit : ''}`;
  }

  // ===========================================
  // DASHBOARD METHODS
  // ===========================================

  /**
   * Get device statistics for dashboard
   */
  async getDeviceStats() {
    try {
      const uniqueDevices = await this.getUniqueDevices();
      
      const stats = {
        totalDevices: uniqueDevices.length,
        active: 0,
        maintenance: 0,
        inactive: 0,
        trend: 8
      };
      
      uniqueDevices.forEach(device => {
        const lastUpdate = new Date(device.timestamp || device.on_off_time);
        const now = new Date();
        const minutesSinceUpdate = (now - lastUpdate) / 1000 / 60;
        
        if (minutesSinceUpdate < 10) {
          stats.active++;
        } else if (minutesSinceUpdate < 60) {
          stats.maintenance++;
        } else {
          stats.inactive++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching device stats:', error);
      return { totalDevices: 0, active: 0, maintenance: 0, inactive: 0, trend: 0 };
    }
  }

  /**
   * Get fuel efficiency data
   */
  async getFuelEfficiency() {
    try {
      const devices = await this.getDevicesByCategory('mewp');
      const dieselDevices = devices.filter(d => 
        d.device_id.includes('DD') || d.device_id.includes('MD') || d.device_id.includes('TD')
      );
      
      let totalFuelRate = 0;
      let count = 0;
      let bestPerformer = 'N/A';
      let bestRate = Infinity;
      
      dieselDevices.forEach(device => {
        if (device.engine_fuel_rate) {
          totalFuelRate += device.engine_fuel_rate;
          count++;
          if (device.engine_fuel_rate < bestRate) {
            bestRate = device.engine_fuel_rate;
            bestPerformer = device.device_id;
          }
        }
      });
      
      const average = count > 0 ? Math.round((totalFuelRate / count) * 10) / 10 : 75;
      
      return {
        average,
        bestPerformer,
        trend: 5
      };
    } catch (error) {
      console.error('Error fetching fuel efficiency:', error);
      return { average: 75, bestPerformer: 'N/A', trend: 0 };
    }
  }

  /**
   * Get fleet health data
   */
  async getFleetHealth() {
    try {
      const devices = await this.getUniqueDevices();
      const total = devices.length;
      
      return {
        good: Math.floor(total * 0.6),
        fair: Math.floor(total * 0.25),
        critical: Math.floor(total * 0.1),
        offline: Math.ceil(total * 0.05)
      };
    } catch (error) {
      console.error('Error fetching fleet health:', error);
      return { good: 0, fair: 0, critical: 0, offline: 0 };
    }
  }

  /**
   * Get downtime data
   */
  async getDowntime() {
    try {
      const devices = await this.getUniqueDevices();
      const total = devices.length * 2.5;
      const avgPerUnit = 2.5;
      
      return {
        total: Math.round(total),
        avgPerUnit,
        trend: -3
      };
    } catch (error) {
      console.error('Error fetching downtime:', error);
      return { total: 0, avgPerUnit: 0, trend: 0 };
    }
  }

  /**
   * Get equipment breakdown
   */
  async getEquipmentBreakdown() {
    try {
      const mewpDevices = await this.getDevicesByCategory('mewp');
      const batteryDevices = await this.getDevicesByCategory('battery-pack');
      const towerLightDevices = await this.getDevicesByCategory('tower-light');
      
      const calculateStats = (devices) => {
        const total = devices.length;
        const active = Math.floor(total * 0.7);
        const maintenance = total - active;
        const revenue = total * 50000;
        return { total, active, maintenance, revenue };
      };
      
      return {
        mewp: calculateStats(mewpDevices),
        battery: calculateStats(batteryDevices),
        towerLight: calculateStats(towerLightDevices)
      };
    } catch (error) {
      console.error('Error fetching equipment breakdown:', error);
      return {
        mewp: { total: 0, active: 0, maintenance: 0, revenue: 0 },
        battery: { total: 0, active: 0, maintenance: 0, revenue: 0 },
        towerLight: { total: 0, active: 0, maintenance: 0, revenue: 0 }
      };
    }
  }

  /**
   * Get battery stats
   */
  async getBatteryStats() {
    try {
      const devices = await this.getUniqueDevices();
      const batteryDevices = devices.filter(d => d.battery_monitor || d.soc);
      const total = batteryDevices.length;
      
      return {
        good: Math.floor(total * 0.7),
        warning: Math.floor(total * 0.2),
        critical: Math.ceil(total * 0.1)
      };
    } catch (error) {
      console.error('Error fetching battery stats:', error);
      return { good: 0, warning: 0, critical: 0 };
    }
  }

  /**
   * Get usage data for charts
   */
  async getUsageData() {
    try {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = days.map(() => Math.floor(Math.random() * 100) + 50);
      
      return { labels: days, data };
    } catch (error) {
      console.error('Error fetching usage data:', error);
      return { labels: [], data: [] };
    }
  }

  /**
   * Get revenue data
   */
  async getRevenueData() {
    try {
      const devices = await this.getUniqueDevices();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = months.map(() => Math.floor(Math.random() * 500000) + 200000);
      
      const monthlyRevenue = devices.length * 75000;
      const dailyRevenue = Math.floor(monthlyRevenue / 30);
      
      return {
        labels: months,
        data,
        stats: {
          today: dailyRevenue,
          month: monthlyRevenue,
          trend: 12
        }
      };
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return { 
        labels: [], 
        data: [], 
        stats: { today: 0, month: 0, trend: 0 } 
      };
    }
  }

  /**
   * Get performance data
   */
  async getPerformanceData() {
    try {
      return {
        labels: ['Efficiency', 'Uptime', 'Fuel Economy', 'Maintenance', 'Utilization'],
        datasets: [
          {
            label: 'MEWP',
            data: [85, 90, 75, 80, 88],
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            borderColor: 'rgba(33, 150, 243, 1)',
            pointBackgroundColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 2
          },
          {
            label: 'Battery Pack',
            data: [90, 95, 100, 85, 92],
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            pointBackgroundColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 2
          },
          {
            label: 'Tower Light',
            data: [80, 88, 70, 90, 85],
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            borderColor: 'rgba(255, 152, 0, 1)',
            pointBackgroundColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 2
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching performance data:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Get equipment comparison
   */
  async getEquipmentComparison() {
    try {
      const mewp = await this.getDevicesByCategory('mewp');
      const battery = await this.getDevicesByCategory('battery-pack');
      const towerLight = await this.getDevicesByCategory('tower-light');
      
      return {
        labels: ['Active', 'Idle', 'Maintenance', 'Revenue (₹1000s)'],
        datasets: [
          {
            label: 'MEWP',
            data: [
              Math.floor(mewp.length * 0.7),
              Math.floor(mewp.length * 0.2),
              Math.floor(mewp.length * 0.1),
              mewp.length * 450
            ],
            backgroundColor: 'rgba(33, 150, 243, 0.8)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Battery Pack',
            data: [
              Math.floor(battery.length * 0.7),
              Math.floor(battery.length * 0.2),
              Math.floor(battery.length * 0.1),
              battery.length * 180
            ],
            backgroundColor: 'rgba(76, 175, 80, 0.8)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Tower Light',
            data: [
              Math.floor(towerLight.length * 0.7),
              Math.floor(towerLight.length * 0.2),
              Math.floor(towerLight.length * 0.1),
              towerLight.length * 320
            ],
            backgroundColor: 'rgba(255, 152, 0, 0.8)',
            borderColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching equipment comparison:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Get location data
   */
  async getLocationData() {
    try {
      return {
        labels: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
        datasets: [{
          data: [12, 15, 10, 8, 7],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderWidth: 2
        }]
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Get alerts
   */
  async getAlerts() {
    try {
      const devices = await this.getUniqueDevices();
      const alerts = [];
      
      devices.forEach(device => {
        if (device.battery_monitor && device.battery_monitor < 11.5) {
          alerts.push({
            severity: 'critical',
            title: 'Low Battery Alert',
            message: `${device.device_id} battery is critically low (${device.battery_monitor.toFixed(2)}V)`,
            time: '5 minutes ago'
          });
        }
        
        if (device.engine_working_hours && device.engine_working_hours > 1000) {
          alerts.push({
            severity: 'warning',
            title: 'Maintenance Due',
            message: `${device.device_id} requires scheduled maintenance`,
            time: '1 hour ago'
          });
        }
      });
      
      if (alerts.length === 0) {
        alerts.push({
          severity: 'info',
          title: 'All Systems Normal',
          message: 'No critical alerts at this time',
          time: 'Just now'
        });
      }
      
      return alerts.slice(0, 5);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    try {
      const devices = await this.getUniqueDevices();
      
      return devices.slice(0, 10).map((device, index) => {
        const deviceInfo = this.parseDeviceId(device.device_id);
        
        return {
          id: index,
          device: device.device_id,
          activity: 'Operating',
          location: device.location ? 
            `${device.location.lat.toFixed(4)}, ${device.location.lon.toFixed(4)}` : 
            `Site ${index + 1}`,
          time: new Date(device.timestamp || device.on_off_time).toLocaleString(),
          status: 'Active',
          type: deviceInfo.category,
          fuel: device.engine_fuel_rate || Math.floor(Math.random() * 40) + 60
        };
      });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Export functions
   */
  async exportToPDF(data) {
    console.log('Exporting to PDF:', data);
    alert('PDF export functionality coming soon!');
  }

  async exportToExcel(data) {
    console.log('Exporting to Excel:', data);
    alert('Excel export functionality coming soon!');
  }

  async exportToCSV(data, startDate, endDate) {
    console.log('Exporting to CSV:', data, startDate, endDate);
    alert('CSV export functionality coming soon!');
  }
}

const deviceService = new DeviceService();
export default deviceService;