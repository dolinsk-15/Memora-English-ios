// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Animated,
//   Platform,
//   ScrollView,
//   Modal,
//   TextInput,
//   Alert,
//   NativeSyntheticEvent,
//   NativeScrollEvent
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { getUserDbId } from '../../utils/userUtils';
// import { useTranslation } from '../../localization';
// import RepetitionCountModal from '../../components/RepetitionCountModal';

// type Props = NativeStackScreenProps<LessonsStackParamList, 'Texts'>;

// interface TextItem {
//   id: number;
//   title: string;
//   description: string;
//   english_text: string;
//   translated_text: string;
//   progress: number;
//   repetitions: number;
// }

// const initialTextsData: TextItem[] = [
//   {
//     id: 1,
//     title: "A Day in My Life",
//     description: "A simple story about daily routines and activities.",
//     english_text: "A Day in My Life",
//     translated_text: "A Day in My Life",
//     progress: 75,
//     repetitions: 0,
//   },
//   {
//     id: 2,
//     title: "My Family",
//     description: "Learn about family members and relationships.",
//     english_text: "My Family",
//     translated_text: "My Family",
//     progress: 30,
//     repetitions: 0,
//   },
//   {
//     id: 3,
//     title: "At the Restaurant",
//     description: "Common phrases and vocabulary for dining out.",
//     english_text: "At the Restaurant",
//     translated_text: "At the Restaurant",
//     progress: 25,
//     repetitions: 0,
//   },
//   {
//     id: 4,
//     title: "Travel Adventures",
//     description: "Stories about traveling and exploring new places.",
//     english_text: "Travel Adventures",
//     translated_text: "Travel Adventures",
//     progress: 15,
//     repetitions: 0,
//   },
//   {
//     id: 5,
//     title: "My Hobbies",
//     description: "Discussing interests and free-time activities.",
//     english_text: "My Hobbies",
//     translated_text: "My Hobbies",
//     progress: 20,
//     repetitions: 0,
//   },
// ];

// const TextsScreen: React.FC<Props> = ({ navigation, route }) => {
//   const { lessonId } = route.params;
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const [textsData, setTextsData] = useState<TextItem[]>([]);
//   const [targetRepetitions, setTargetRepetitions] = useState<number>(10);
//   const [showRepetitionModal, setShowRepetitionModal] = useState<boolean>(false);
//   const [customRepetitions, setCustomRepetitions] = useState<string>('');
//   const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userLanguage, setUserLanguage] = useState<string>('russian');
//   const { t } = useTranslation();

//   const getUserLanguage = async () => {
//     try {
//       const userDbId = await getUserDbId();
      
//       if (!userDbId) {
//         console.error('User ID not found');
//         return 'russian';
//       }
      
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('default_language')
//         .eq('id', userDbId)
//         .single();
      
//       if (error || !data) {
//         console.error('Error fetching user profile:', error);
//         return 'russian';
//       }
      
//       return data.default_language || 'russian';
//     } catch (err) {
//       console.error('Failed to get user language:', err);
//       return 'russian';
//     }
//   };

//   const fetchTextsFromSupabase = async (language: string) => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const { data, error } = await supabase
//         .from('lesson_texts')
//         .select('*')
//         .eq('lesson_id', lessonId);
      
//       if (error) {
//         throw error;
//       }
      
//       if (data && data.length > 0) {
//         const formattedTexts: TextItem[] = data.map(item => {
//           const title = item.english_text.split(' ').slice(0, 5).join(' ') + '...';
          
//           let translatedText = '';
//           switch (language) {
//             case 'russian':
//               translatedText = item.russian_text;
//               break;
//             case 'spanish':
//               translatedText = item.spanish_text;
//               break;
//             case 'portuguese':
//               translatedText = item.portuguese_text;
//               break;
//             case 'french':
//               translatedText = item.french_text;
//               break;
//             default:
//               translatedText = item.russian_text;
//           }
          
//           return {
//             id: item.id,
//             title: title,
//             description: item.english_text.substring(0, 100) + 
//               (item.english_text.length > 100 ? '...' : ''),
//             english_text: item.english_text,
//             translated_text: translatedText,
//             progress: 0,
//             repetitions: 0
//           };
//         });
        
//         console.log(`Loaded ${formattedTexts.length} texts with ${language} translations`);
//         setTextsData(formattedTexts);
        
//         if (formattedTexts.length > 0 && data[0].repeats_needed) {
//           setTargetRepetitions(data[0].repeats_needed);
//         }
//       } else {
//         console.log('No texts found for lesson', lessonId);
//         setTextsData(initialTextsData);
//       }
//     } catch (err) {
//       console.error('Error fetching texts:', err);
//       setError('Failed to load texts. Please try again later.');
//       setTextsData(initialTextsData);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadRepetitionData = async () => {
//     try {
//       const savedTarget = await AsyncStorage.getItem(`textRepetitions_lesson${lessonId}`);
//       if (savedTarget) {
//         setTargetRepetitions(parseInt(savedTarget, 10));
//       }

