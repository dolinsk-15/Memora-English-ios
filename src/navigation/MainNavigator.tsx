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
//import PaywallScreen from '../screens/Paywall/PaywallScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="LessonList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LessonList" component={LessonListScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="Words" component={WordsScreen} />
      <Stack.Screen name="Sentences" component={SentencesScreen} />
      {/* <Stack.Screen name="Texts" component={TextsScreen} /> */}
      <Stack.Screen name="Exam" component={ExamScreen} />
      <Stack.Screen name="RepeatCounting" component={RepeatCountingScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
      
    </Stack.Navigator>
  );
};

export default MainNavigator; 