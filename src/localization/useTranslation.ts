import { useLocalization } from '../contexts/LocalizationContext';
import { getTranslation } from './index';
import { SupportedLanguage } from '../contexts/LocalizationContext';

type TranslationFunction = (key: string, params?: Record<string, any>) => string;

interface TranslationType {
  [key: string]: string | TranslationType;
}

const useTranslation = () => {
  // Используем хук useLocalization вместо прямого доступа к контексту
  const { language } = useLocalization();
  const translations = getTranslation(language) as TranslationType;

  const t: TranslationFunction = (key, params = {}) => {
    try {
      // Разделяем ключ на сегменты (например, "lessons.title" -> ["lessons", "title"])
      const segments = key.split('.');
      let result: any = translations;

      // Проходим по сегментам ключа, чтобы найти значение в объекте переводов
      for (const segment of segments) {
        if (!result || result[segment] === undefined) {
          console.warn(`Translation key not found: ${key} (segment: ${segment})`);
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

      console.warn(`Translation key resolves to non-string: ${key}`);
      return key;
    } catch (error) {
      console.error(`Error getting translation for key: ${key}`, error);
      return key;
    }
  };

  return { t, language };
};

export default useTranslation; 