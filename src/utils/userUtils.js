import { supabase } from '../lib/supabase';

// Получить ID пользователя из БД (из метаданных Auth)
export async function getUserDbId() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Проверяем, есть ли ID в метаданных
  const dbUserId = user.user_metadata?.db_user_id;
  
  if (dbUserId) {
    return dbUserId;
  }
  
  // Если ID не найден в метаданных, пробуем найти в таблице users по email
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.email)
    .single();
  
  if (error || !data) return null;
  
  // Сохраняем найденный ID в метаданных для будущих запросов
  await supabase.auth.updateUser({
    data: { db_user_id: data.id }
  });
  
  return data.id;
} 