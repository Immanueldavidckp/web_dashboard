const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Geofence = require('../models/Geofence');
const Device = require('../models/Device');

// @route   GET api/geofencing
// @desc    Get all geofences
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const geofences = await Geofence.find().sort({ createdAt: -1 });
    res.json(geofences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/geofencing/:id
// @desc    Get geofence by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    
    res.json(geofence);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/geofencing
// @desc    Create a geofence
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      circle,
      polygon,
      devices,
      alerts
    } = req.body;

    // Create new geofence
    const newGeofence = new Geofence({
      name,
      description,
      type,
      circle: type === 'circle' ? circle : undefined,
      polygon: type === 'polygon' ? polygon : undefined,
      devices,
      alerts,
      createdBy: req.user.id
    });

    const geofence = await newGeofence.save();
    res.json(geofence);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/geofencing/:id
// @desc    Update a geofence
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    
    // Update fields
    const updateFields = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // Update geofence
    const updatedGeofence = await Geofence.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(updatedGeofence);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/geofencing/:id
// @desc    Delete a geofence
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    
    await geofence.remove();
    res.json({ message: 'Geofence removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/geofencing/devices/:id
// @desc    Get all devices within a geofence
// @access  Private
router.get('/devices/:id', auth, async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    
    let devices = [];
    
    if (geofence.type === 'circle') {
      // Find devices within circle
      devices = await Device.find({
        location: {
          $geoWithin: {
            $centerSphere: [
              geofence.circle.center.coordinates,
              geofence.circle.radius / 6378137 // Convert meters to radians
            ]
          }
        }
      });
    } else if (geofence.type === 'polygon') {
      // Find devices within polygon
      devices = await Device.find({
        location: {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: geofence.polygon.coordinates
            }
          }
        }
      });
    }
    
    res.json(devices);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/geofencing/:id/devices
// @desc    Add devices to a geofence
// @access  Private
router.post('/:id/devices', auth, async (req, res) => {
  try {
    const { deviceIds } = req.body;
    
    const geofence = await Geofence.findById(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    
    // Add devices to geofence
    geofence.devices = [...new Set([...geofence.devices, ...deviceIds])];
    geofence.updatedAt = Date.now();
    
    await geofence.save();
    res.json(geofence);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/geofencing/:id/devices/:deviceId
// @desc    Remove a device from a geofence
// @access  Private
router.delete('/:id/devices/:deviceId', auth, async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    
    // Remove device from geofence
    geofence.devices = geofence.devices.filter(
      device => device.toString() !== req.params.deviceId
    );
    geofence.updatedAt = Date.now();
    
    await geofence.save();
    res.json(geofence);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Geofence not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;