// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Alert,
//   Animated,
//   Dimensions,
//   Pressable,
//   StatusBar,
//   SafeAreaView,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamList } from '../../navigation/types';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { supabase } from '../../lib/supabase';

// type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

// const { width } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
//   const [email, setEmail] = useState('');
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [isEmailPressed, setIsEmailPressed] = useState(false);
//   const [isResetPressed, setIsResetPressed] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handleResetPasswordPress = async () => {
//     if (!email) {
//       Alert.alert('Ошибка', 'Пожалуйста, введите email');
//       return;
//     }
    
//     setIsResetPressed(true);
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
//       try {
//         setIsLoading(true);
        
//         // Для мобильных приложений в Expo Go используем специальный формат
//         // или временно отключаем подтверждение через почту в настройках Supabase
//         const { error } = await supabase.auth.resetPasswordForEmail(email, {
//           redirectTo: 'exp://exp.host/@your-username/your-app-slug/reset-password',
//         });
        
//         if (error) {
//           console.error('Ошибка сброса пароля:', error.message);
//           Alert.alert('Ошибка', error.message);
//         } else {
//           Alert.alert(
//             'Сброс пароля',
//             'Если аккаунт с указанным email существует, вы получите инструкции по сбросу пароля.',
//             [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
//           );
//         }
//       } catch (e) {
//         console.error('Исключение:', e instanceof Error ? e.message : 'Неизвестная ошибка');
//         Alert.alert('Ошибка', e instanceof Error ? e.message : 'Произошла неизвестная ошибка');
//       } finally {
//         setIsResetPressed(false);
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

//               <Text style={styles.title}>Reset Password</Text>
//               <Text style={styles.subtitle}>
//                 Enter your email address and we'll send you instructions to reset your password
//               </Text>

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

//                 <Pressable
//                   onPressIn={() => handleResetPasswordPress()}
//                   onPressOut={() => setIsResetPressed(false)}
//                   disabled={isLoading}
//                 >
//                   <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                     <LinearGradient
//                       colors={['#3B82F6', '#06B6D4']}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={[styles.resetButton, isResetPressed && styles.resetButtonPressed]}
//                     >
//                       {isLoading ? (
//                         <ActivityIndicator color="#FFFFFF" size="small" />
//                       ) : (
//                         <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
//                       )}
//                     </LinearGradient>
//                   </Animated.View>
//                 </Pressable>

//                 <View style={styles.loginContainer}>
//                   <Text style={styles.loginText}>Remember your password? </Text>
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
//     paddingHorizontal: 10,
//   },
//   form: {
//     width: '100%',
//     maxWidth: 350,
//   },
//   inputContainer: {
//     marginBottom: 30,
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
//   resetButton: {
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
//   resetButtonPressed: {
//     opacity: 0.9,
//   },
//   resetButtonText: {
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

// export default ForgotPasswordScreen; 