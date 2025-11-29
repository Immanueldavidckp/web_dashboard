import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, ProgressBar, MD3Colors, Avatar } from 'react-native-paper';

export default function DeviceDetailsScreen({ route }) {
  const { device } = route.params;

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text>No device data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Title
          title={device.device_id}
          subtitle={`Last Update: ${new Date(device.timestamp).toLocaleString()}`}
          left={(props) => <Avatar.Icon {...props} icon="tablet" />}
        />
        <Card.Content>
          <View style={styles.chipContainer}>
            <Chip icon="car" style={styles.chip}>Machine: {device.machine_details}</Chip>
            <Chip icon="battery" style={styles.chip}>Battery: {device.battery_monitor}%</Chip>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.gridContainer}>
        <Card style={styles.gridItem}>
          <Card.Title title="Engine RPM" />
          <Card.Content>
            <Text variant="headlineMedium">{device.engine_rpm}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.gridItem}>
          <Card.Title title="Engine Temp" />
          <Card.Content>
            <Text variant="headlineMedium">{device.engine_temp}°C</Text>
          </Card.Content>
        </Card>
        <Card style={styles.gridItem}>
          <Card.Title title="Oil Pressure" />
          <Card.Content>
            <Text variant="headlineMedium">{device.oil_pressure} psi</Text>
          </Card.Content>
        </Card>
        <Card style={styles.gridItem}>
          <Card.Title title="Location" />
          <Card.Content>
            <Text>Lat: {device.location.latitude}</Text>
            <Text>Lon: {device.location.longitude}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.gridItem}>
          <Card.Title title="MPU6050 Data" />
          <Card.Content>
            <Text>Accel X: {device.mpu6050.accelX}</Text>
            <Text>Gyro Y: {device.mpu6050.gyroY}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.gridItem}>
          <Card.Title title="GNSS Data" />
          <Card.Content>
            <Text>Satellites: {device.gnss.satellites}</Text>
            <Text>HDOP: {device.gnss.hdop}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.gridItem}>
          <Card.Title title="On/Off Time" />
          <Card.Content>
            <Text>{device.on_off_time}</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 8,
  },
  chipContainer: {
    flexDirection: 'row
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  gridItem: {
    width: '48%', // Roughly half the screen width
    marginBottom: 8,
  },
});