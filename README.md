# MEWP Monitoring Dashboard

A comprehensive web dashboard for monitoring MEWP (Mobile Elevating Work Platform) vehicles and battery packs with telematics control units.

## Features

- **Geofencing**: Track vehicle locations with Google Maps integration
- **Device Management**: Monitor connected devices with telemetry data
- **Billing Information**: Access billing-related information and transactions
- **Authentication**: Secure access to the dashboard
- **Data Integration**: Connection to database and AWS services

## Technical Stack

- **Frontend**: React.js with responsive design
- **Backend**: Node.js
- **Database Integration**: Connection to existing database
- **Cloud Services**: AWS integration

## Project Structure

```
web_dashboard/
├── client/           # React frontend
├── server/           # Node.js backend
├── package.json      # Root package.json for project management
└── README.md         # Project documentation
```

## Setup Instructions

1. **Install Dependencies**:
   ```
   npm run install-all
   ```

2. **Start Development Environment**:
   ```
   npm start
   ```

   This will start both the client and server concurrently.

3. **Access the Dashboard**:
   Open your browser and navigate to `http://localhost:3000`

## Dashboard Pages

1. **Geofencing Page**: Full-page Google Maps interface with geofencing capabilities
2. **Device Management Page**: Display of all connected devices with status and telemetry data
3. **Billing Page**: Information about billing and transactions

## Implementation Notes

- Secure data transmission between frontend and backend
- Proper error handling and loading states
- Authentication for secure access