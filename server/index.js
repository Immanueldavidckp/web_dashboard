const express = require("express"); 
const axios = require("axios"); 
const cors = require("cors"); 
require("dotenv").config(); 
 
const app = express(); 
 
// =============================== 
//  Middleware 
// =============================== 
app.use(cors()); // Enable CORS for frontend 
app.use(express.json()); 
 
// =============================== 
//  Configuration 
// =============================== 
const PORT = process.env.PORT || 5000; 
 
// 👇 Use your actual AWS API Gateway URL 
const API_GATEWAY_URL = 
  process.env.API_GATEWAY_URL || 
  "https://s3vbl2my95.execute-api.us-east-1.amazonaws.com/prod"; 
 
// =============================== 
//  Routes 
// =============================== 
 
// Root test route 
app.get("/", (req, res) => { 
  res.send("✅ Device Data Backend is running successfully!"); 
}); 
 
// Get all device data (GET) 
app.get("/api/devices", async (req, res) => { 
  try { 
    console.log("📡 Fetching all devices from DynamoDB..."); 
    const response = await axios.get(`${API_GATEWAY_URL}/device-data`); 
    console.log("✅ Successfully fetched devices"); 
    res.json(response.data); 
  } catch (error) { 
    console.error("❌ Error fetching devices:", error.response?.data || error.message); 
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch device data", 
      details: error.response?.data || error.message 
    }); 
  } 
}); 
 
// Get specific device by ID 
app.get("/api/devices/:deviceId", async (req, res) => { 
  const { deviceId } = req.params; 
  try { 
    console.log(`📡 Fetching device ID: ${deviceId}`); 
    const response = await axios.get(`${API_GATEWAY_URL}/device-data/${deviceId}`); 
    console.log(`✅ Successfully fetched device ${deviceId}`); 
    res.json(response.data); 
  } catch (error) { 
    console.error(`❌ Error fetching device ${deviceId}:`, error.response?.data || error.message); 
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch device by ID", 
      details: error.response?.data || error.message 
    }); 
  } 
}); 
 
// Get specific device by ID and timestamp 
app.get("/api/devices/:deviceId/:timestamp", async (req, res) => { 
  const { deviceId, timestamp } = req.params; 
  try { 
    console.log(`📡 Fetching device ${deviceId} at ${timestamp}`); 
    const response = await axios.get(`${API_GATEWAY_URL}/device-data/${deviceId}/${timestamp}`); 
    console.log(`✅ Successfully fetched device ${deviceId} at ${timestamp}`); 
    res.json(response.data); 
  } catch (error) { 
    console.error(`❌ Error fetching device ${deviceId} at ${timestamp}:`, error.response?.data || error.message); 
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch device data by timestamp", 
      details: error.response?.data || error.message 
    }); 
  } 
}); 
 
// Post new device data 
app.post("/api/devices", async (req, res) => { 
  try { 
    console.log("📤 Sending device data to DynamoDB via API Gateway..."); 
    const response = await axios.post(`${API_GATEWAY_URL}/device-data`, req.body); 
    console.log("✅ Successfully posted device data"); 
    res.json(response.data); 
  } catch (error) { 
    console.error("❌ Error posting device data:", error.response?.data || error.message); 
    res.status(error.response?.status || 500).json({ 
      error: "Failed to post device data", 
      details: error.response?.data || error.message 
    }); 
  } 
}); 
 
// Health check endpoint 
app.get("/api/health", (req, res) => { 
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(), 
    apiGateway: API_GATEWAY_URL 
  }); 
}); 
 
// =============================== 
//  Start Server 
// =============================== 
app.listen(PORT, () => { 
  console.log("🚀 Backend server running successfully!"); 
  console.log(`📍 Local Server: http://localhost:${PORT}`); 
  console.log(`📍 Connected API Gateway: ${API_GATEWAY_URL}`); 
  console.log("\n📋 Available Endpoints:"); 
  console.log("   GET    /api/devices"); 
  console.log("   GET    /api/devices/:deviceId"); 
  console.log("   GET    /api/devices/:deviceId/:timestamp"); 
  console.log("   POST   /api/devices"); 
  console.log("   GET    /api/health"); 
});