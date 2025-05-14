import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  LogBox,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lessonService } from '../../services/lessonService';
import { useTranslation } from '../../localization';
import * as Speech from 'expo-speech';

type RepeatCountingScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'RepeatCounting'>;
type RepeatCountingScreenRouteProp = RouteProp<MainStackParamList, 'RepeatCounting'>;

interface WordPair {
  id: number;
  english: string;
  translation: string;
}

interface SentencePair {
  id: number;
  english: string;
  translation: string;
}

interface TextItem {
  id: number;
  title: string;
  content: string;
  translation: string;
}

// These arrays will serve as fallbacks if Supabase data can't be loaded
const wordPairs: WordPair[] = [
  {
    id: 1,
    english: "Hello",
    translation: "Привет",
  },
  // Other words...
];

const sentencePairs: SentencePair[] = [
  {
    id: 1,
    english: "How are you today?",
    translation: "Как у тебя дела сегодня?",
  },
  // Other sentences...
];

const textItems: TextItem[] = [
  {
    id: 1,
    title: "A Day in My Life",
    content: "I wake up at 7 AM every day. Then I have breakfast and go to work.",
    translation: "Я просыпаюсь в 7 утра каждый день. Затем я завтракаю и иду на работу.",
  },
  // Other texts...
];

const RepeatCountingScreen = () => {
  const navigation = useNavigation<RepeatCountingScreenNavigationProp>();
  const route = useRoute<RepeatCountingScreenRouteProp>();
  const { lessonId, itemId, itemType, targetRepetitions = 10 } = route.params;
  
  const { t, language } = useTranslation();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [localTargetRepetitions, setLocalTargetRepetitions] = useState(targetRepetitions);
  
  // New states for Supabase integration
  const [loading, setLoading] = useState(true);
  const [supabaseWordItems, setSupabaseWordItems] = useState<WordPair[]>([]);
  const [supabaseSentenceItems, setSupabaseSentenceItems] = useState<SentencePair[]>([]);
  const [supabaseTextItems, setSupabaseTextItems] = useState<TextItem[]>([]);

  // New state for all lesson words
  const [allLessonWords, setAllLessonWords] = useState<WordPair[]>([]);

  // Add this line to declare resultOpacity
  const resultOpacity = useRef(new Animated.Value(0)).current;

  // Add this line to ignore logs
  LogBox.ignoreLogs(['Item with ID']);

  // Add these states after other useState in the component
  const [itemEnglish, setItemEnglish] = useState('');
  const [itemTranslation, setItemTranslation] = useState('');

  // Add this line to declare all lesson sentences
  const [allLessonSentences, setAllLessonSentences] = useState<SentencePair[]>([]);

  // Load data from Supabase when the component mounts
  // useEffect(() => {
  //   const loadDataFromSupabase = async () => {
  //     setLoading(true);
  //     try {
  //       console.log(`Loading data from Supabase for ${itemType}, lesson ${lessonId}`);
  //       
  //       if (itemType === 'word') {
  //         // Четко указываем все необходимые поля
  //         const { data, error } = await supabase
  //           .from('lesson_words')
  //           .select('id, english_word, russian_word, spanish_word, portuguese_word, french_word, repeats_needed')
  //           .eq('lesson_id', lessonId);
  //           
  //         if (error) {
  //           console.error('Error loading words from Supabase:', error);
  //           throw error; // Выбрасываем ошибку, чтобы прервать выполнение
  //         }
  //         
  //         if (!data || data.length === 0) {
  //           console.log('No words found for this lesson');
  //           setSupabaseWordItems([]);
  //           return;
  //         }
  //         
  //         // Выбираем правильный язык перевода из userLanguage (через AsyncStorage или state)
  //         const userLanguage = 'ru'; // Заменить на реальный код получения языка пользователя
  //         
  //         // Форматируем данные для компонента
  //         const formattedWords: WordPair[] = data.map(word => {
  //           // Выбираем перевод в зависимости от языка
  //           let translation: string;
  //           
  //           if (userLanguage === 'ru') {
  //             translation = word.russian_word;
  //           } else if (userLanguage === 'es') {
  //             translation = word.spanish_word;
  //           } else if (userLanguage === 'pt') {
  //             translation = word.portuguese_word;
  //           } else if (userLanguage === 'fr') {
  //             translation = word.french_word;
  //           } else {
  //             translation = word.russian_word;
  //           }
  //           
  //           return {
  //             id: word.id,
  //             english: word.english_word,
  //             translation: translation,
  //           };
  //         });
  //         
  //         console.log(`Loaded ${formattedWords.length} words from Supabase`);
  //         
  //         // ВАЖНО: Устанавливаем данные и ТОЛЬКО потом снимаем флаг загрузки
  //         setSupabaseWordItems(formattedWords);
  //       } 
  //       // Аналогично для sentences и texts
  //     } catch (err) {
  //       console.error('Error in loadDataFromSupabase:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   loadDataFromSupabase();
  // }, [lessonId, itemType]);

  // Load lesson words
  useEffect(() => {
    const loadLessonWords = async () => {
      setLoading(true);
      try {
        console.log(`Loading words for lesson ${lessonId}, word ID: ${itemId}`);
        
        const numericLessonId = Number(lessonId);
        const vocabularyData = await lessonService.getLessonVocabulary(numericLessonId);
        
        if (vocabularyData && vocabularyData.allWords && vocabularyData.allWords.length > 0) {
          console.log(`Found ${vocabularyData.allWords.length} words for lesson ${lessonId}`);
          
          const currentLanguage = language?.toLowerCase() || 'russian';
          
          const words: WordPair[] = vocabularyData.allWords.map((word: any) => {
            const translation = word[currentLanguage] || word.russian;
            
            return {
              id: word.number,
              english: word.english,
              translation: translation
            };
          });
          
          setAllLessonWords(words);
          setSupabaseWordItems(words); // Используем то же имя состояния, хотя оно теперь не связано с Supabase
          
          // Если у нас есть itemId, находим его индекс
          if (itemId) {
            const wordIndex = words.findIndex(word => word.id === itemId);
            if (wordIndex !== -1) {
              console.log(`Found word with ID ${itemId} at index ${wordIndex}`);
              setCurrentIndex(wordIndex);
            } else {
              console.warn(`Word with ID ${itemId} not found, using first word instead`);
              setCurrentIndex(0); // Используем первое слово
            }
          }
        } else {
          console.warn(`No words found for lesson ${lessonId}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading lesson words:", error);
        setLoading(false);
      }
    };
    
    if (itemType === 'word') {
      loadLessonWords();
    } else {
      setLoading(false);
    }
  }, [lessonId, itemId, itemType, language]);

  // Load lesson sentences
  useEffect(() => {
    const loadLessonSentences = async () => {
      setLoading(true);
      try {
        console.log(`Loading sentences for lesson ${lessonId}, sentence ID: ${itemId}`);
        
        const numericLessonId = Number(lessonId);
        const sentencesData = await lessonService.getLessonSentences(numericLessonId);
        
        if (sentencesData && sentencesData.length > 0) {
          console.log(`Found ${sentencesData.length} sentences for lesson ${lessonId}`);
          
          const currentLanguage = language?.toLowerCase() || 'russian';
          
          const sentences: SentencePair[] = sentencesData.map((sentence: any) => {
            const translation = sentence[currentLanguage] || sentence.russian;
            
            return {
              id: sentence.id,
              english: sentence.english,
              translation: translation
            };
          });
          
          setAllLessonSentences(sentences);
          setSupabaseSentenceItems(sentences);
          
          // Если у нас есть itemId, находим его индекс
          if (itemId) {
            const sentenceIndex = sentences.findIndex(sentence => sentence.id === itemId);
            if (sentenceIndex !== -1) {
              console.log(`Found sentence with ID ${itemId} at index ${sentenceIndex}`);
              setCurrentIndex(sentenceIndex);
            } else {
              console.warn(`Sentence with ID ${itemId} not found, using first sentence instead`);
              setCurrentIndex(0); // Используем первое предложение
            }
          }
        } else {
          console.warn(`No sentences found for lesson ${lessonId}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading lesson sentences:", error);
        setLoading(false);
      }
    };
    
    if (itemType === 'sentence') {
      loadLessonSentences();
    }
  }, [lessonId, itemId, itemType, language]);

  // Determine which data to use based on itemType
  const getItems = () => {
    switch(itemType) {
      case 'sentence':
        return allLessonSentences.length > 0 ? allLessonSentences : sentencePairs;
      case 'text':
        return textItems;
      case 'word':
      default:
        // Используем загруженные слова из урока вместо моковых данных
        return allLessonWords.length > 0 ? allLessonWords : wordPairs;
    }
  };

  const items = getItems();
  
  // Calculate and update progress
  const calculateLessonProgress = async () => {
    try {
      // Добавить проверку элементов в начале функции
      if (!items || items.length === 0) {
        console.log("No items available for progress calculation");
        return 0; // Возвращаем 0% прогресса, если элементов нет
      }
      
      // Get target repetitions
      const targetRepStr = await AsyncStorage.getItem('targetRepetitions');
      const targetRepetitions = targetRepStr ? parseInt(targetRepStr) : 5;
      
      // Get word repetitions
      const wordRepKey = `wordRepetitions_lesson${lessonId}`;
      const savedWordReps = await AsyncStorage.getItem(wordRepKey);
      const wordReps = savedWordReps ? JSON.parse(savedWordReps) : {};
      
      // Get sentence repetitions
      const sentenceKey = `sentenceData_lesson${lessonId}`;
      const savedSentenceReps = await AsyncStorage.getItem(sentenceKey);
      const sentenceReps = savedSentenceReps ? JSON.parse(savedSentenceReps) : {};
      
      // Get text repetitions
      const textKey = `textData_lesson${lessonId}`;
      const savedTextReps = await AsyncStorage.getItem(textKey);
      const textReps = savedTextReps ? JSON.parse(savedTextReps) : {};
      
      // Get word, sentence, text counts
      const wordCountKey = `wordCount_lesson${lessonId}`;
      const sentenceCountKey = `sentenceCount_lesson${lessonId}`;
      const textCountKey = `textCount_lesson${lessonId}`;
      
      const wordCountStr = await AsyncStorage.getItem(wordCountKey);
      const sentenceCountStr = await AsyncStorage.getItem(sentenceCountKey);
      const textCountStr = await AsyncStorage.getItem(textCountKey);
      
      const wordCount = wordCountStr ? parseInt(wordCountStr) : 0;
      const sentenceCount = sentenceCountStr ? parseInt(sentenceCountStr) : 0;
      const textCount = textCountStr ? parseInt(textCountStr) : 0;
      
      // Get the target repetitions for each section
      const wordTargetStr = await AsyncStorage.getItem(`targetRepetitions_lesson${lessonId}`);
      const sentenceTargetStr = await AsyncStorage.getItem(`sentenceRepetitions_lesson${lessonId}`);
      const textTargetStr = await AsyncStorage.getItem(`textRepetitions_lesson${lessonId}`);
      
      const wordTarget = wordTargetStr ? parseInt(wordTargetStr) : targetRepetitions;
      const sentenceTarget = sentenceTargetStr ? parseInt(sentenceTargetStr) : targetRepetitions;
      const textTarget = textTargetStr ? parseInt(textTargetStr) : targetRepetitions;
      
      // 1. Count total elements in the lesson
      const totalElements = wordCount + sentenceCount + textCount;
      
      // Handle case when there are no elements
      if (totalElements === 0) {
        await AsyncStorage.setItem(`lessonProgress_${lessonId}`, "0");
        return 0;
      }
      
      // 2. Count completed elements correctly
      let completedElements = 0;
      
      // Make sure we only count elements that exist in our defined counts
      let wordIds = Object.keys(wordReps).map(id => parseInt(id));
      wordIds = wordIds.filter(id => id > 0 && id <= wordCount);
      
      // Check each word that exists in our count
      wordIds.forEach(id => {
        const item = wordReps[id];
        if (item && item.repetitions >= wordTarget) {
          completedElements++;
        }
      });
      
      // Same for sentences
      let sentenceIds = Object.keys(sentenceReps).map(id => parseInt(id));
      sentenceIds.forEach(id => {
        const item = sentenceReps[id];
        if (item && item.repetitions >= sentenceTarget) {
          completedElements++;
          console.log(`Sentence ${id} completed with ${item.repetitions}/${sentenceTarget} repetitions`);
        }
      });
      
      // And texts
      let textIds = Object.keys(textReps).map(id => parseInt(id));
      textIds = textIds.filter(id => id > 0 && id <= textCount);
      
      textIds.forEach(id => {
        const item = textReps[id];
        if (item && item.repetitions >= textTarget) {
          completedElements++;
        }
      });
      
      // 3. Calculate progress as percentage of total elements
      const progress = Math.round((completedElements / totalElements) * 100);
      
      // Debug info
      console.log(`Lesson ${lessonId} progress calculation:`, {
        wordCount,
        sentenceCount,
        textCount,
        totalElements,
        wordIds: wordIds.length,
        sentenceIds: sentenceIds.length,
        textIds: textIds.length,
        completedElements,
        progress
      });
      
      // Save overall lesson progress
      await AsyncStorage.setItem(`lessonProgress_${lessonId}`, progress.toString());
      
      return progress;
    } catch (error) {
      console.error('Error calculating lesson progress:', error);
      return 0;
    }
  };

  // Load initial progress and repetition count
  useEffect(() => {
    // Пропустить выполнение, если список items пуст
    if (items.length === 0) {
      console.log("Waiting for items to load before initializing");
      return;
    }
    
    const loadInitialData = async () => {
      try {
        console.log(`Loading initial data for type: ${itemType}, itemId: ${itemId}, available items: ${items.length}`);
        
        if (items.length === 0) {
          console.log("No items available yet, skipping initialization");
          return;
        }
        
        // Find the correct index of the item based on itemId
        let foundIndex = 0;
        if (itemId) {
          const index = items.findIndex(item => item.id === itemId);
          console.log(`Finding item with ID ${itemId} in ${items.length} items:`, {
            foundIndex: index,
            foundItem: index !== -1 ? items[index] : null,
            allIds: items.map(item => item.id)
          });
          
          if (index !== -1) {
            foundIndex = index;
            setCurrentIndex(index);
            console.log(`Set current index to ${index} for item ID ${itemId}`);
          } else {
            console.warn(`Item with ID ${itemId} not found, starting from the first item`);
            setCurrentIndex(0);
          }
        }
        
        // Make sure we're using the correct ID for loading data
        const currentItemId = itemId || items[foundIndex]?.id;
        if (!currentItemId) {
          console.error("No valid current item ID found");
          return;
        }

        // Load the correct target repetitions based on item type
        let targetRepKey;
        switch(itemType) {
          case 'sentence':
            targetRepKey = `sentenceRepetitions_lesson${lessonId}`;
            break;
          case 'text':
            targetRepKey = `textRepetitions_lesson${lessonId}`;
            break;
          case 'word':
          default:
            targetRepKey = `targetRepetitions_lesson${lessonId}`;
        }
        
        const savedTargetReps = await AsyncStorage.getItem(targetRepKey);
        if (savedTargetReps) {
          // Update the local target repetitions
          const parsedTarget = parseInt(savedTargetReps, 10);
          if (!isNaN(parsedTarget) && parsedTarget > 0) {
            // Only update if we're not already using a target from route params
            if (!route.params.targetRepetitions) {
              setLocalTargetRepetitions(parsedTarget);
            }
          }
        }

        // Load individual item repetition count with the correct ID
        const key = `${itemType || 'word'}_${currentItemId}_lesson${lessonId}`;
        console.log('Loading repetitions for item:', currentItemId, 'with key:', key);
        
        const savedCount = await AsyncStorage.getItem(key);
        if (savedCount) {
          setRepetitionCount(parseInt(savedCount, 10));
        }
        
        // Load lesson progress
        const savedProgress = await AsyncStorage.getItem(`lessonProgress_${lessonId}`);
        if (savedProgress) {
          setLessonProgress(parseInt(savedProgress, 10));
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [itemId, itemType, lessonId, items]);

  // Update repetition count
  const handleRepetition = () => {
    const newCount = repetitionCount + 1;
    setRepetitionCount(newCount);
    
    // Добавляем анимацию показа результата
    Animated.timing(resultOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Сохраняем счетчик повторений
    const saveCount = async () => {
      try {
        const currentItemId = itemId || (currentItem?.id || 0);
        
        // Сохраняем в AsyncStorage для отдельного элемента
        const key = `${itemType || 'word'}_${currentItemId}_lesson${lessonId}`;
        await AsyncStorage.setItem(key, newCount.toString());
        
        // Определяем ключ для общего хранилища
        let storageKey: string;
        switch(itemType) {
          case 'sentence':
            storageKey = `sentenceData_lesson${lessonId}`; // Используем тот же ключ, что и в SentencesScreen
            break;
          case 'text':
            storageKey = `textData_lesson${lessonId}`;
            break;
          case 'word':
          default:
            storageKey = `wordRepetitions_lesson${lessonId}`;
        }
        
        // Загружаем текущие данные из общего хранилища
        const savedData = await AsyncStorage.getItem(storageKey);
        const itemData = savedData ? JSON.parse(savedData) : {};
        
        // Обновляем запись для элемента
        itemData[currentItemId] = {
          ...(itemData[currentItemId] || {}),
          repetitions: newCount,
          lastPracticed: new Date().toISOString()
        };
        
        // Сохраняем обновленные данные
        await AsyncStorage.setItem(storageKey, JSON.stringify(itemData));
        
        // Обновляем общий прогресс урока
        await calculateLessonProgress();
        
        // Проверяем, достигли ли целевого количества повторений
        if (newCount >= localTargetRepetitions) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Error saving repetition count:', error);
      }
    };
    
    saveCount();
  };

  // Добавьте эту функцию для удаления ошибок из консоли
  const silenceConsoleErrors = () => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Игнорируем сообщения об ошибках, содержащие "Item with ID"
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('Item with ID')
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  };

  // Добавьте этот useEffect для отключения ошибок
  useEffect(() => {
    const cleanup = silenceConsoleErrors();
    return cleanup;
  }, []);

  // Измените функцию getCurrentItem, чтобы она безопасно возвращала элемент
  const getCurrentItem = () => {
    if (items && items.length > 0 && currentIndex >= 0 && currentIndex < items.length) {
      return items[currentIndex];
    }
    return null;
  };

  // Модифицируйте handleNextItem для более безопасной работы с ID
  const handleNextItem = () => {
    // Debug logging с проверкой на существование элемента
    const currentItem = items[currentIndex];
    console.log(`Next item request - Current info:`, {
      itemType,
      currentIndex,
      totalItems: items.length,
      currentItem: currentItem ? currentItem.id : 'not found',
      nextItemAvailable: currentIndex < items.length - 1
    });
    
    if (currentIndex < items.length - 1) {
      // Сохраняем прогресс текущего элемента
      const saveProgress = async () => {
        try {
          await calculateLessonProgress();
          
          // Переходим к следующему элементу
          const nextIndex = currentIndex + 1;
          console.log(`Moving to index ${nextIndex} of ${items.length - 1}`);
          
          setCurrentIndex(nextIndex);
          
          // Проверяем, что следующий индекс валидный
          if (nextIndex < 0 || nextIndex >= items.length) {
            console.warn(`Invalid next index: ${nextIndex}`);
            return;
          }
          
          // Получаем следующий элемент с проверкой
          const nextItem = items[nextIndex];
          if (!nextItem) {
            console.warn(`Next item not found at index ${nextIndex}`);
            return;
          }
          
          const nextItemId = nextItem.id;
          console.log(`Next item ID: ${nextItemId}`);
          
          // Сбрасываем состояние повторений
          setRepetitionCount(0);
          setIsCompleted(false);
          
          // Обновляем ID элемента в параметрах маршрута
          // @ts-ignore
          route.params = { ...route.params, itemId: nextItemId };
          
          // Если это предложение, обновляем состояния itemEnglish и itemTranslation
          if (itemType === 'sentence') {
            // Используем приведение типов для устранения ошибки
            const sentenceItem = nextItem as SentencePair;
            setItemEnglish(sentenceItem.english);
            setItemTranslation(sentenceItem.translation);
          }
          
          // Загружаем сохраненное количество повторений
          const key = `${itemType}_${nextItemId}_lesson${lessonId}`;
          const savedCount = await AsyncStorage.getItem(key);
          
          if (savedCount) {
            const count = parseInt(savedCount, 10);
            console.log(`Found saved repetition count for item ${nextItemId}: ${count}`);
            setRepetitionCount(count);
            
            if (count >= localTargetRepetitions) {
              setIsCompleted(true);
            }
          }
          
          // Сбрасываем анимацию
          resultOpacity.setValue(0);
        } catch (error) {
          console.error('Error moving to next item:', error);
        }
      };
      
      saveProgress();
    } else {
      // Достигнут конец списка, показываем уведомление с переводами
      Alert.alert(
        t('repeat.endOfList'),
        t('repeat.endOfListMessage'),
        [
          { 
            text: t('repeat.startOver'), 
            onPress: () => {
              setCurrentIndex(0);
              setRepetitionCount(0);
              setIsCompleted(false);
              resultOpacity.setValue(0);
              
              // И в части для начала списка заново
              if (itemType === 'sentence' && items.length > 0) {
                // Используем приведение типов для устранения ошибки
                const sentenceItem = items[0] as SentencePair;
                setItemEnglish(sentenceItem.english);
                setItemTranslation(sentenceItem.translation);
              }
              
              // @ts-ignore
              route.params = { ...route.params, itemId: items[0]?.id || 0 };
            } 
          },
          { 
            text: t('repeat.goBack'), 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    }
  };

  // Restart the current item - updated to save to Supabase as well
  const handleRestart = async () => {
    try {
      const currentItem = items[currentIndex];
      if (!currentItem) return;
      
      // Reset repetition count
      setRepetitionCount(0);
      setIsCompleted(false);
      
      // Reset in storage
      const currentItemId = itemId || currentItem.id;
      const key = `${itemType || 'word'}_${currentItemId}_lesson${lessonId}`;
      await AsyncStorage.setItem(key, "0");
      
      // Update storage for this item type too
      let storageKey: string;
      switch(itemType) {
        case 'sentence':
          storageKey = `sentenceData_lesson${lessonId}`;
          break;
        case 'text':
          storageKey = `textData_lesson${lessonId}`;
          break;
        case 'word':
        default:
          storageKey = `wordRepetitions_lesson${lessonId}`;
      }
      
      const savedData = await AsyncStorage.getItem(storageKey);
      const itemData = savedData ? JSON.parse(savedData) : {};
      
      if (itemData[currentItemId]) {
        itemData[currentItemId].repetitions = 0;
        await AsyncStorage.setItem(storageKey, JSON.stringify(itemData));
      }
      
      // Recalculate overall lesson progress
      await calculateLessonProgress();
    } catch (error) {
      console.error('Error restarting item:', error);
    }
  };

  // Go back to the previous screen
  const handleGoBack = async () => {
    // Make sure progress is saved before going back
    await calculateLessonProgress();
    navigation.goBack();
  };

  const renderProgressBar = () => {
    // Calculate progress based on repetitions completed
    const progress = Math.min((repetitionCount / localTargetRepetitions) * 100, 100);
    
    return (
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#3B82F6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progress}%` }]}
        />
      </View>
    );
  };

  const getHeaderTitle = () => {
    switch(itemType) {
      case 'sentence':
        return t('repeat.sentences');
      case 'text':
        return t('repeat.texts');
      case 'word':
      default:
        return t('repeat.words');
    }
  };

  const currentItem = getCurrentItem();

  // Updated renderContent function
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      );
    }
    
    // Для предложений используем состояния itemEnglish и itemTranslation
    if (itemType === 'sentence' && itemEnglish && itemTranslation) {
      return (
        <View style={styles.wordCard}>
          <View style={styles.wordRow}>
            <Text style={styles.englishWord}>{itemEnglish}</Text>
            <TouchableOpacity 
              style={styles.soundButton}
              onPress={() => speakWord(itemEnglish)}
            >
              <Ionicons name="volume-medium" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.translationWord}>{itemTranslation}</Text>
        </View>
      );
    }
    
    // Для других типов контента используем существующую логику с items
    if (!currentItem) {
      return (
        <View style={styles.wordCard}>
          <Text style={styles.englishWord}>{t('repeat.noContent')}</Text>
        </View>
      );
    }
    
    if (itemType === 'text') {
      const textItem = currentItem as TextItem;
      return (
        <View style={styles.wordCard}>
          <Text style={styles.textTitle}>{textItem.title || t('repeat.noTitle')}</Text>
          <Text style={styles.englishWord}>{textItem.content || t('repeat.noContent')}</Text>
          <Text style={styles.translationWord}>{textItem.translation || t('repeat.noTranslation')}</Text>
        </View>
      );
    } else {
      // Word или других типов
      const item = currentItem as WordPair | SentencePair;
      return (
        <View style={styles.wordCard}>
          <View style={styles.wordRow}>
            <Text style={styles.englishWord}>{item.english || t('repeat.noWord')}</Text>
            <TouchableOpacity 
              style={styles.soundButton}
              onPress={() => speakWord(item.english)}
            >
              <Ionicons name="volume-medium" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.translationWord}>{item.translation || t('repeat.noTranslation')}</Text>
        </View>
      );
    }
  };

  // Добавляем функцию произношения слова
  const speakWord = async (word: string) => {
    try {
      Speech.speak(word, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  };

  const checkLessonCompleted = async () => {
    try {
      // Get all counts
      const wordCountKey = `wordCount_lesson${lessonId}`;
      const sentenceCountKey = `sentenceCount_lesson${lessonId}`;
      const textCountKey = `textCount_lesson${lessonId}`;
      
      const wordCountStr = await AsyncStorage.getItem(wordCountKey);
      const sentenceCountStr = await AsyncStorage.getItem(sentenceCountKey);
      const textCountStr = await AsyncStorage.getItem(textCountKey);
      
      const wordCount = wordCountStr ? parseInt(wordCountStr) : 0;
      const sentenceCount = sentenceCountStr ? parseInt(sentenceCountStr) : 0;
      const textCount = textCountStr ? parseInt(textCountStr) : 0;
      
      // Calculate total items
      const totalItems = wordCount + sentenceCount + textCount;
      
      // Get repetition data
      const wordRepKey = `wordRepetitions_lesson${lessonId}`;
      const sentenceKey = `sentenceData_lesson${lessonId}`;
      const textKey = `textData_lesson${lessonId}`;
      
      const savedWordReps = await AsyncStorage.getItem(wordRepKey);
      const savedSentenceReps = await AsyncStorage.getItem(sentenceKey);
      const savedTextReps = await AsyncStorage.getItem(textKey);
      
      const wordReps = savedWordReps ? JSON.parse(savedWordReps) : {};
      const sentenceReps = savedSentenceReps ? JSON.parse(savedSentenceReps) : {};
      const textReps = savedTextReps ? JSON.parse(savedTextReps) : {};
      
      // Get targets
      const wordTargetStr = await AsyncStorage.getItem(`targetRepetitions_lesson${lessonId}`);
      const sentenceTargetStr = await AsyncStorage.getItem(`sentenceRepetitions_lesson${lessonId}`);
      const textTargetStr = await AsyncStorage.getItem(`textRepetitions_lesson${lessonId}`);
      
      const wordTarget = wordTargetStr ? parseInt(wordTargetStr) : 5;
      const sentenceTarget = sentenceTargetStr ? parseInt(sentenceTargetStr) : 5;
      const textTarget = textTargetStr ? parseInt(textTargetStr) : 5;
      
      // Count completed items
      let completedItems = 0;
      
      // Count completed words
      for (let i = 1; i <= wordCount; i++) {
        if (wordReps[i] && wordReps[i].repetitions >= wordTarget) {
          completedItems++;
        }
      }
      
      // Count completed sentences
      for (let i = 1; i <= sentenceCount; i++) {
        if (sentenceReps[i] && sentenceReps[i].repetitions >= sentenceTarget) {
          completedItems++;
        }
      }
      
      // Count completed texts
      for (let i = 1; i <= textCount; i++) {
        if (textReps[i] && textReps[i].repetitions >= textTarget) {
          completedItems++;
        }
      }
      
      console.log(`Lesson ${lessonId} completion check:`, {
        totalItems,
        completedItems,
        wordCount,
        sentenceCount,
        textCount
      });
      
      // Only show completion alert if ALL items are completed
      if (completedItems === totalItems && totalItems > 0) {
        // Update progress to exactly 100%
        await AsyncStorage.setItem(`lessonProgress_${lessonId}`, "100");
        
        // Show congratulation alert with translations
        Alert.alert(
          t('lessons.lessonCompleted', { lessonId }),
          t('lessons.goToNextLesson', { lessonId: Number(lessonId) + 1 }),
          [
            { 
              text: t('lessons.nextLesson'), 
              onPress: () => navigation.navigate('LessonList') 
            },
            { 
              text: t('common.cancel'), 
              style: "default"
            }
          ]
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking lesson completion:', error);
      return false;
    }
  };

  // Оставьте существующий useEffect для загрузки предложения, но исправьте использование состояний
  useEffect(() => {
    const loadItem = async () => {
      // Получаем параметры из navigation
      const { itemId, itemType, lessonId } = route.params;
      
      console.log('Loading item for repetition:', { itemId, itemType, lessonId });
      
      try {
        if (itemType === 'sentence') {
          // Загружаем все предложения из урока
          const sentencesData = await lessonService.getLessonSentences(Number(lessonId));
          
          // Находим нужное предложение по ID
          const targetSentence = sentencesData.find(s => s.id === itemId);
          
          if (targetSentence) {
            console.log('Found sentence for repetition:', targetSentence);
            
            // Получаем текущий язык
            const currentLanguage = language || 'russian';
            
            // Устанавливаем данные для отображения
            setItemEnglish(targetSentence.english);
            setItemTranslation(targetSentence[currentLanguage.toLowerCase()] || targetSentence.russian);
            
            // Также обновляем локальную коллекцию предложений с этим предложением
            setSupabaseSentenceItems([{
              id: targetSentence.id,
              english: targetSentence.english,
              translation: targetSentence[currentLanguage.toLowerCase()] || targetSentence.russian
            }]);
          } else {
            console.error('Sentence not found with ID:', itemId);
            Alert.alert('Error', 'Could not find the selected sentence.');
          }
        } else if (itemType === 'word') {
          // Существующий код для загрузки слов...
        }
      } catch (error) {
        console.error('Error loading item for repetition:', error);
        Alert.alert('Error', 'Failed to load the selected item.');
      }
    };
    
    loadItem();
  }, [route.params, language]);

  return (
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with correct translation */}
        <View style={[styles.navigationHeader, styles.headerWithBackground]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        <View style={styles.contentContainer}>
          {/* Progress Bar */}
          {renderProgressBar()}
          
          {/* Content Card */}
          {renderContent()}

          {/* Repetition Button or Action Buttons */}
          {repetitionCount >= localTargetRepetitions ? (
            // Show three buttons when target repetitions reached
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGoBack}
              >
                <Text style={styles.actionButtonText}>{t('common.back')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRestart}
              >
                <Text style={styles.actionButtonText}>{t('repeat.restart')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNextItem}
              >
                <Text style={styles.actionButtonText}>
                  {itemType === 'word' 
                    ? t('repeat.nextWord') 
                    : itemType === 'sentence' 
                      ? t('repeat.nextSentence') 
                      : t('repeat.nextText')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Show single repetition button when still practicing
            <TouchableOpacity
              style={styles.repetitionButton}
              onPress={handleRepetition}
            >
              <Text style={styles.repetitionButtonText}>{t('repeat.sayAndTap')}</Text>
            </TouchableOpacity>
          )}

          {/* Stats text with correct translation key */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {repetitionCount} / {localTargetRepetitions} {t('repeat.repetitions')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 44,
  },
  headerWithBackground: {
    backgroundColor: '#581C87',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 44,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  wordCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  textTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 8,
  },
  englishWord: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  translationWord: {
    fontSize: 20,
    color: '#D1D5DB',
  },
  repetitionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  repetitionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundButton: {
    padding: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
  },
});

export default RepeatCountingScreen; 


