// import React, { useState, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Animated,
//   Dimensions,
//   Pressable,
//   StatusBar,
//   SafeAreaView,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { AuthContext } from '../../navigation/RootNavigator';
// import { signUp } from '../../lib/supabase';

// type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList & AuthStackParamList>;

// const { width } = Dimensions.get('window');

// const RegisterScreen = () => {
//   const navigation = useNavigation<RegisterScreenNavigationProp>();
//   const { signIn } = useContext(AuthContext);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
  
//   const [nameFocused, setNameFocused] = useState(false);
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [passwordFocused, setPasswordFocused] = useState(false);
//   const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
//   const [isNamePressed, setIsNamePressed] = useState(false);
//   const [isEmailPressed, setIsEmailPressed] = useState(false);
//   const [isPasswordPressed, setIsPasswordPressed] = useState(false);
//   const [isConfirmPasswordPressed, setIsConfirmPasswordPressed] = useState(false);
//   const [isRegisterPressed, setIsRegisterPressed] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handleRegisterPress = async () => {
//     setIsRegisterPressed(true);
    
//     // Валидация формы
//     if (!name || !email || !password || !confirmPassword) {
//       Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
//       setIsRegisterPressed(false);
//       return;
//     }
    
//     if (password !== confirmPassword) {
//       Alert.alert('Ошибка', 'Пароли не совпадают');
//       setIsRegisterPressed(false);
//       return;
//     }
    
//     // Запускаем анимацию нажатия
//     Animated.sequence([
//       Animated.timing(scaleAnim, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start(async () => {
//       setIsRegisterPressed(false);
      
//       try {
//         setIsLoading(true);
//         console.log('Регистрация пользователя:', email);
        
//         // Используем функцию signUp вместо прямого вызова supabase.auth.signUp
//         const { data, error } = await signUp(email, password, name);
        
//         if (error) {
//           console.error('Ошибка регистрации:', error.message);
//           Alert.alert('Ошибка регистрации', error.message);
//           return;
//         }
        
//         console.log('Успешная регистрация в Auth:', data?.user?.id);
        
//         // Успешная регистрация
//         Alert.alert(
//           'Регистрация успешна',
//           'Ваш аккаунт успешно создан.',
//           [{ text: 'OK', onPress: () => navigation.navigate('LanguageSelection') }]
//         );
//       } catch (e) {
//         console.error('Исключение при регистрации:', e instanceof Error ? e.message : 'Неизвестная ошибка');
//         Alert.alert('Ошибка', e instanceof Error ? e.message : 'Произошла неизвестная ошибка');
//       } finally {
//         setIsLoading(false);
//       }
//     });
//   };

//   return (
//     <LinearGradient
//       colors={['#581C87', '#111827', '#1F2937']}
//       style={styles.container}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <StatusBar barStyle="light-content" />
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={styles.keyboardAvoid}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.content}>
//               <TouchableOpacity 
//                 style={styles.backButton}
//                 onPress={() => navigation.goBack()}
//               >
//                 <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
//               </TouchableOpacity>

//               <Text style={styles.title}>Create Account</Text>
//               <Text style={styles.subtitle}>Start your language learning journey</Text>

