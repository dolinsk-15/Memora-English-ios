// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
//   Platform,
//   Button
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { MainStackParamList } from '../../navigation/types';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import Superwall from '@superwall/react-native-superwall';
// import { useTranslation } from '../../localization';

// type PaywallScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Paywall'>;

// const PaywallScreen = () => {
//   const navigation = useNavigation<PaywallScreenNavigationProp>();
//   const { t } = useTranslation();
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const apiKey = Platform.OS === "ios" ? "MY_IOS_API_KEY" : "MY_ANDROID_API_KEY";
//     Superwall.configure({
//       apiKey: apiKey,
//     });
//   }, []);

//   const handlePurchase = async () => {
//     try {
//       setIsLoading(true);
//       const result = await Superwall.presentPaywall("your-paywall-id");
      
//       if (result?.event === "purchase") {
//         const okText = t('common.ok') === 'common.ok' ? 'OK' : t('common.ok');
        
//         Alert.alert(
//           t('common.success'),
//           t('paywall.purchaseSuccess'),
//           [{ text: okText, onPress: () => navigation.navigate('LessonList') }]
//         );
//       }
//     } catch (error) {
//       console.error('Ошибка покупки:', error);
//       Alert.alert(t('common.error'), t('paywall.purchaseError'));
//     } finally {
//       setIsLoading(false);
//     }
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
//         <View style={styles.navigationHeader}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="chevron-back" size={28} color="#fff" />
//           </TouchableOpacity>
//           <View style={styles.headerTitleContainer}>
//             <Text style={styles.headerTitle}>{t('paywall.unlockTitle')}</Text>
//           </View>
//           <View style={styles.placeholderButton} />
//         </View>

//         <ScrollView style={styles.content}>
//           <View style={styles.paymentCard}>
//             <Text style={styles.title}>{t('paywall.unlockTitle')}</Text>
//             <Text style={styles.description}>
//               {t('paywall.unlockDescription')}
//             </Text>

//             <View style={styles.featuresList}>
//               <View style={styles.featureItem}>
//                 <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
//                 <Text style={styles.featureText}>17 {t('lessons.lessonTitle')}</Text>
//               </View>
//               <View style={styles.featureItem}>
//                 <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
//                 <Text style={styles.featureText}>
//                   {t('paywall.feature1') === 'paywall.feature1' 
//                     ? 'Vollständiger Zugriff auf alle Lektionen' 
//                     : t('paywall.feature1')}
//                 </Text>
//               </View>
//               <View style={styles.featureItem}>
//                 <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
//                 <Text style={styles.featureText}>
//                   {t('paywall.feature2') === 'paywall.feature2' 
//                     ? 'Unbegrenzte Wortschatzübungen' 
//                     : t('paywall.feature2')}
//                 </Text>
//               </View>
//               <View style={styles.featureItem}>
//                 <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
//                 <Text style={styles.featureText}>
//                   {t('paywall.feature3') === 'paywall.feature3' 
//                     ? 'Fortgeschrittene Grammatikübungen' 
//                     : t('paywall.feature3')}
//                 </Text>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={styles.purchaseButton}
//               onPress={handlePurchase}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#FFFFFF" size="small" />
//               ) : (
//                 <Text style={styles.buttonText}>{t('paywall.continueButton')}</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
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
//   navigationHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 8,
//     height: 44,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderButton: {
//     width: 44,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: 'white',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   paymentCard: {
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     borderRadius: 20,
//     padding: 24,
//     marginTop: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(59, 130, 246, 0.3)',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   description: {
//     fontSize: 16,
//     color: '#D1D5DB',
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 24,
//   },
//   featuresList: {
//     width: '100%',
//     marginBottom: 24,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   featureText: {
//     marginLeft: 12,
//     fontSize: 16,
//     color: 'white',
//   },
//   purchaseButton: {
//     backgroundColor: '#3B82F6',
//     paddingVertical: 16,
//     borderRadius: 12,
//     width: '100%',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default PaywallScreen; 