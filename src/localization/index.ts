import russian from './translations/russian';
import spanish from './translations/spanish';
import french from './translations/french';
import german from './translations/german';
import english from './translations/english';
import { SupportedLanguage } from '../contexts/LocalizationContext';
import { useLocalization } from '../contexts/LocalizationContext';

// Типы для функции перевода
type TranslationFunction = (key: string, params?: Record<string, any>) => string;
interface TranslationType {
  [key: string]: string | TranslationType;
}

// Флаг для включения/отключения отладочного логирования
const DEBUG_TRANSLATIONS = false;

const translations = {
  en: english,
  ru: russian,
  es: spanish,
  fr: french,
  de: german
};

export const getTranslation = (language: SupportedLanguage) => {
  if (!translations[language]) {
    console.warn(`Missing translations for language: ${language}, falling back to ru`);
    return translations.ru;
  }
  return translations[language];
};

// Определяем хук useTranslation прямо в этом файле вместо импорта
export const useTranslation = () => {
  const { language } = useLocalization();
  const translations = getTranslation(language) as TranslationType;

  const t: TranslationFunction = (key, params = {}) => {
    try {
      // Выводим отладочные логи только если включен режим отладки
      if (DEBUG_TRANSLATIONS) {
        console.log(`Translating key: ${key} for language: ${language}`);
        console.log('Available translations:', JSON.stringify(translations).substring(0, 200) + '...');
      }
      
      // Разделяем ключ на сегменты (например, "words.irregularVerb" -> ["words", "irregularVerb"])
      const segments = key.split('.');
      let result: any = translations;

      // Проходим по сегментам ключа, чтобы найти значение в объекте переводов
      for (const segment of segments) {
        if (!result || result[segment] === undefined) {
          if (DEBUG_TRANSLATIONS) {
            console.warn(`Translation key not found: ${key} (segment: ${segment})`);
          }
          return key; // Возвращаем ключ, если перевод не найден
        }
        result = result[segment];
      }

      // Если значение - строка, заменяем параметры
      if (typeof result === 'string') {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramValue));
        }, result);
      }

      if (DEBUG_TRANSLATIONS) {
        console.warn(`Translation key resolves to non-string: ${key}`);
      }
      return key;
    } catch (error) {
      console.error(`Error getting translation for key: ${key}`, error);
      return key;
    }
  };

  return { t, language };
};

// Создаем и экспортируем объект i18n
// Объект содержит метод changeLanguage, который используется в LocalizationContext
export const i18n = {
  changeLanguage: (language: string) => {
    if (DEBUG_TRANSLATIONS) {
      console.log(`Changing language to: ${language}`);
    }
    // Здесь может быть логика изменения языка,
    // но основная работа с языком происходит через useLocalization
    return Promise.resolve();
  }
}; 