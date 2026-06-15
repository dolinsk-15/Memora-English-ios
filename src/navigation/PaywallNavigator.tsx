import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaywallOnboarding1 from '../screens/Paywall/PaywallOnboarding1';
import PaywallOnboarding2 from '../screens/Paywall/PaywallOnboarding2';
import CustomPaywallScreen from '../screens/Paywall/CustomPaywallScreen';

export type PaywallStackParamList = {
  PaywallOnboarding1: undefined;
  PaywallOnboarding2: undefined;
  CustomPaywall: undefined;
};

const Stack = createNativeStackNavigator<PaywallStackParamList>();

export function PaywallNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PaywallOnboarding1"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="PaywallOnboarding1" component={PaywallOnboarding1} />
      <Stack.Screen name="PaywallOnboarding2" component={PaywallOnboarding2} />
      <Stack.Screen name="CustomPaywall" component={CustomPaywallScreen} />
    </Stack.Navigator>
  );
} 