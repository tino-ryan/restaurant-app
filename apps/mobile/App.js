import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import CustomerMenuScreen from './screens/CustomerMenuPage';
import OrderConfirmation from './screens/OrderConfirmation';
import BillScreen from './screens/BillScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen
          name="Menu"
          component={CustomerMenuScreen}
          options={{ title: 'Restaurant Menu' }}
        />
        <Stack.Screen
          name="confirmOrder"
          component={OrderConfirmation}
          options={{ title: 'Cart' }}
        />
        <Stack.Screen
          name="Bill"
          component={BillScreen}
          options={{ title: 'Your Bill' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
