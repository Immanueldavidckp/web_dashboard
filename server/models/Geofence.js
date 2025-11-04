const mongoose = require('mongoose');

const GeofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['circle', 'polygon'],
    required: true
  },
  // For circle type
  circle: {
    center: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    radius: {
      type: Number // in meters
    }
  },
  // For polygon type
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]] // Array of arrays of coordinates [longitude, latitude]
    }
  },
  devices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    onEntry: {
      type: Boolean,
      default: true
    },
    onExit: {
      type: Boolean,
      default: true
    },
    recipients: [{
      type: String // email addresses
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geospatial queries
GeofenceSchema.index({ 'circle.center': '2dsphere' });
GeofenceSchema.index({ polygon: '2dsphere' });

module.exports = mongoose.model('Geofence', GeofenceSchema);