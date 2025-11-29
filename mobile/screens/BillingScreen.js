import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';

const invoices = Array.from({ length: 10 }).map((_, i) => ({
  id: `INV-${1000 + i}`,
  customer: `Customer ${i + 1}`,
  amount: (Math.random() * 1000).toFixed(2),
  status: ['Paid', 'Pending', 'Overdue'][Math.floor(Math.random() * 3)],
}));

const statusColor = (s) => s === 'Paid' ? 'green' : s === 'Pending' ? 'orange' : 'red';

export default function BillingScreen() {
  return (
    <FlatList
      data={invoices}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Title title={`${item.id}`} subtitle={item.customer} right={() => (
            <Chip style={{ alignSelf: 'center' }} textStyle={{ color: statusColor(item.status) }}>{item.status}</Chip>
          )} />
          <Card.Content>
            <Text variant="titleMedium">${item.amount}</Text>
          </Card.Content>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { marginBottom: 12 },
});