//       const savedTexts = await AsyncStorage.getItem(`textData_lesson${lessonId}`);
//       if (savedTexts) {
//         console.log('Loaded repetition data:', savedTexts);
//         const parsedTexts = JSON.parse(savedTexts);
//         const target = savedTarget ? parseInt(savedTarget, 10) : targetRepetitions;
        
//         setTextsData(prevTexts => 
//           prevTexts.map(text => {
//             const textData = parsedTexts[text.id];
//             const repetitions = textData?.repetitions || 0;
            
//             const updatedProgress = Math.min((repetitions / target) * 100, 100);
              
//             return {
//               ...text,
//               repetitions: repetitions,
//               progress: updatedProgress
//             };
//           })
//         );
//       }
//     } catch (error) {
//       console.error('Error loading repetition data:', error);
//     }
//   };

//   useEffect(() => {
//     const initializeScreen = async () => {
//       try {
//         const language = await getUserLanguage();
//         setUserLanguage(language);
//         console.log('User language:', language);
        
//         await fetchTextsFromSupabase(language);
        
//         await loadRepetitionData();
        
//         if (textsData.length > 0) {
//           await AsyncStorage.setItem(`textCount_lesson${lessonId}`, textsData.length.toString());
//         }
//       } catch (err) {
//         console.error('Error initializing screen:', err);
//         setError('Failed to initialize. Please try again later.');
//       }
//     };
    
//     initializeScreen();
    
//     const unsubscribe = navigation.addListener('focus', () => {
//       loadRepetitionData();
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, [navigation, lessonId]);

//   const renderProgressBar = (progress: number) => {
//     return (
//       <View style={styles.progressBarContainer}>
//         <LinearGradient
//           colors={['#3B82F6', '#06B6D4']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={[styles.progressBar, { width: `${progress}%` }]}
//         />
//       </View>
//     );
//   };

//   const headerOpacity = scrollY.interpolate({
//     inputRange: [0, 100],
//     outputRange: [0, 1],
//     extrapolate: 'clamp',
//   });

//   const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     scrollY.setValue(offsetY);
//   };

//   const handleTextPress = (textId: number) => {
//     const text = textsData.find(t => t.id === textId);
//     if (text) {
//       navigation.navigate('RepeatCounting', { 
//         lessonId,
//         itemId: textId,
//         itemType: 'text',
//         targetRepetitions,
//         textData: {
//           english: text.english_text,
//           translated: text.translated_text
//         }
//       });
//     }
//   };

//   const saveTargetRepetitions = async (value: number) => {
//     try {
//       if (value <= 0) {
//         Alert.alert('Invalid Input', 'Please enter a positive number');
//         return;
//       }
//       await AsyncStorage.setItem(`textRepetitions_lesson${lessonId}`, value.toString());
//       setTargetRepetitions(value);
//       setShowRepetitionModal(false);
//       setIsCustomSelected(false);
//     } catch (error) {
//       console.error('Error saving target repetitions:', error);
//     }
//   };

//   const handleCustomRepetitions = () => {
//     const value = parseInt(customRepetitions, 10);
//     if (isNaN(value) || value <= 0) {
//       Alert.alert('Invalid Input', 'Please enter a valid positive number');
//       return;
//     }
//     saveTargetRepetitions(value);
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
//         <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        
//         <View style={styles.navigationHeader}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="chevron-back" size={28} color="#fff" />
//           </TouchableOpacity>
//           <View style={styles.headerTitleContainer}>
//             <Text style={styles.headerTitle}>Texts ({textsData.length})</Text>
//           </View>
//           <TouchableOpacity
//             style={styles.settingsButton}
//             onPress={() => setShowRepetitionModal(true)}
//           >
//             <Ionicons name="repeat" size={24} color="#D1D5DB" />
//           </TouchableOpacity>
//         </View>

//         <ScrollView 
//           style={styles.scrollView}
//           showsVerticalScrollIndicator={false}
//           onScroll={handleScroll}
//           scrollEventThrottle={16}
//         >
//           <View style={styles.contentContainer}>
//             <View style={styles.repetitionInfo}>
//               <Text style={styles.repetitionText}>
//                 Target: {targetRepetitions} repetitions per text
//               </Text>
//             </View>
            
//             {isLoading && (
//               <View style={styles.loadingContainer}>
//                 <Text style={styles.loadingText}>Loading texts...</Text>
//               </View>
//             )}
            
//             {error && (
//               <View style={styles.errorContainer}>
//                 <Text style={styles.errorText}>{error}</Text>
//               </View>
//             )}
            
