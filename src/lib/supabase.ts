import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient, User, AuthError, PostgrestError } from '@supabase/supabase-js';
// import { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } from '@env';

// Жесткая привязка URL и ключа для тестирования
const supabaseUrl = "https://ivwjmicgzmmuwthvgzkw.supabase.co"; //"https://rvwazxunadavefvrqppa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2d2ptaWNnem1tdXd0aHZnemt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MjM5MzgsImV4cCI6MjA1ODE5OTkzOH0.BQoo9J9TqHKTtDmCYSlkP0EGtoE70ubmLlSXTOKrpiU"; //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5emxpYWVwcmhiZGlhb2Fxc2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTY0NDYsImV4cCI6MjA1ODE5MjQ0Nn0.Q6cnEYH6wnGGAPvrG6pCqa8zYbndFwSAk1Cn6hiu1DE"; //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d2F6eHVuYWRhdmVmdnJxcHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Mzk4ODUsImV4cCI6MjA1ODExNTg4NX0.qhRyNUkRULNt0TQDGEDGu0shAE11gyEgHjAZtxKNFAE";

// Для отладки
console.log('Конфигурация Supabase:');
console.log('URL:', supabaseUrl);
console.log('Ключ установлен:', !!supabaseAnonKey);

// Специальная настройка для React Native с использованием AsyncStorage
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Типы для ответов функций
interface AuthResponse {
  data?: { user: User | null } | null;
  error?: AuthError | PostgrestError | Error | null;
}

export const signUp = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
  try {
    console.log('Начало регистрации для:', email);
    
    // 1. Регистрация в Auth
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) {
      console.error('Ошибка Auth:', error);
      return { error };
    }
    
    if (data?.user) {
      // 2. Проверяем существование профиля перед созданием
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single();
        
      // Создаем профиль только если он не существует
      if (!existingProfile) {
        console.log('Создание профиля для:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: data.user.id,
            default_language: 'russian'
          }]);
          
        if (profileError) {
          console.error('Ошибка создания профиля:', profileError);
        }
      } else {
        console.log('Профиль уже существует, пропускаем создание');
      }
    }
    
    // Возвращаем успех даже при ошибке создания профиля
    return { data, error: null };
  } catch (err) {
    console.error('Исключение:', err);
    return { error: err instanceof Error ? err : new Error('Неизвестная ошибка') };
  }
}; 