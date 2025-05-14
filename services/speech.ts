import Tts from 'react-native-tts';

export const speakWord = async (word: string, language: string = 'ru-RU') => {
  try {
    await Tts.setDefaultLanguage(language);
    await Tts.speak(word);
  } catch (error) {
    console.error('Error speaking word:', error);
  }
}; 