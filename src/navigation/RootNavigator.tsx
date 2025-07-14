import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { ActivityIndicator, View } from 'react-native';

// Import navigators
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import { LocalizationProvider, useLocalization } from '../contexts/LocalizationContext';
// import SuperwallService from '../services/SuperwallService';
import { RootNavigationProvider } from '../contexts/RootNavigationContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create auth context
export const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  isAuthenticated: boolean;
}>({
  signIn: () => {},
  signOut: () => {},
  isAuthenticated: false,
});

// Create auth provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authContext = {
    signIn: () => {
      setIsAuthenticated(true);
    },
    signOut: () => {
      setIsAuthenticated(false);
    },
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Создаем компонент для навигации, который будет использовать контекст локализации
const RootNavigationStack = () => {
  const { isLanguageSelected } = useLocalization();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isLanguageSelected ? (
        // Если язык уже выбран, показываем основной навигатор с уроками
        <Stack.Screen name="MainStack" component={MainNavigator} />
      ) : (
        // Если язык еще не выбран, показываем экран выбора языка
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Основной компонент-навигатор, который предоставляет контекст локализации
const RootNavigator = ({ onReady }: { onReady?: () => void }) => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Метод, вызываемый когда навигация готова
  const onNavigationReady = () => {
    setIsNavigationReady(true);
    console.log('Navigation is ready');
    // Вызываем callback, если он передан
    if (onReady) {
      onReady();
    }
  };

  return (
    <LocalizationProvider>
      <NavigationContainer 
        ref={navigationRef}
        onReady={onNavigationReady}
      >
        {navigationRef.current ? (
          <RootNavigationProvider navigation={navigationRef.current}>
            <RootNavigationStack />
          </RootNavigationProvider>
        ) : (
          <RootNavigationStack />
        )}
      </NavigationContainer>
    </LocalizationProvider>
  );
};

export default RootNavigator; 