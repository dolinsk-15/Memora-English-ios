export type MainStackParamList = {
  LessonList: undefined;
  LessonDetail: { lessonId: number };
  Description: { lessonId: number };
  Words: {
    lessonId: number;
    wordListType?: 'firstList' | 'secondList';
  };
  Sentences: { lessonId: number };
  Texts: { lessonId: number };
  Exam: { lessonId: number };
  RepeatCounting: { 
    lessonId: number;
    itemId?: number;
    itemType?: 'word' | 'sentence' | 'text';
    targetRepetitions?: number;
    textData?: {
      english: string;
      translated: string;
    };
  };
  Settings: undefined;
  Paywall: undefined;
  ChangeLanguage: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  LanguageSelection: undefined;
};

export type RootStackParamList = {
  MainStack: undefined;
  AuthStack: undefined;
}; 