// import { supabase } from '../lib/supabase';

// export const contentService = {
//   // Получить слова урока с учетом языка пользователя
//   async getLessonWords(lessonId, language = 'ru') {
//     const { data, error } = await supabase
//       .from('lesson_words')
//       .select('*')
//       .eq('lesson_id', lessonId);
    
//     if (error) throw error;
    
//     // Преобразование данных в зависимости от выбранного языка
//     return data.map(word => {
//       const targetField = `${language}_word`;
//       const englishField = 'english_word'; // Исходный язык обучения
      
//       return {
//         id: word.id,
//         lesson_id: word.lesson_id,
//         text: word[englishField],
//         translation: word[targetField] || word.russian_word, // Используем русский по умолчанию если нет перевода
//         repeats_needed: word.repeats_needed
//       };
//     });
//   },
  
//   // Получить предложения урока с учетом языка пользователя
//   async getLessonSentences(lessonId, language = 'ru') {
//     const { data, error } = await supabase
//       .from('lesson_sentences')
//       .select('*')
//       .eq('lesson_id', lessonId);
    
//     if (error) throw error;
    
//     // Преобразование данных в зависимости от выбранного языка
//     return data.map(sentence => {
//       const targetField = `${language}_sentence`;
//       const englishField = 'english_sentence'; // Исходный язык обучения
      
//       return {
//         id: sentence.id,
//         lesson_id: sentence.lesson_id,
//         text: sentence[englishField],
//         translation: sentence[targetField] || sentence.russian_sentence,
//         repeats_needed: sentence.repeats_needed
//       };
//     });
//   },
  
//   // Получить тексты урока с учетом языка пользователя
//   async getLessonTexts(lessonId, language = 'ru') {
//     const { data, error } = await supabase
//       .from('lesson_texts')
//       .select('*')
//       .eq('lesson_id', lessonId);
    
//     if (error) throw error;
    
//     // Преобразование данных в зависимости от выбранного языка
//     return data.map(text => {
//       const targetField = `${language}_text`;
//       const englishField = 'english_text'; // Исходный язык обучения
      
//       return {
//         id: text.id,
//         lesson_id: text.lesson_id,
//         text: text[englishField],
//         translation: text[targetField] || text.russian_text,
//         repeats_needed: text.repeats_needed
//       };
//     });
//   },
  
//   // Получить все содержимое урока (слова, предложения и тексты)
//   async getFullLessonContent(lessonId, language = 'ru') {
//     const words = await this.getLessonWords(lessonId, language);
//     const sentences = await this.getLessonSentences(lessonId, language);
//     const texts = await this.getLessonTexts(lessonId, language);
    
//     return {
//       words,
//       sentences,
//       texts
//     };
//   }
// }; 