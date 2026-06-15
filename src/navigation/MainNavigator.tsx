import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';

// Import screens from the index file
import {
  LessonListScreen,
  LessonDetailScreen,
  DescriptionScreen,
  WordsScreen,
  SentencesScreen,
  // TextsScreen,
  RepeatCountingScreen
} from '../screens/Main';
import ExamScreen from '../screens/Main/ExamScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ChangeLanguageScreen from '../screens/Settings/ChangeLanguageScreen';
// import PaywallScreen from '../screens/Paywall/PaywallScreen';
import CustomPaywallScreen from '../screens/Paywall/CustomPaywallScreen';
import { PaywallNavigator } from './PaywallNavigator';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/Main/ProfileScreen';
import StreakScreen from '../screens/Main/StreakScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="TabNavigator"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />

      <Stack.Screen
        name="Paywall"
        component={CustomPaywallScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="PaywallFlow"
        component={PaywallNavigator}
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: false,
          fullScreenGestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator; 