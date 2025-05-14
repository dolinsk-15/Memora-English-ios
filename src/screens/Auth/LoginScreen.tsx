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
// import { supabase } from '../../lib/supabase';

// type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList & AuthStackParamList>;

// const { width } = Dimensions.get('window');

// const LoginScreen = () => {
//   const navigation = useNavigation<LoginScreenNavigationProp>();
//   const { signIn } = useContext(AuthContext);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [passwordFocused, setPasswordFocused] = useState(false);
//   const [isEmailPressed, setIsEmailPressed] = useState(false);
//   const [isPasswordPressed, setIsPasswordPressed] = useState(false);
//   const [isLoginPressed, setIsLoginPressed] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handleLoginPress = async () => {
//     setIsLoginPressed(true);
    
//     if (!email || !password) {
//       Alert.alert('Ошибка', 'Пожалуйста, введите email и пароль');
//       setIsLoginPressed(false);
//       return;
//     }
    
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
//       setIsLoginPressed(false);
      
//       try {
//         setIsLoading(true);
//         console.log('Попытка входа для:', email);
        
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: email,
//           password: password,
//         });
        
//         if (error) {
//           console.error('Ошибка входа:', error.message);
//           Alert.alert('Ошибка входа', error.message);
//           return;
//         }
        
//         console.log('Успешный вход:', data.user.email);
        
//         // После успешного входа перенаправляем на экран выбора языка
//         // или сразу в главное приложение, если язык уже выбран
//         const { data: userProfile } = await supabase
//           .from('users')
//           .select('default_language')
//           .eq('id', data.user.id)
//           .single();
        
//         if (userProfile && userProfile.default_language) {
//           signIn(); // Переход в главное приложение
//         } else {
//           navigation.navigate('LanguageSelection');
//         }
        
//       } catch (e) {
//         console.error('Исключение при входе:', e instanceof Error ? e.message : 'Неизвестная ошибка');
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
//               <Text style={styles.title}>Welcome Back</Text>
//               <Text style={styles.subtitle}>Sign in to continue learning</Text>

//               <View style={styles.form}>
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
//                         placeholder="Enter your password"
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

//                 <TouchableOpacity
//                   onPress={() => navigation.navigate('ForgotPassword')}
//                   style={styles.forgotPassword}
//                 >
//                   <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//                 </TouchableOpacity>

//                 <Pressable
//                   onPressIn={() => handleLoginPress()}
//                   onPressOut={() => setIsLoginPressed(false)}
//                   disabled={isLoading}
//                 >
//                   <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                     <LinearGradient
//                       colors={['#3B82F6', '#06B6D4']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[styles.loginButton, isLoginPressed && styles.loginButtonPressed]}
//                     >
//                       {isLoading ? (
//                         <ActivityIndicator color="#FFFFFF" size="small" />
//                       ) : (
//                         <Text style={styles.loginButtonText}>Sign In</Text>
//                       )}
//                     </LinearGradient>
//                   </Animated.View>
//                 </Pressable>

//                 <View style={styles.registerContainer}>
//                   <Text style={styles.registerText}>Don't have an account? </Text>
//                   <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//                     <Text style={styles.registerLink}>Sign Up</Text>
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
//     marginTop: 60,
//     alignItems: 'center',
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
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 25,
//     marginTop: 8,
//   },
//   forgotPasswordText: {
//     color: '#60A5FA',
//     fontSize: 16,
//   },
//   loginButton: {
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 25,
//     shadowColor: '#3B82F6',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   loginButtonPressed: {
//     opacity: 0.9,
//   },
//   loginButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   registerText: {
//     fontSize: 16,
//     color: '#D1D5DB',
//   },
//   registerLink: {
//     fontSize: 16,
//     color: '#60A5FA',
//     fontWeight: '600',
//   },
// });

// export default LoginScreen; 