//             {!isLoading && !error && (
//               <View style={styles.textsList}>
//                 {textsData.length > 0 ? (
//                   textsData.map((text) => (
//                     <TouchableOpacity
//                       key={text.id}
//                       style={styles.textCard}
//                       onPress={() => handleTextPress(text.id)}
//                     >
//                       <View style={styles.textContent}>
//                         <View style={styles.leftSection}>
//                           <Text style={styles.textTitle}>
//                             {text.title}
//                           </Text>
//                           <Text style={styles.textDescription}>
//                             {text.description}
//                           </Text>
//                         </View>
//                         <View style={styles.rightSection}>
//                           <View style={styles.progressSection}>
//                             {renderProgressBar(text.progress)}
//                             <Text style={styles.progressText}>
//                               {text.repetitions}/{targetRepetitions}
//                             </Text>
//                           </View>
//                           <Ionicons 
//                             name="chevron-forward" 
//                             size={20} 
//                             color="#D1D5DB" 
//                             style={styles.arrowIcon}
//                           />
//                         </View>
//                       </View>
//                     </TouchableOpacity>
//                   ))
//                 ) : (
//                   <Text style={styles.noDataText}>No texts available for this lesson</Text>
//                 )}
//               </View>
//             )}
//           </View>
//         </ScrollView>
//         <RepetitionCountModal
//           visible={showRepetitionModal}
//           onClose={() => setShowRepetitionModal(false)}
//           onSelectCount={saveTargetRepetitions}
//           targetRepetitions={targetRepetitions}
//           itemType="text"
//         />
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
//   headerBackground: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: Platform.OS === 'ios' ? 100 : 80,
//     backgroundColor: '#581C87',
//     zIndex: 1,
//   },
//   navigationHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 8,
//     height: 44,
//     zIndex: 2,
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
//   settingsButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 20,
//     paddingTop: 20,
//   },
//   repetitionInfo: {
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   repetitionText: {
//     color: '#D1D5DB',
//     fontSize: 14,
//   },
//   textsList: {
//     gap: 16,
//   },
//   textCard: {
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 12,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   textContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   leftSection: {
//     flex: 1,
//     gap: 4,
//     paddingRight: 16,
//   },
//   rightSection: {
//     alignItems: 'flex-end',
//     gap: 8,
//   },
//   textTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: 'white',
//   },
//   textDescription: {
//     fontSize: 14,
//     color: '#D1D5DB',
//   },
//   progressSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   progressBarContainer: {
//     width: 80,
//     height: 4,
//     backgroundColor: '#374151',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     borderRadius: 2,
//   },
//   progressText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     minWidth: 45,
//     textAlign: 'right',
//   },
//   arrowIcon: {
//     marginTop: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#1F2937',
//     borderRadius: 20,
//     padding: 24,
//     width: '80%',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#3B82F6',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: 'white',
//     marginBottom: 8,
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: '#D1D5DB',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   repetitionOptions: {
//     flexDirection: 'column',
//     gap: 12,
//     width: '100%',
//     marginBottom: 24,
//   },
//   repetitionOption: {
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(59, 130, 246, 0.2)',
//   },
//   selectedRepetitionOption: {
//     backgroundColor: 'rgba(59, 130, 246, 0.3)',
//     borderColor: '#3B82F6',
//   },
//   repetitionOptionText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   selectedRepetitionOptionText: {
//     fontWeight: '700',
//   },
//   closeButton: {
//     backgroundColor: 'rgba(220, 38, 38, 0.1)',
//     padding: 12,
//     borderRadius: 12,
//     width: '100%',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(220, 38, 38, 0.2)',
//   },
//   closeButtonText: {
//     color: '#EF4444',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   customRepetitionContainer: {
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(59, 130, 246, 0.2)',
//     width: '100%',
//   },
//   customRepetitionButton: {
//     alignItems: 'center',
//   },
//   customInputContainer: {
//     marginTop: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 8,
//   },
//   customInput: {
//     backgroundColor: 'rgba(31, 41, 55, 0.5)',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     color: 'white',
//     flex: 1,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(59, 130, 246, 0.3)',
//   },
//   customInputButton: {
//     backgroundColor: 'rgba(59, 130, 246, 0.3)',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: '#3B82F6',
//   },
//   customInputButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   loadingContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: '#D1D5DB',
//     fontSize: 16,
//   },
//   errorContainer: {
//     padding: 20,
//     alignItems: 'center',
//     backgroundColor: 'rgba(220, 38, 38, 0.1)',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(220, 38, 38, 0.3)',
//   },
//   errorText: {
//     color: '#EF4444',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   noDataText: {
//     color: '#D1D5DB',
//     fontSize: 16,
//     textAlign: 'center',
//     padding: 20,
//   },
//   languageInfo: {
//     color: '#D1D5DB',
//     fontSize: 14,
//     marginTop: 4,
//   },
// });

// export default TextsScreen; 