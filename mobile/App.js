import React from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme as PaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DevicesScreen from './screens/DevicesScreen';
import DeviceDetailsScreen from './screens/DeviceDetailsScreen';
import DashboardScreen from './screens/DashboardScreen';
import GeofencingScreen from './screens/GeofencingScreen';
import BillingScreen from './screens/BillingScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = {
  ...PaperTheme,
  colors: {
    ...PaperTheme.colors,
    primary: '#1976d2',
    secondary: '#1565c0',
    surfaceVariant: '#f5f7fb',
  },
};

function DevicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Devices" component={DevicesScreen} options={{ title: 'Devices' }} />
      <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} options={({ route }) => ({ title: `Device ${route.params?.deviceId}` })} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={{
        ...NavigationDefaultTheme,
        colors: { ...NavigationDefaultTheme.colors, primary: '#1976d2', background: '#ffffff' },
      }}>
        <Tab.Navigator screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1976d2',
          tabBarInactiveTintColor: '#78909c',
          tabBarStyle: { height: 56 },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Dashboard: 'view-dashboard',
              Devices: 'devices',
              Geofencing: 'map-marker-radius',
              Billing: 'receipt',
              Settings: 'cog',
              Help: 'help-circle',
            };
            return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
          },
        })}>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Devices" component={DevicesStack} />
          <Tab.Screen name="Geofencing" component={GeofencingScreen} />
          <Tab.Screen name="Billing" component={BillingScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Help" component={HelpScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
