import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Импортируем только экран выбора языка
import LanguageSelectionScreen from '../screens/Auth/LanguageSelectionScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Add explicit typing for the AuthNavigator component
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="LanguageSelection"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 