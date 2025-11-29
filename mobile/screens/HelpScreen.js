import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function HelpScreen() {
  return (
    <Card style={{ margin: 16 }}>
      <Card.Title title="Help" subtitle="Support & FAQs" />
      <Card.Content>
        <Text>FAQs and support contact will appear here.</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({});