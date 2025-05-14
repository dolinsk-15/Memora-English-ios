import React, { createContext, useContext } from 'react';
import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

// Определяем тип для контекста навигации
export type RootNavigationContextType = {
  resetToMain: () => void;
  resetToAuth: () => void;
};

// Создаем сам контекст с начальным значением null
export const RootNavigationContext = createContext<RootNavigationContextType | null>(null);

// Провайдер контекста навигации
export const RootNavigationProvider: React.FC<{
  children: React.ReactNode;
  navigation: NavigationContainerRef<RootStackParamList>;
}> = ({ children, navigation }) => {
  // Функция для перехода на главный экран
  const resetToMain = () => {
    try {
      if (navigation && navigation.isReady()) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainStack' }],
          })
        );
      }
    } catch (error) {
      console.error('Error in resetToMain:', error);
    }
  };

  // Функция для перехода на экран аутентификации
  const resetToAuth = () => {
    try {
      if (navigation && navigation.isReady()) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }],
          })
        );
      }
    } catch (error) {
      console.error('Error in resetToAuth:', error);
    }
  };

  return (
    <RootNavigationContext.Provider value={{ resetToMain, resetToAuth }}>
      {children}
    </RootNavigationContext.Provider>
  );
};

// Хук для использования навигации
export const useRootNavigation = () => {
  const context = useContext(RootNavigationContext);
  const navigation = useNavigation();
  
  if (!context) {
    console.warn('useRootNavigation used outside of RootNavigationProvider, using fallback');
    
    return {
      resetToMain: () => {
        try {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainStack' }],
            })
          );
        } catch (error) {
          console.error('Error in fallback resetToMain:', error);
        }
      },
      resetToAuth: () => {
        try {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            })
          );
        } catch (error) {
          console.error('Error in fallback resetToAuth:', error);
        }
      }
    };
  }
  
  return context;
}; 