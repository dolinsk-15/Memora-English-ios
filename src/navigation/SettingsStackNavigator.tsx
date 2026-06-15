import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ChangeLanguageScreen from '../screens/Settings/ChangeLanguageScreen';

export type SettingsStackParamList = {
  Settings: undefined;
  ChangeLanguage: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator; 