/// <reference types="node" />

/**
 * Служба для работы с данными уроков
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

function getLessonData(lessonId: number) {
  switch (lessonId) {
    case 1:
      return require('../../data/lessons/lesson1.json');
    case 2:
      return require('../../data/lessons/lesson2.json');
    case 3:
      return require('../../data/lessons/lesson3.json');
    case 4:
      return require('../../data/lessons/lesson4.json');
    case 5:
      return require('../../data/lessons/lesson5.json');
    case 6:
      return require('../../data/lessons/lesson6.json');
    case 7:
      return require('../../data/lessons/lesson7.json');
    case 8:
      return require('../../data/lessons/lesson8.json');
    case 9:
      return require('../../data/lessons/lesson9.json');
    case 10:
      return require('../../data/lessons/lesson10.json');
    case 11:
      return require('../../data/lessons/lesson11.json');
    case 12:
      return require('../../data/lessons/lesson12.json');
    case 13:
      return require('../../data/lessons/lesson13.json');
    case 14:
      return require('../../data/lessons/lesson14.json');
    case 15:
      return require('../../data/lessons/lesson15.json');
    case 16:
      return require('../../data/lessons/lesson16.json');
    case 17:
      return require('../../data/lessons/lesson17.json');
    case 18:
      return require('../../data/lessons/lesson18.json');
    default:
      throw new Error('Unknown lessonId: ' + lessonId);
  }
}

class LessonService {
  // Получение предложений для урока
  async getLessonSentences(lessonId: number): Promise<any[]> {
    try {
      const lessonData = getLessonData(lessonId);
        return lessonData.sentences || [];
    } catch (error) {
      console.error(`Ошибка загрузки предложений для урока ${lessonId}:`, error);
      return [];
    }
  }

  // Получение словаря для урока
  async getLessonVocabulary(lessonId: number): Promise<any> {
    try {
      const lessonData = getLessonData(lessonId);
        
        // Подготовка данных словаря
        const firstList = lessonData.vocabulary?.firstList || [];
        const secondList = lessonData.vocabulary?.secondList || [];
        
        const firstListWithSource = firstList.map((word: any) => ({
          ...word,
          listSource: 'firstList'
        }));
        
        const secondListWithSource = secondList.map((word: any) => ({
          ...word,
          listSource: 'secondList'
        }));
        
        const allWords = [...firstListWithSource, ...secondListWithSource];
        
        return {
          firstList: firstListWithSource,
          secondList: secondListWithSource,
          allWords
        };
    } catch (error) {
      console.error(`Ошибка загрузки словаря для урока ${lessonId}:`, error);
      return { firstList: [], secondList: [], allWords: [] };
    }
  }

  // Добавляем новый метод для получения данных экзамена
  async getLessonExam(lessonId: number): Promise<any[]> {
    try {
      const lessonData = getLessonData(lessonId);
        return lessonData.exam?.sentences || [];
    } catch (error) {
      console.error(`Ошибка загрузки данных экзамена для урока ${lessonId}:`, error);
      return [];
    }
  }
}

// Экспортируем синглтон
export const lessonService = new LessonService(); 