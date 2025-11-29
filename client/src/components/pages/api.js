import axios from 'axios';

const API_URL = '/api'; // Adjust this URL based on your server setup

// Geofence API
export const getGeofences = () => axios.get(`${API_URL}/geofencing`);
export const createGeofence = (geofence) => axios.post(`${API_URL}/geofencing`, geofence);
export const updateGeofence = (id, geofence) => axios.put(`${API_URL}/geofencing/${id}`, geofence);
export const deleteGeofence = (id) => axios.delete(`${API_URL}/geofencing/${id}`);

// Device API
export const getDevices = () => axios.get(`${API_URL}/devices`);
export const createDevice = (device) => axios.post(`${API_URL}/devices`, device);
export const updateDevice = (id, device) => axios.put(`${API_URL}/devices/${id}`, device);
export const deleteDevice = (id) => axios.delete(`${API_URL}/devices/${id}`);
export const getDeviceById = (id) => axios.get(`${API_URL}/devices/${id}`);