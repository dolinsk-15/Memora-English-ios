import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { i18n } from '../localization'; // Был: import i18n from '../localization';

// Поддерживаемые языки приложения
export type SupportedLanguage = 'russian' | 'spanish' | 'french' | 'german';

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

export const languageOptions: LanguageOption[] = [
  { id: 'russian', name: 'Russian', nativeName: 'Русский' },
  { id: 'spanish', name: 'Spanish', nativeName: 'Español' },
  { id: 'french', name: 'French', nativeName: 'Français' },
  { id: 'german', name: 'German', nativeName: 'Deutsch' },
];

// Ключ для хранения языка в AsyncStorage
const LANGUAGE_STORAGE_KEY = 'user_language';
const USER_ID_STORAGE_KEY = 'anonymous_user_id';

type LocalizationContextType = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  getLanguageOption: (id: SupportedLanguage) => LanguageOption;
  userId: string | null;
  isLanguageSelected: boolean;
  resetProgress: () => Promise<void>;
  refreshUI: () => void;
};

const LocalizationContext = createContext<LocalizationContextType>({
  language: 'russian',
  setLanguage: () => {},
  getLanguageOption: () => languageOptions[0],
  userId: null,
  isLanguageSelected: false,
  resetProgress: async () => {},
  refreshUI: () => {}
});

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('russian');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Создаем или получаем анонимный ID пользователя
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Создаем или получаем анонимный ID пользователя
        let storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
        
        if (!storedUserId) {
          // Если нет ID, генерируем новый
          storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          await AsyncStorage.setItem(USER_ID_STORAGE_KEY, storedUserId);
        }
        
        setUserId(storedUserId);
        
        // Проверяем, выбирал ли пользователь язык ранее
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLanguage) {
          setLanguageState(storedLanguage as SupportedLanguage);
          setIsLanguageSelected(true); // Устанавливаем флаг, что язык выбран
          // Обновляем язык в i18n
          i18n.changeLanguage(storedLanguage);
        } else {
          setIsLanguageSelected(false); // Явно устанавливаем false, если язык еще не выбран
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Функция для принудительного обновления UI
  const refreshUI = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Функция для изменения языка
  const setLanguage = async (newLanguage: SupportedLanguage) => {
    try {
      console.log(`Setting language to: ${newLanguage}`);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
      setIsLanguageSelected(true);
      // Обновляем язык в i18n
      i18n.changeLanguage(newLanguage);
      // Вызываем обновление UI
      refreshUI();
      console.log(`Language successfully set to: ${newLanguage}`);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // Получение информации о языке по его ID
  const getLanguageOption = (id: SupportedLanguage): LanguageOption => {
    return languageOptions.find(option => option.id === id) || languageOptions[0];
  };

  // Сброс прогресса при смене языка (но сохранение оплаты)
  const resetProgress = async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      
      // Фильтруем ключи, связанные с прогрессом
      const progressKeys = keys.filter(key => {
        // Исключаем ключи связанные с языком, пользователем и оплатой
        return (
          !key.includes(LANGUAGE_STORAGE_KEY) && 
          !key.includes(USER_ID_STORAGE_KEY) && 
          !key.includes('payment') &&
          !key.includes('purchased')
        );
      });
      
      if (progressKeys.length > 0) {
        await AsyncStorage.multiRemove(progressKeys);
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  // Если ещё загружаем язык, показываем загрузочный экран или ничего
  if (isLoading) {
    return null; // или компонент загрузки
  }

  return (
    <LocalizationContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        getLanguageOption, 
        userId, 
        isLanguageSelected,
        resetProgress,
        refreshUI
      }}
    >
      <View key={`localization-wrapper-${refreshTrigger}`} style={{ flex: 1 }}>
        {children}
      </View>
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}; 