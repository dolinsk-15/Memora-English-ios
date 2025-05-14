// import { supabase } from '../lib/supabase';
// import { getUserDbId } from '../utils/userUtils';

// export const progressService = {
//   // Получить доступные уроки пользователя
//   async getUserLessons(userId) {
//     // Получаем ID из БД вместо Auth
//     const dbUserId = await getUserDbId();
//     if (!dbUserId) throw new Error('Не удалось получить ID пользователя');
    
//     const { data, error } = await supabase
//       .from('user_lessons')
//       .select(`
//         *,
//         lessons:lesson_id (*)
//       `)
//       .eq('user_id', dbUserId)
//       .order('lesson_id', { ascending: true });
    
//     if (error) throw error;
//     return data;
//   },
  
//   // Проверить, разблокирован ли урок для пользователя
//   async isLessonUnlocked(userId, lessonId) {
//     const dbUserId = await getUserDbId();
//     if (!dbUserId) return false;
    
//     const { data, error } = await supabase
//       .from('user_lessons')
//       .select('is_unlocked')
//       .eq('user_id', dbUserId)
//       .eq('lesson_id', lessonId)
//       .single();
    
//     if (error) return false;
//     return data?.is_unlocked || false;
//   },
  
//   // Разблокировать урок для пользователя (после оплаты)
//   async unlockLesson(userId, lessonId) {
//     // Проверяем, существует ли запись
//     const { data: existing } = await supabase
//       .from('user_lessons')
//       .select('id')
//       .eq('user_id', userId)
//       .eq('lesson_id', lessonId)
//       .single();
    
//     if (existing) {
//       // Обновляем существующую запись
//       const { data, error } = await supabase
//         .from('user_lessons')
//         .update({ 
//           is_unlocked: true,
//           progress_date: new Date()
//         })
//         .eq('id', existing.id);
      
//       if (error) throw error;
//       return data;
//     } else {
//       // Создаем новую запись
//       const { data, error } = await supabase
//         .from('user_lessons')
//         .insert([
//           { 
//             user_id: userId, 
//             lesson_id: lessonId, 
//             is_unlocked: true,
//             is_completed: false,
//             progress_date: new Date()
//           }
//         ]);
      
//       if (error) throw error;
//       return data;
//     }
//   },
  
//   // Отметить урок как завершенный
//   async completeLesson(userId, lessonId) {
//     const { data, error } = await supabase
//       .from('user_lessons')
//       .update({ 
//         is_completed: true,
//         progress_date: new Date()
//       })
//       .eq('user_id', userId)
//       .eq('lesson_id', lessonId);
    
//     if (error) throw error;
//     return data;
//   },
  
//   // Обновить прогресс пользователя по конкретному элементу урока
//   async updateItemProgress(userId, itemType, itemId, repeats_done) {
//     // Проверяем, существует ли запись
//     const { data: existing } = await supabase
//       .from('user_progress')
//       .select('id, repeats_done')
//       .eq('user_id', userId)
//       .eq('item_type', itemType)
//       .eq('item_id', itemId)
//       .single();
    
//     // Получаем необходимое количество повторений для завершения
//     let repeats_needed = 0;
//     try {
//       if (itemType === 'word') {
//         const { data } = await supabase
//           .from('lesson_words')
//           .select('repeats_needed')
//           .eq('id', itemId)
//           .single();
//         repeats_needed = data?.repeats_needed || 0;
//       } else if (itemType === 'sentence') {
//         const { data } = await supabase
//           .from('lesson_sentences')
//           .select('repeats_needed')
//           .eq('id', itemId)
//           .single();
//         repeats_needed = data?.repeats_needed || 0;
//       } else if (itemType === 'text') {
//         const { data } = await supabase
//           .from('lesson_texts')
//           .select('repeats_needed')
//           .eq('id', itemId)
//           .single();
//         repeats_needed = data?.repeats_needed || 0;
//       }
//     } catch (error) {
//       console.error('Ошибка при получении repeats_needed:', error);
//     }
    
//     if (existing) {
//       // Обновляем существующую запись
//       const newRepeats = existing.repeats_done + repeats_done;
//       const isCompleted = newRepeats >= repeats_needed;
      
//       const { data, error } = await supabase
//         .from('user_progress')
//         .update({ 
//           repeats_done: newRepeats,
//           is_completed: isCompleted
//         })
//         .eq('id', existing.id);
      
//       if (error) throw error;
//       return data;
//     } else {
//       // Создаем новую запись
//       const isCompleted = repeats_done >= repeats_needed;
      
//       const { data, error } = await supabase
//         .from('user_progress')
//         .insert([
//           { 
//             user_id: userId,
//             item_type: itemType,
//             item_id: itemId,
//             repeats_done: repeats_done,
//             is_completed: isCompleted
//           }
//         ]);
      
//       if (error) throw error;
//       return data;
//     }
//   },
  
//   // Получить прогресс пользователя
//   async getUserProgress(userId) {
//     const { data, error } = await supabase
//       .from('user_progress')
//       .select('*')
//       .eq('user_id', userId);
    
//     if (error) throw error;
//     return data;
//   }
// }; 