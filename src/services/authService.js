// import { supabase } from '../lib/supabase'

// export const authService = {
//   // Регистрация пользователя
//   async registerUser(email, password, default_language = 'ru') {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { default_language }
//       }
//     })
    
//     if (error) throw error
//     return data
//   },
  
//   // Вход пользователя
//   async loginUser(email, password) {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })
    
//     if (error) throw error
//     return data
//   },
  
//   // Выход пользователя
//   async logoutUser() {
//     const { error } = await supabase.auth.signOut()
//     if (error) throw error
//   },
  
//   // Получить текущую сессию
//   async getSession() {
//     const { data, error } = await supabase.auth.getSession()
//     if (error) throw error
//     return data
//   },
  
//   // Получить текущего пользователя
//   async getCurrentUser() {
//     const { data, error } = await supabase.auth.getUser()
//     if (error) throw error
//     return data?.user
//   },
  
//   // Получить профиль пользователя
//   async getUserProfile(userId) {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('user_id', userId)
//       .single()
    
//     if (error) throw error
//     return data
//   },
  
//   // Обновить язык интерфейса пользователя
//   async updateLanguage(userId, default_language) {
//     const { data, error } = await supabase
//       .from('profiles')
//       .update({ 
//         default_language,
//         updated_at: new Date()
//       })
//       .eq('user_id', userId)
    
//     if (error) throw error
//     return data
//   }
// } 