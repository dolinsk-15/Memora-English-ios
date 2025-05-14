import { supabase } from '../lib/supabase';

export const paymentService = {
  // Получить историю платежей пользователя
  async getUserPayments(userId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Создать новую запись о платеже
  async createPayment(userId, payment_amount, currency, payment_method, transaction_id) {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        { 
          user_id: userId,
          payment_amount,
          currency,
          payment_date: new Date(),
          payment_status: 'completed',
          transaction_id
        }
      ]);
    
    if (error) throw error;
    return data;
  },
  
  // Обновить статус платежа
  async updatePaymentStatus(paymentId, payment_status) {
    const { data, error } = await supabase
      .from('payments')
      .update({ payment_status })
      .eq('id', paymentId);
    
    if (error) throw error;
    return data;
  },
  
  // Разблокировать все уроки после успешной оплаты
  async unlockAllLessons(userId) {
    // Получаем все уроки
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .order('order_index', { ascending: true });
    
    if (!lessons || lessons.length === 0) return;
    
    // Для каждого урока (кроме первого, который должен быть уже разблокирован)
    const promises = lessons.slice(1).map(async (lesson) => {
      const { data: existing } = await supabase
        .from('user_lessons')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lesson.id)
        .single();
      
      if (existing) {
        // Обновляем существующую запись
        return supabase
          .from('user_lessons')
          .update({ 
            is_unlocked: true, 
            progress_date: new Date() 
          })
          .eq('id', existing.id);
      } else {
        // Создаем новую запись
        return supabase
          .from('user_lessons')
          .insert([
            { 
              user_id: userId, 
              lesson_id: lesson.id, 
              is_unlocked: true, 
              is_completed: false,
              progress_date: new Date()
            }
          ]);
      }
    });
    
    await Promise.all(promises);
  }
}; 