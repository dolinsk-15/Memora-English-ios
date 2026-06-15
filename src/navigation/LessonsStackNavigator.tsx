import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LessonListScreen from '../screens/Main/LessonListScreen';
import LessonDetailScreen from '../screens/Main/LessonDetailScreen';
import DescriptionScreen from '../screens/Main/DescriptionScreen';
import WordsScreen from '../screens/Main/WordsScreen';
import LearnWordsScreen from '../screens/Main/LearnWordsScreen';
import SentencesScreen from '../screens/Main/SentencesScreen';
import ExamScreen from '../screens/Main/ExamScreen';
import RepeatCountingScreen from '../screens/Main/RepeatCountingScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ChangeLanguageScreen from '../screens/Settings/ChangeLanguageScreen';

export type LessonsStackParamList = {
  LessonList: undefined;
  LessonDetail: { lessonId: number };
  Description: { 
    lessonId: number;
    onDescriptionViewed?: () => void;
  };
  Words: {
    lessonId: number;
    wordListType?: 'firstList' | 'secondList';
  };
  LearnWords: {
    lessonId: number;
    wordListType?: 'firstList' | 'secondList';
  };
  Sentences: { lessonId: number };
  Exam: { lessonId: number };
  RepeatCounting: {
    lessonId: number;
    itemId?: number;
    itemType?: 'word' | 'sentence' | 'text';
    targetRepetitions?: number;
    onProgressUpdate?: () => void;
  };
  Settings: undefined;
  ChangeLanguage: undefined;
};

const Stack = createNativeStackNavigator<LessonsStackParamList>();

const LessonsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LessonList" component={LessonListScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="Words" component={WordsScreen} />
      <Stack.Screen name="LearnWords" component={LearnWordsScreen} />
      <Stack.Screen name="Sentences" component={SentencesScreen} />
      <Stack.Screen name="Exam" component={ExamScreen} />
      <Stack.Screen name="RepeatCounting" component={RepeatCountingScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
    </Stack.Navigator>
  );
};

export default LessonsStackNavigator; 