//               <View style={styles.form}>
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Full Name</Text>
//                   <Pressable
//                     onPressIn={() => setIsNamePressed(true)}
//                     onPressOut={() => setIsNamePressed(false)}
//                     style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
//                   >
//                     <LinearGradient
//                       colors={nameFocused ? ['#3B82F6', '#06B6D4'] : ['#2A2E37', '#1E2A3B']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[
//                         styles.inputGradient,
//                         nameFocused && styles.inputFocused,
//                         isNamePressed && styles.inputPressed,
//                       ]}
//                     >
//                       <TextInput
//                         style={styles.input}
//                         value={name}
//                         onChangeText={setName}
//                         placeholder="Enter your full name"
//                         placeholderTextColor="#9CA3AF"
//                         autoCapitalize="words"
//                         onFocus={() => setNameFocused(true)}
//                         onBlur={() => setNameFocused(false)}
//                         selectionColor="#3B82F6"
//                         cursorColor="#3B82F6"
//                       />
//                       <Ionicons name="person-outline" size={20} color="#D1D5DB" style={styles.inputIcon} />
//                     </LinearGradient>
//                   </Pressable>
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Email</Text>
//                   <Pressable
//                     onPressIn={() => setIsEmailPressed(true)}
//                     onPressOut={() => setIsEmailPressed(false)}
//                     style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
//                   >
//                     <LinearGradient
//                       colors={emailFocused ? ['#3B82F6', '#06B6D4'] : ['#2A2E37', '#1E2A3B']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[
//                         styles.inputGradient,
//                         emailFocused && styles.inputFocused,
//                         isEmailPressed && styles.inputPressed,
//                       ]}
//                     >
//                       <TextInput
//                         style={styles.input}
//                         value={email}
//                         onChangeText={setEmail}
//                         placeholder="Enter your email"
//                         placeholderTextColor="#9CA3AF"
//                         keyboardType="email-address"
//                         autoCapitalize="none"
//                         autoCorrect={false}
//                         onFocus={() => setEmailFocused(true)}
//                         onBlur={() => setEmailFocused(false)}
//                         selectionColor="#3B82F6"
//                         cursorColor="#3B82F6"
//                       />
//                       <Ionicons name="mail-outline" size={20} color="#D1D5DB" style={styles.inputIcon} />
//                     </LinearGradient>
//                   </Pressable>
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Password</Text>
//                   <Pressable
//                     onPressIn={() => setIsPasswordPressed(true)}
//                     onPressOut={() => setIsPasswordPressed(false)}
//                     style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
//                   >
//                     <LinearGradient
//                       colors={passwordFocused ? ['#3B82F6', '#06B6D4'] : ['#2A2E37', '#1E2A3B']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[
//                         styles.inputGradient,
//                         passwordFocused && styles.inputFocused,
//                         isPasswordPressed && styles.inputPressed,
//                       ]}
//                     >
//                       <TextInput
//                         style={styles.input}
//                         value={password}
//                         onChangeText={setPassword}
//                         placeholder="Create a password"
//                         placeholderTextColor="#9CA3AF"
//                         secureTextEntry
//                         onFocus={() => setPasswordFocused(true)}
//                         onBlur={() => setPasswordFocused(false)}
//                         selectionColor="#3B82F6"
//                         cursorColor="#3B82F6"
//                       />
//                       <Ionicons name="lock-closed-outline" size={20} color="#D1D5DB" style={styles.inputIcon} />
//                     </LinearGradient>
//                   </Pressable>
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Text style={styles.label}>Confirm Password</Text>
//                   <Pressable
//                     onPressIn={() => setIsConfirmPasswordPressed(true)}
//                     onPressOut={() => setIsConfirmPasswordPressed(false)}
//                     style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
//                   >
//                     <LinearGradient
//                       colors={confirmPasswordFocused ? ['#3B82F6', '#06B6D4'] : ['#2A2E37', '#1E2A3B']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[
//                         styles.inputGradient,
//                         confirmPasswordFocused && styles.inputFocused,
//                         isConfirmPasswordPressed && styles.inputPressed,
//                       ]}
//                     >
//                       <TextInput
//                         style={styles.input}
//                         value={confirmPassword}
//                         onChangeText={setConfirmPassword}
//                         placeholder="Confirm your password"
//                         placeholderTextColor="#9CA3AF"
//                         secureTextEntry
//                         onFocus={() => setConfirmPasswordFocused(true)}
//                         onBlur={() => setConfirmPasswordFocused(false)}
//                         selectionColor="#3B82F6"
//                         cursorColor="#3B82F6"
//                       />
//                       <Ionicons name="shield-checkmark-outline" size={20} color="#D1D5DB" style={styles.inputIcon} />
//                     </LinearGradient>
//                   </Pressable>
//                 </View>

//                 <Pressable
//                   onPressIn={() => handleRegisterPress()}
//                   onPressOut={() => setIsRegisterPressed(false)}
//                   disabled={isLoading}
//                 >
//                   <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                     <LinearGradient
//                       colors={['#3B82F6', '#06B6D4']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[styles.registerButton, isRegisterPressed && styles.registerButtonPressed]}
//                     >
//                       {isLoading ? (
//                         <ActivityIndicator color="#FFFFFF" size="small" />
//                       ) : (
//                         <Text style={styles.registerButtonText}>Create Account</Text>
//                       )}
//                     </LinearGradient>
//                   </Animated.View>
//                 </Pressable>

//                 <View style={styles.loginContainer}>
//                   <Text style={styles.loginText}>Already have an account? </Text>
//                   <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//                     <Text style={styles.loginLink}>Sign In</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   keyboardAvoid: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingBottom: 30,
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   backButton: {
//     alignSelf: 'flex-start',
//     marginBottom: 20,
//     padding: 5,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#FFFFFF',
//   },
//   subtitle: {
//     fontSize: 18,
//     color: '#D1D5DB',
//     marginBottom: 40,
//     textAlign: 'center',
//   },
//   form: {
//     width: '100%',
//     maxWidth: 350,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#F3F4F6',
//     fontWeight: '500',
//   },
//   inputGradient: {
//     borderRadius: 12,
//     height: 56,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: '#FFFFFF',
//     paddingVertical: 12,
//   },
//   inputIcon: {
//     marginLeft: 10,
//   },
//   inputFocused: {
//     borderWidth: 2,
//     borderColor: '#3B82F6',
//   },
//   inputPressed: {
//     opacity: 0.8,
//   },
//   registerButton: {
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 20,
//     marginTop: 10,
//     shadowColor: '#3B82F6',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   registerButtonPressed: {
//     opacity: 0.9,
//   },
//   registerButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   loginContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   loginText: {
//     fontSize: 16,
//     color: '#D1D5DB',
//   },
//   loginLink: {
//     fontSize: 16,
//     color: '#60A5FA',
//     fontWeight: '600',
//   },
// });

// export default RegisterScreen; 


