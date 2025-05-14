// import { supabase } from '../lib/supabase';
// import * as FileSystem from 'expo-file-system';
// import { Asset } from 'expo-asset';

// // Импортируем файл для первого урока
// import lesson1Data from '../../data/lessons/lesson1.json';

// // Данные для урока 1
// const lesson1DataObj = {
//   id: 1,
//   title: {
//     english: "Lesson 1",
//     russian: "Урок 1"
//   },
//   vocabulary: {
//     firstList: [
//       {
//         "number": 1,
//         "english": "I",
//         "russian": "я"
//       },
//       {
//         "number": 2,
//         "english": "you",
//         "russian": "ты / вы"
//       },
//       {
//         "number": 3,
//         "english": "he",
//         "russian": "он"
//       },
//       {
//         "number": 4,
//         "english": "she",
//         "russian": "она"
//       },
//       {
//         "number": 5,
//         "english": "it",
//         "russian": "оно, это"
//       }
//     ],
//     secondList: [
//       {
//         "number": 6,
//         "english": "we",
//         "russian": "мы"
//       },
//       {
//         "number": 7,
//         "english": "they",
//         "russian": "они"
//       },
//       {
//         "number": 8,
//         "english": "go",
//         "russian": "идти"
//       },
//       {
//         "number": 9,
//         "english": "read",
//         "russian": "читать"
//       },
//       {
//         "number": 10,
//         "english": "write",
//         "russian": "писать"
//       }
//     ]
//   },
//   sentences: [
//     {
//       "id": 1,
//       "english": "I will go.",
//       "russian": "Я пойду."
//     },
//     {
//       "id": 2,
//       "english": "She reads books.",
//       "russian": "Она читает книги."
//     },
//     {
//       "id": 3,
//       "english": "They write letters.",
//       "russian": "Они пишут письма."
//     },
//     {
//       "id": 4,
//       "english": "He goes to school.",
//       "russian": "Он ходит в школу."
//     },
//     {
//       "id": 5,
//       "english": "We read newspapers.",
//       "russian": "Мы читаем газеты."
//     }
//   ]
// };

// const lessonsData = {
//   1: lesson1DataObj
//   // Можно добавить больше уроков при необходимости
// };

// export const lessonService = {
//   // Получить все уроки
//   async getAllLessons() {
//     const { data, error } = await supabase
//       .from('lessons')
//       .select('*')
//       .order('order_index', { ascending: true });
    
//     if (error) throw error;
//     return data;
//   },
  
//   // Получить один урок по ID
//   async getLessonById(lessonId) {
//     const { data, error } = await supabase
//       .from('lessons')
//       .select('*')
//       .eq('id', lessonId)
//       .single();
    
//     if (error) throw error;
//     return data;
//   },
  
//   // Получить первый бесплатный урок
//   async getFirstFreeLesson() {
//     const { data, error } = await supabase
//       .from('lessons')
//       .select('*')
//       .eq('is_locked_by_default', false)
//       .order('order_index', { ascending: true })
//       .limit(1)
//       .single();
    
//     if (error) throw error;
//     return data;
//   },
  
//   // Метод для загрузки урока из соответствующего JSON файла
//   async getLessonData(lessonId) {
//     try {
//       // Преобразуем в число для надежности
//       const numericLessonId = Number(lessonId);
//       console.log(`Trying to load lesson data for lesson ID: ${numericLessonId}`);
      
//       let lessonData;
      
//       // Выбираем нужный файл в зависимости от ID урока
//       switch (numericLessonId) {
//         case 1:
//           lessonData = lesson1Data;
//           console.log('Using lesson1Data');
//           break;
//         case 2:
//           // Если есть файл для второго урока, импортируйте его выше
//           // lessonData = lesson2Data;
//           console.log('No data for lesson 2');
//           throw new Error('Lesson 2 data not available');
//           break;
//         case 3:
//           // И так далее для других уроков
//           // lessonData = lesson3Data; 
//           console.log('No data for lesson 3');
//           throw new Error('Lesson 3 data not available');
//           break;
//         default:
//           console.log(`No lesson data available for lesson ${numericLessonId}`);
//           throw new Error(`No data available for lesson ${numericLessonId}`);
//       }
      
//       if (!lessonData) {
//         throw new Error(`Failed to load data for lesson ${numericLessonId}`);
//       }
      
//       console.log(`Successfully loaded JSON data for lesson ${numericLessonId}:`, {
//         vocabularyLength: lessonData.vocabulary ? 
//           (lessonData.vocabulary.firstList.length + lessonData.vocabulary.secondList.length) : 0,
//         sentencesLength: lessonData.sentences ? lessonData.sentences.length : 0
//       });
      
//       return lessonData;
//     } catch (error) {
//       console.error(`Error loading lesson data for lesson ${lessonId}:`, error);
//       throw error;
//     }
//   },
  
//   async getLessonVocabulary(lessonId) {
//     try {
//       // Загружаем все данные урока из JSON
//       const lessonData = await this.getLessonData(lessonId);
      
//       if (!lessonData || !lessonData.vocabulary) {
//         throw new Error(`No vocabulary found in lesson${lessonId}.json`);
//       }
      
//       const firstList = lessonData.vocabulary.firstList || [];
//       const secondList = lessonData.vocabulary.secondList || [];
      
//       // Добавляем информацию о списке в каждое слово
//       const firstListWithSource = firstList.map(word => ({
//         ...word, 
//         listSource: 'firstList'
//       }));
      
//       const secondListWithSource = secondList.map(word => ({
//         ...word, 
//         listSource: 'secondList'
//       }));
      
//       // Объединяем оба списка слов
//       const allWords = [...firstListWithSource, ...secondListWithSource];
      
//       console.log(`Successfully processed vocabulary for lesson ${lessonId}:`, {
//         firstListLength: firstList.length,
//         secondListLength: secondList.length,
//         allWordsLength: allWords.length
//       });
      
//       return {
//         firstList: firstListWithSource,
//         secondList: secondListWithSource,
//         allWords
//       };
//     } catch (error) {
//       console.error(`Error in getLessonVocabulary for lesson ${lessonId}:`, error);
//       throw error;
//     }
//   },
  
//   async getLessonSentences(lessonId) {
//     try {
//       // Получаем данные урока из JSON
//       const lessonData = await this.getLessonData(lessonId);
      
//       if (!lessonData || !lessonData.sentences) {
//         throw new Error(`No sentences found in lesson${lessonId}.json`);
//       }
      
//       return lessonData.sentences;
//     } catch (error) {
//       console.error(`Error in getLessonSentences for lesson ${lessonId}:`, error);
//       throw error;
//     }
//   }
// }; 