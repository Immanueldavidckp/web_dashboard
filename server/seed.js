const mongoose = require('mongoose');
const Device = require('./models/Device');
const dotenv = require('dotenv');

dotenv.config();

const seedDevice = {
  deviceId: 'MEWP-001',
  name: 'MEWP Alpha',
  type: 'MEWP',
  status: 'active',
  location: {
    type: 'Point',
    coordinates: [-73.935242, 40.730610],
  },
  telemetryData: {
    batteryLevel: 85,
    engineStatus: 'on',
    fuelLevel: 70,
    engineRPM: 1500,
    oilPressure: 60,
    engineTemperature: 90,
    hydraulicPressure: 2000,
    tilt: 5,
    angle: 45,
  },
  maintenanceData: {
    lastMaintenance: new Date('2023-01-15'),
    nextMaintenance: new Date('2024-01-15'),
    maintenanceHistory: [
      {
        date: new Date('2023-01-15'),
        type: 'PM-HMR',
        description: 'Preventative maintenance at 1000 hours',
      },
    ],
  },
  usageData: {
    totalUsageHours: 1200,
  },
  customer: {
    customerId: 'CUST-001',
    name: 'Construction Corp',
    contactDetails: 'contact@constructioncorp.com',
  },
  rental: {
    isRented: true,
    rentalStartDate: new Date('2023-06-01'),
    rentalEndDate: new Date('2024-06-01'),
    rentalDetails: 'Standard rental agreement',
  },
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Device.deleteMany({});
    await Device.create(seedDevice);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();