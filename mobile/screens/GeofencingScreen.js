import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function GeofencingScreen() {
  return (
    <Card style={{ margin: 16 }}>
      <Card.Title title="Geofencing" subtitle="Preview" />
      <Card.Content>
        <Text>Map view placeholder. Geofences list will appear here.</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({});