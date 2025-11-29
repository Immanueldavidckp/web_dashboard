import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip, ProgressBar, Button, Searchbar, ActivityIndicator, Avatar, MD3Colors } from 'react-native-paper';
import axios from 'axios';

export default function DevicesScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        // Update to call your local backend endpoint
        const response = await axios.get('http://192.168.0.7:5000/api/devices'); 
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setError('Failed to load devices.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const filteredDevices = devices.filter(device =>
    device.device_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading devices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const renderDeviceItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('DeviceDetails', { deviceId: item.device_id, device: item })}>
      <Card.Title
        title={item.device_id}
        subtitle={`Last Update: ${new Date(item.timestamp).toLocaleString()}`}
        left={(props) => <Avatar.Icon {...props} icon="tablet" />}
      />
      <Card.Content>
        <View style={styles.detailRow}>
          <Chip icon="map-marker">{item.location.latitude}, {item.location.longitude}</Chip>
          <Chip icon="engine">RPM: {item.engine_rpm}</Chip>
        </View>
        <View style={styles.detailRow}>
          <Chip icon="thermometer">Temp: {item.engine_temp}°C</Chip>
          <Chip icon="oil">Pressure: {item.oil_pressure} psi</Chip>
        </View>
        <View style={styles.batteryContainer}>
          <Text>Battery:</Text>
          <ProgressBar
            progress={item.battery_monitor / 100}
            color={item.battery_monitor > 20 ? MD3Colors.green500 : MD3Colors.red500}
            style={styles.progressBar}
          />
          <Text>{item.battery_monitor}%</Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('DeviceDetails', { deviceId: item.device_id, device: item })}>View Details</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search devices..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.device_id}
        renderItem={renderDeviceItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
  searchBar: {
    margin: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  card: {
    margin: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 10,
    marginHorizontal: 8,
    borderRadius: 5,
  },
});