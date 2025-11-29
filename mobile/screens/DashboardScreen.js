import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';

export default function DashboardScreen() {
  const stats = {
    total: 24,
    active: 18,
    maintenance: 3,
    inactive: 3,
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={{ marginBottom: 12 }}>Dashboard</Text>
      <View style={styles.row}>
        <Card style={styles.card}><Card.Content><View style={styles.cell}><Avatar.Icon size={36} icon="counter" /><Text>Total</Text><Text variant="titleLarge">{stats.total}</Text></View></Card.Content></Card>
        <Card style={styles.card}><Card.Content><View style={styles.cell}><Avatar.Icon size={36} icon="check-circle" /><Text>Active</Text><Text variant="titleLarge" style={{ color: '#43a047' }}>{stats.active}</Text></View></Card.Content></Card>
      </View>
      <View style={styles.row}>
        <Card style={styles.card}><Card.Content><View style={styles.cell}><Avatar.Icon size={36} icon="tools" /><Text>Maintenance</Text><Text variant="titleLarge" style={{ color: '#fb8c00' }}>{stats.maintenance}</Text></View></Card.Content></Card>
        <Card style={styles.card}><Card.Content><View style={styles.cell}><Avatar.Icon size={36} icon="close-circle" /><Text>Inactive</Text><Text variant="titleLarge" style={{ color: '#e53935' }}>{stats.inactive}</Text></View></Card.Content></Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, flex: 1, marginRight: 8 },
  cell: { alignItems: 'center', gap: 6 },
});