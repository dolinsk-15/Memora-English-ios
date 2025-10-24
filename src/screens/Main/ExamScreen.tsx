import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../localization';
import { lessonService } from '../../services/lessonService';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import streakService from '../../services/streakService';
import { useStreakAnimation } from '../../contexts/StreakAnimationContext';

type Props = NativeStackScreenProps<LessonsStackParamList, 'Exam'>;

interface ExamSentence {
  id: number;
  english: string;
  translation: string;
  words: string[];
  correctOrder: number[];
  alternatives?: {
    correct: string;
    alternatives: string[];
  }[];
  audio?: string;
}

// Создаем список часто используемых слов-дистракторов
const commonDistractors = [
  // Местоимения
  'I', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their',
  // Вспомогательные глаголы и отрицания
  'do', 'does', 'did', 'don\'t', 'doesn\'t', 'didn\'t', 'am', 'is', 'are', 'was', 'were',
  'won\'t', 'will', 'would', 'can', 'can\'t', 'could', 'couldn\'t', 'have', 'has', 'had',
  'haven\'t', 'hasn\'t', 'hadn\'t',
  // Предлоги
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'from',
  // Распространенные глаголы
  'go', 'goes', 'went', 'gone', 'make', 'makes', 'made', 'take', 'takes', 'took', 'taken',
  'help', 'helps', 'helped', 'see', 'sees', 'saw', 'seen', 'say', 'says', 'said',
  'come', 'comes', 'came', 'know', 'knows', 'knew', 'known',
];

// Добавить маппинг языка
const languageMap = { ru: 'russian', es: 'spanish', fr: 'french', de: 'german' };

const ExamScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId } = route.params;
  const { t, language } = useTranslation();
  const { trigger } = useStreakAnimation();
  const mappedLanguage = languageMap[language] || 'english';
  
  // Состояние экзамена
  const [sentences, setSentences] = useState<ExamSentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<{
    index: number;
    word: string;
    isCorrect: boolean;
  }[]>([]);
  const [availableWords, setAvailableWords] = useState<{
    word: string; 
    index: number;
    isCorrect: boolean;
  }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [examProgress, setExamProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  
  // Анимация для показа успешного/неуспешного результата
  const resultOpacity = useRef(new Animated.Value(0)).current;

  // Добавим состояние для отслеживания количества использованных попыток
  const [attemptCount, setAttemptCount] = useState(0);

  // Добавим новое состояние для отслеживания текущей позиции в предложении
  const [currentPosition, setCurrentPosition] = useState(0);

  // Remove audio state and initialization
  const [sound, setSound] = useState<null>(null);

  // Загрузка данных экзамена
  useEffect(() => {
    const loadExamData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные экзамена из JSON
        const examSentences = await lessonService.getLessonExam(lessonId);
        
        // Загружаем сохраненный прогресс, счет и текущий индекс предложения
        const savedScore = await AsyncStorage.getItem(`examScore_lesson${lessonId}`);
        const savedProgress = await AsyncStorage.getItem(`examProgress_lesson${lessonId}`);
        const savedIndex = await AsyncStorage.getItem(`examIndex_lesson${lessonId}`);
        
        if (savedScore) {
          const score = parseInt(savedScore, 10);
          setCurrentScore(score);
        }
        
        if (savedProgress) {
          // Убеждаемся, что прогресс не превышает 100%
          const progress = Math.min(100, parseInt(savedProgress, 10));
          setExamProgress(progress);
          // ВАЖНО: всегда зеркалим прогресс урока с прогрессом экзамена
          await AsyncStorage.setItem(`lessonProgress_${lessonId}`, progress.toString());
          
          if (progress >= 90) {
            setIsCompleted(true);
            
            // Убедимся, что следующий урок разблокирован
            await AsyncStorage.setItem(`next_lesson_${lessonId}_unlocked`, 'true');
            
            // Отмечаем урок как завершенный
            await AsyncStorage.setItem(`lesson_${lessonId}_completed`, 'true');
            
            // Более надежная проверка
            if (String(lessonId) === '1') {
              AsyncStorage.setItem('first_lesson_completed', 'true');
            }
          }
        }
        
        if (examSentences && examSentences.length > 0) {
          console.log(`Loaded ${examSentences.length} sentences from exam data`);
          
          // Преобразуем данные предложений в формат для экзамена
          const formattedSentences: ExamSentence[] = examSentences.map((sentenceData: any) => {
            let translation: string;
            if (sentenceData.translations) {
              translation = sentenceData.translations?.[language] || sentenceData.translations?.ru || sentenceData.english;
            } else {
              translation = sentenceData[mappedLanguage] || sentenceData.english;
            }
            const words = sentenceData.words.map((w: any) => w.correct);
            const correctOrder = words.map((_: any, index: number) => index);
            
            console.log(`Sentence ${sentenceData.id} audio:`, sentenceData.audio);
            
            return {
              id: sentenceData.id,
              english: sentenceData.sentence_en,
              translation: translation,
              words: words,
              correctOrder: correctOrder,
              alternatives: sentenceData.words, // Сохраняем альтернативы для использования
              audio: sentenceData.audio
            };
          });
          
          console.log('Example sentence audio URL:', 
            formattedSentences.length > 0 ? formattedSentences[0].audio : 'No sentences available');
          
          setSentences(formattedSentences);
          
          // Загружаем и устанавливаем сохраненный индекс предложения
          let startIndex = 0;
          if (savedIndex) {
            const index = parseInt(savedIndex, 10);
            // Проверяем, что индекс валидный
            if (index >= 0 && index < formattedSentences.length) {
              startIndex = index;
              setCurrentSentenceIndex(index);
            }
          }
          
          // После загрузки и установки предложений, подготавливаем слова только для первой позиции
          if (formattedSentences.length > 0) {
            const startSentence = formattedSentences[startIndex];
            setCurrentPosition(0); // Начинаем с позиции 0
            const initialWords = prepareWordsFromExamData(startSentence, 0); // Только слова для первой позиции
            setAvailableWords(initialWords);
          }
          
          setAttemptCount(0);
          setLoading(false);
        } else {
          // Если нет данных экзамена, используем старый метод
        const sentencesData = await lessonService.getLessonSentences(lessonId);
        
        if (!sentencesData || sentencesData.length === 0) {
          throw new Error('No sentences found for this lesson');
        }
        
        console.log(`Loaded ${sentencesData.length} sentences for exam`);
        
        // Преобразуем данные предложений в формат для экзамена
        const formattedSentences: ExamSentence[] = sentencesData.map((sentence: any) => {
          let translation: string;
          if (sentence.translations) {
            translation = sentence.translations?.[language] || sentence.translations?.ru || sentence.english;
          } else {
            translation = sentence[mappedLanguage] || sentence.english;
          }
          const words = sentence.english.replace(/[.,!?]/g, '').split(' ');
          
          // Для каждого слова создаем правильный индекс
          const correctOrder = words.map((_: any, index: number) => index);
          
          console.log(`Sentence ${sentence.id} audio:`, sentence.audio);
          
          return {
            id: sentence.id,
            english: sentence.english,
            translation: translation,
            words: words,
            correctOrder: correctOrder,
            audio: sentence.audio
          };
        });
        
        console.log('Example sentence audio URL:', 
          formattedSentences.length > 0 ? formattedSentences[0].audio : 'No sentences available');
        
        setSentences(formattedSentences);
        
        // Загружаем и устанавливаем сохраненный индекс предложения
        let startIndex = 0;
        if (savedIndex) {
          const index = parseInt(savedIndex, 10);
          // Проверяем, что индекс валидный
          if (index >= 0 && index < formattedSentences.length) {
            startIndex = index;
            setCurrentSentenceIndex(index);
          }
        }
        
        // Используем новую функцию для подготовки слов
        const startSentence = formattedSentences[startIndex];
        const wordsWithDistractors = prepareWordsForSentence(startSentence);
        
        setAvailableWords(wordsWithDistractors);
        setAttemptCount(0); // Сбрасываем счетчик попыток при загрузке нового предложения
        setLoading(false);
        }
      } catch (error) {
        console.error('Error loading exam data:', error);
        setLoading(false);
        Alert.alert(
          'Error',
          'Failed to load exam data. Please try again later.'
        );
        navigation.goBack();
      }
    };
    
    loadExamData();
  }, [language, lessonId, navigation]);

  // Функция для перемешивания массива (алгоритм Фишера-Йейтса)
  const shuffleArray = <T extends any>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Измените функцию, которая готовит слова для текущего предложения
  const prepareWordsForSentence = (sentence: ExamSentence): {word: string, index: number, isCorrect: boolean}[] => {
    // Создаем массив правильных слов с их индексами
    const correctWords = sentence.words.map((word, index) => ({ 
      word, 
      index,
      isCorrect: true // Добавляем флаг, что это правильное слово
    }));
    
    // Количество дистракторов, которые нужно добавить (от 2 до 4, в зависимости от длины предложения)
    const distractorsCount = Math.min(4, Math.max(2, Math.floor(sentence.words.length / 2)));
    
    // Отфильтровываем дистракторы, которые уже есть в предложении
    const availableDistractors = commonDistractors.filter(
      distractor => !sentence.words.some(word => word.toLowerCase() === distractor.toLowerCase())
    );
    
    // Случайно выбираем несколько дистракторов
    const selectedDistractors = shuffleArray([...availableDistractors])
      .slice(0, distractorsCount)
      .map((word, i) => ({
        word,
        index: correctWords.length + i, // Даем индексы, которые не пересекаются с правильными словами
        isCorrect: false // Это неправильное слово
      }));
    
    // Объединяем правильные слова и дистракторы, и перемешиваем
    return shuffleArray([...correctWords, ...selectedDistractors]);
  };

  // Модифицируем функцию prepareWordsFromExamData
  const prepareWordsFromExamData = (sentence: ExamSentence, position: number): {word: string, index: number, isCorrect: boolean}[] => {
    const result: {word: string, index: number, isCorrect: boolean}[] = [];
    
    // Проверяем, что у нас есть альтернативы и позиция корректна
    if (sentence.alternatives && position < sentence.alternatives.length) {
      const wordData = sentence.alternatives[position];
      
      // Добавляем правильное слово
      result.push({
        word: wordData.correct,
        index: position,
        isCorrect: true
      });
      
      // Добавляем альтернативы
      // Для урока 18 берем все доступные альтернативы (должно быть 5 для общего кол-ва 6)
      if (lessonId === 18) {
        wordData.alternatives.forEach((alt, altIndex) => {
          result.push({
            word: alt,
            index: sentence.words.length + (position * 5) + altIndex,
            isCorrect: false
          });
        });
      } else {
        // Для других уроков - стандартная логика (3 альтернативы)
        wordData.alternatives.forEach((alt, altIndex) => {
          result.push({
            word: alt,
            index: sentence.words.length + (position * 3) + altIndex,
            isCorrect: false
          });
        });
      }
    }
    
    // Перемешиваем слова
    return shuffleArray(result);
  };

  // Модифицируем функцию handleWordSelect
  const handleWordSelect = (index: number) => {
    // Если ответ уже проверен, нельзя выбирать новые слова
    if (isCorrect !== null) return;
    
    // Находим выбранное слово
    const selectedWord = availableWords.find(item => item.index === index);
    
    if (!selectedWord) return;
    
    // Добавляем слово к выбранным
    setSelectedWords([...selectedWords, { 
      index: selectedWord.index, 
      word: selectedWord.word,
      isCorrect: selectedWord.isCorrect
    }]);
    
    // Увеличиваем текущую позицию
    const newPosition = currentPosition + 1;
    setCurrentPosition(newPosition);
    
    // Если есть следующая позиция, подготавливаем слова для нее
    if (newPosition < sentences[currentSentenceIndex].words.length) {
      const nextWords = prepareWordsFromExamData(sentences[currentSentenceIndex], newPosition);
      setAvailableWords(nextWords);
    } else {
      // Если достигли конца предложения, очищаем доступные слова
      setAvailableWords([]);
    }
  };

  // Модифицируем функцию handleWordRemove
  const handleWordRemove = (position: number) => {
    // Если ответ уже проверен, нельзя удалять слова
    if (isCorrect !== null) return;
    
    // Удаляем все слова после указанной позиции
    const newSelected = selectedWords.slice(0, position);
    setSelectedWords(newSelected);
    
    // Обновляем текущую позицию
    setCurrentPosition(position);
    
    // Подготавливаем слова для новой текущей позиции
    const newWords = prepareWordsFromExamData(sentences[currentSentenceIndex], position);
    setAvailableWords(newWords);
  };

  // Update the speakSentence function to be simpler
  const speakSentence = async (sentence: ExamSentence) => {
    try {
      await Speech.stop();
      
      const textToSpeak = sentence.english;
      
      if (!textToSpeak) {
        console.log('No text to speak for sentence:', sentence.id);
        return;
      }
      
      console.log('Speaking sentence:', textToSpeak);
      
      try {
        await Speech.speak(textToSpeak, {
        language: 'en-US',
        pitch: 1.0,
          rate: 0.9,
        onStart: () => console.log('Speech started'),
        onDone: () => console.log('Speech finished'),
          onError: (error) => {
            console.error('Speech error:', error);
          }
      });
      } catch (speechError) {
        console.error('Error during speech:', speechError);
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  // Remove audio initialization effect
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Now update the checkAnswer function to use text-to-speech
  const checkAnswer = async () => {
    const currentSentence = sentences[currentSentenceIndex];
    
    // Verification code (unchanged)
    let isAnswerCorrect = true;
    
    // Create array of only correctly selected words (without distractors)
    const correctSelectedWords = selectedWords
      .filter(word => word.isCorrect)
      .map(word => word.index);
    
    // Check if the order of correct words matches expected
    if (JSON.stringify(correctSelectedWords) !== JSON.stringify(currentSentence.correctOrder)) {
      isAnswerCorrect = false;
    }
    
    // Check that all correct words were selected
    if (correctSelectedWords.length !== currentSentence.correctOrder.length) {
      isAnswerCorrect = false;
    }
    
    // Check that no distractors were selected
    if (selectedWords.some(word => !word.isCorrect)) {
      isAnswerCorrect = false;
    }
    
    // Increase attempt counter
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    
    setIsCorrect(isAnswerCorrect);
    setAttempts(attempts + 1);
    
    // Count correct exam answers toward streak as "sentence" completions
    if (isAnswerCorrect) {
      const streakResult = await streakService.trackCompletedSentence();
      if (streakResult && streakResult.streakIncreased) {
        console.log('📱 ExamScreen: Triggering streak animation', streakResult);
        trigger(streakResult.newStreak);
      } else {
        console.log('📱 ExamScreen: No streak increase', streakResult);
      }
    }
    
    // Animate result display
    Animated.timing(resultOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Define max attempts based on lesson
    const maxAttempts = lessonId === 18 ? 2 : 3;
    
    // Speak sentence with a delay to ensure UI updates first
    setTimeout(() => {
      console.log('Checking if we should speak sentence:', currentSentence.english);
      console.log('Is answer correct:', isAnswerCorrect);
      console.log('Current attempt count:', newAttemptCount);
      console.log('Max attempts for this lesson:', maxAttempts);
      
      // Speak sentence when answer is correct
      if (isAnswerCorrect) {
        console.log('Speaking sentence for correct answer');
        speakSentence(currentSentence);
      }
      // Speak sentence on last attempt if incorrect
      else if (!isAnswerCorrect && newAttemptCount >= maxAttempts) {
        console.log('Speaking sentence for last incorrect attempt');
        speakSentence(currentSentence);
      }
    }, 500); // Slightly longer delay to ensure UI has updated
    
    // Get current progress
    let newProgress = examProgress;
    
    // More accurate value of one sentence in percent (~1.85%)
    const percentPerSentence = 100 / sentences.length;
    
    if (isAnswerCorrect) {
      // Increase score
      const newScore = currentScore + 1;
      setCurrentScore(newScore);
      
      // Increase progress by one sentence value
      newProgress = Math.min(100, newProgress + percentPerSentence);
    } else if (newAttemptCount >= (lessonId === 18 ? 2 : 3)) {
      // For lesson 18 - limit 2 attempts, for others - 3
      // If attempt limit is reached, don't change progress
    } else {
      // For incorrect answer, subtract progress by one sentence value
      // For lesson 18 divide by 2, since we have 2 attempts, for others divide by 3 
      newProgress = Math.max(0, newProgress - percentPerSentence / (lessonId === 18 ? 2 : 3));
    }
    
    // Round for display (up to one decimal place)
    newProgress = Math.round(newProgress * 10) / 10;
    
    // Set and save new progress
    setExamProgress(newProgress);
    // Сохраняем прогресс экзамена
    AsyncStorage.setItem(`examProgress_lesson${lessonId}`, newProgress.toString());
    // ВАЖНО: прогресс урока = прогресс экзамена
    AsyncStorage.setItem(`lessonProgress_${lessonId}`, newProgress.toString());
    
    // Save current score
    AsyncStorage.setItem(`examScore_lesson${lessonId}`, currentScore.toString());
    
    // If progress reaches 90% or more, mark lesson as completed
    if (newProgress >= 90 && !isCompleted) {
      setIsCompleted(true);
      
      // Unlock next lesson
      AsyncStorage.setItem(`next_lesson_${lessonId}_unlocked`, 'true');
      
      // Correct: save real progress
      AsyncStorage.setItem(`lessonProgress_${lessonId}`, newProgress.toString());
      
      // Mark lesson as completed - this is important for correct display
      AsyncStorage.setItem(`lesson_${lessonId}_completed`, 'true');
      
      // More reliable check
      if (String(lessonId) === '1') {
        AsyncStorage.setItem('first_lesson_completed', 'true');
      }
    }
  };

  // Also update goToNextSentence to stop any ongoing speech
  const goToNextSentence = () => {
    // Stop any ongoing speech
    Speech.stop();
    
    // Determine next index, looping if needed
    let nextIndex = currentSentenceIndex + 1;
    
    // If reached the end of the sentences array, start from beginning
    if (nextIndex >= sentences.length) {
      nextIndex = 0;
    }
    
    setCurrentSentenceIndex(nextIndex);
    
    // Save current index in AsyncStorage
    AsyncStorage.setItem(`examIndex_lesson${lessonId}`, nextIndex.toString());
    
    // Reset current position
    setCurrentPosition(0);
    
    // Prepare words only for the first position
    const nextSentence = sentences[nextIndex];
    const initialWords = prepareWordsFromExamData(nextSentence, 0);
    
    // Reset state
    setSelectedWords([]);
    setAvailableWords(initialWords);
    setIsCorrect(null);
    setAttempts(0);
    setAttemptCount(0);
    
    // Reset animation
    resultOpacity.setValue(0);
  };

  // Update resetAttempt to stop any ongoing speech
  const resetAttempt = () => {
    // Stop any ongoing speech
    Speech.stop();
    
    setIsCorrect(null);
    resultOpacity.setValue(0);
    
    // Clear selected words and reset position
    setSelectedWords([]);
    setCurrentPosition(0);
    
    // Prepare words for the first position
    const initialWords = prepareWordsFromExamData(sentences[currentSentenceIndex], 0);
    setAvailableWords(initialWords);
  };

  // Функция для отображения результатов (без завершения экзамена)
  const showResults = () => {
    Alert.alert(
      t('exam.resultTitle'),
      t('exam.yourScore', { score: examProgress }),
      [
        { 
          text: t('common.continue'), 
          onPress: goToNextSentence  // Продолжаем экзамен
        }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={[styles.container, styles.loadingContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </LinearGradient>
    );
  }

  if (sentences.length === 0) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={[styles.container, styles.loadingContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.loadingText}>{t('exam.noSentences')}</Text>
      </LinearGradient>
    );
  }

  const currentSentence = sentences[currentSentenceIndex];

  return (
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Добавляем TouchableWithoutFeedback для обработки нажатий на весь экран */}
        <TouchableWithoutFeedback 
          onPress={() => {
            // Сбрасываем попытку только если ответ неверный и еще есть доступные попытки
            const maxAttempts = lessonId === 18 ? 2 : 3;
            if (isCorrect === false && attemptCount < maxAttempts) {
              resetAttempt();
            }
          }}
        >
          <View style={styles.fullScreenContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  // Stop any ongoing speech
                  Speech.stop();
                  
                  // Save current index before exiting
                  AsyncStorage.setItem(`examIndex_lesson${lessonId}`, currentSentenceIndex.toString());
                  navigation.goBack();
                }}
              >
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('exam.title')}</Text>
              <View style={styles.placeholder} />
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: `${examProgress}%` }]}
                />
              </View>
              <Text style={styles.progressPercentage}>{examProgress}%</Text>
            </View>
            
            {/* Completed Message */}
            {isCompleted && (
              <View style={styles.completedContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.completedText} numberOfLines={2} ellipsizeMode="tail">
                  {t('exam.successMessage')}
                </Text>
              </View>
            )}
            
            {/* Current Sentence (Translation) */}
            <View style={styles.sentenceContainer}>
              <Text style={styles.sentenceText}>{currentSentence.translation}</Text>
            </View>
            
            {/* Selected Words Area */}
            <View style={styles.selectedWordsContainer}>
              <View style={styles.wordSlots}>
                {selectedWords.map((wordItem, position) => (
                  <TouchableOpacity
                    key={`selected-${position}`}
                    style={[
                      styles.wordSlot,
                      isCorrect === true ? styles.correctWord : 
                      isCorrect === false ? styles.incorrectWord : 
                      null
                    ]}
                    onPress={() => handleWordRemove(position)}
                    disabled={isCorrect !== null}
                  >
                    <Text style={styles.wordText}>
                      {wordItem.word}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Result Message */}
            <Animated.View
              style={[
                styles.resultContainer,
                {
                  opacity: resultOpacity,
                  backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                }
              ]}
            >
              <Text style={[
                styles.resultText,
                { color: isCorrect ? '#10B981' : '#EF4444' }
              ]}>
                {isCorrect ? t('exam.correct') : t('exam.incorrect')}
              </Text>

              {/* Для урока 18 показываем правильный ответ уже после 2 попыток */}
              {!isCorrect && ((lessonId === 18 && attemptCount >= 2) || (lessonId !== 18 && attemptCount >= 3)) && (
                <Text style={styles.correctAnswerText}>
                  {/* Используем currentSentence.words.join(' ') как запасной вариант, если currentSentence.english пустое */}
                  {t('exam.correctAnswer')}: {currentSentence.english || currentSentence.words.join(' ')}
                </Text>
              )}
            </Animated.View>
            
            {/* Available Words (scrollable area, сохраняем раскладку и отступы) */}
            <View style={styles.availableWordsContainer}>
              <ScrollView
                contentContainerStyle={styles.availableWordsWrap}
                showsVerticalScrollIndicator={false}
              >
                {availableWords.map((item, idx) => (
                  <TouchableOpacity
                    key={`available-${item.index}-${idx}`}
                    style={styles.availableWord}
                    onPress={() => handleWordSelect(item.index)}
                    disabled={isCorrect !== null}
                  >
                    <Text style={styles.wordText}>{item.word}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isCorrect === true ? (
                // Если ответ правильный, показываем кнопку "Следующее"
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextSentence}
                >
                  <Text style={styles.buttonText}>{t('exam.next')}</Text>
                </TouchableOpacity>
              ) : isCorrect === false && ((lessonId === 18 && attemptCount >= 2) || (lessonId !== 18 && attemptCount >= 3)) ? (
                // Если ответ неправильный и использованы все попытки (2 для урока 18, 3 для других)
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextSentence}
                >
                  <Text style={styles.buttonText}>{t('exam.next')}</Text>
                </TouchableOpacity>
              ) : isCorrect === false ? (
                // Если ответ неправильный, но остались попытки
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={resetAttempt}
                >
                  <Text style={styles.buttonText}>{t('exam.tryAgain')}</Text>
                </TouchableOpacity>
              ) : (
                // Если ответ еще не проверен
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    selectedWords.length === 0 ? styles.disabledButton : null
                  ]}
                  onPress={checkAnswer}
                  disabled={selectedWords.length === 0}
                >
                  <Text style={styles.buttonText}>{t('exam.check')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: 'white',
    marginRight: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'nowrap',
  },
  completedText: {
    flex: 1,
    fontSize: 16,
    color: '#10B981',
    marginLeft: 8,
    flexShrink: 1,
  },
  sentenceContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  sentenceText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
  },
  selectedWordsContainer: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  wordSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  wordSlot: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  correctWord: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  incorrectWord: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  wordText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  availableWordsContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 16,
  },
  availableWordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  availableWord: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    padding: 16,
  },
  checkButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  disabledButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderColor: 'rgba(37, 99, 235, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  distractorWord: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  fullScreenContainer: {
    flex: 1,
    paddingBottom: 100,
  },
});

export default ExamScreen; 