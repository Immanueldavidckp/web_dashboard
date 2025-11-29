import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <Card style={{ margin: 16 }}>
      <Card.Title title="Settings" subtitle="App Preferences" />
      <Card.Content>
        <Text>App settings will go here.</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({});