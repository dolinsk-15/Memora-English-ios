import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
import { useTranslation } from '../../localization';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lessonService } from '../../services/lessonService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import streakService from '../../services/streakService';
import { useStreakAnimation } from '../../contexts/StreakAnimationContext';

type Props = NativeStackScreenProps<LessonsStackParamList, 'LearnWords'>;

interface WordProgress {
  engToRusCorrect: number;  // Счетчик правильных ответов ENG→RUS (для статистики)
  rusToEngCorrect: number;  // Счетчик правильных ответов RUS→ENG (для статистики)
  totalProgress: number;    // 0-100% (каждый правильный ответ = +10%, максимум 100%)
  isLearned: boolean;       // true когда totalProgress = 100%
  isDeferred: boolean;      // true если слово отложено после 3 неудачных попыток
  attempts: number;         // Текущее количество попыток для данного упражнения
}

interface WordItem {
  id: number;
  number: number;
  english: string;
  translation: string;
  russian: string;
  progress: WordProgress;
  listSource: string;
}

interface AnswerOption {
  text: string;
  isCorrect: boolean;
  id: number;
}

// Добавить маппинг языка
const languageMap = { en: 'english', ru: 'russian', es: 'spanish', fr: 'french', de: 'german' };

const LearnWordsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId, wordListType = 'firstList' } = route.params;
  const { t, language } = useTranslation();
  const mappedLanguage = languageMap[language] || 'english';
  const isRepeatMode = false;
  const { trigger } = useStreakAnimation();
  
  // State
  const [words, setWords] = useState<WordItem[]>([]);
  const [allWords, setAllWords] = useState<WordItem[]>([]); // Полный список всех слов урока
  const [activeWords, setActiveWords] = useState<WordItem[]>([]); // Активное окно из 10 слов
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exerciseType, setExerciseType] = useState<'eng-to-rus' | 'rus-to-eng'>('eng-to-rus');
  const [deferredWords, setDeferredWords] = useState<WordItem[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [answerOptionsWordId, setAnswerOptionsWordId] = useState<number | null>(null); // Track which word the options belong to
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  
  // State for RUS→ENG exercise
  const [userInput, setUserInput] = useState('');
  const [inputSubmitted, setInputSubmitted] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [currentExerciseAttempts, setCurrentExerciseAttempts] = useState(0);
  
  // State for deferred words management
  const [deferredWordsQueue, setDeferredWordsQueue] = useState<{wordIndex: number, deferredAt: number}[]>([]);
  const [wordsShownSinceDefer, setWordsShownSinceDefer] = useState(0);
  const WORDS_BEFORE_RETURN = 5; // Количество слов, которые нужно показать перед возвратом отложенного
  
  // State for sliding window system
  const ACTIVE_WORDS_COUNT = 10; // Количество слов в активном окне
  const [nextWordIndexToAdd, setNextWordIndexToAdd] = useState(ACTIVE_WORDS_COUNT); // Индекс следующего слова для добавления

  // Нормализация текста для сравнения
  const normalizeText = (text: string): string => {
    return text.trim().toLowerCase().replace(/[.,!?;:]/g, '');
  };

  // Проверка ответа для RUS→ENG
  const checkRusToEngAnswer = () => {
    if (userInput.trim() === '') return;
    
    const normalizedInput = normalizeText(userInput);
    const normalizedCorrect = normalizeText(currentWord.english);
    
    const isCorrect = normalizedInput === normalizedCorrect;
    
    setIsCorrectAnswer(isCorrect);
    setInputSubmitted(true);
    setShowResult(true);
    
    // Увеличиваем счетчик попыток только при неправильном ответе
    if (!isCorrect) {
      const newAttemptCount = currentExerciseAttempts + 1;
      setCurrentExerciseAttempts(newAttemptCount);
      updateWordProgress(isCorrect, newAttemptCount);
    } else {
      updateWordProgress(isCorrect, currentExerciseAttempts);
    }
    
    // Скрываем клавиатуру
    Keyboard.dismiss();
  };

  // Сброс состояния для нового слова
  const resetExerciseState = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setUserInput('');
    setInputSubmitted(false);
    setIsCorrectAnswer(false);
    setCurrentExerciseAttempts(0);
  };

  // Повторная попытка (только для неправильных ответов)
  const retryCurrentExercise = () => {
    if (exerciseType === 'eng-to-rus') {
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrectAnswer(false);
    } else {
      setUserInput('');
      setInputSubmitted(false);
      setShowResult(false);
      setIsCorrectAnswer(false);
      // Фокусируемся на поле ввода
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Генерация вариантов ответов для ENG→RUS
  const generateAnswerOptions = (currentWord: WordItem, allWords: WordItem[]): AnswerOption[] => {
    const correctAnswer = currentWord.translation;
    
    // Получаем все переводы других слов (исключая текущее)
    const otherWords = allWords.filter(word => word.number !== currentWord.number);
    
    // Создаем пул кандидатов для ложных вариантов
    const candidateTranslations = otherWords
      .map(word => word.translation)
      .filter(translation => translation && translation !== correctAnswer) // Убираем пустые и правильный ответ
      .filter(translation => translation.length > 0); // Убираем пустые строки
    
    // Убираем дубликаты
    const uniqueTranslations = [...new Set(candidateTranslations)];
    
    console.log(`Generating options for "${currentWord.english}" -> "${correctAnswer}"`);
    console.log(`Available unique translations: ${uniqueTranslations.length}`);
    
    // Определяем количество ложных вариантов (стремимся к 5, но адаптируемся к доступным)
    const targetFalseOptions = 5;
    const availableFalseOptions = Math.min(targetFalseOptions, uniqueTranslations.length);
    
    if (availableFalseOptions === 0) {
      // Если нет других переводов, показываем только правильный ответ
      console.warn('No other translations available for false options');
      return [{
        text: correctAnswer,
        isCorrect: true,
        id: 0,
      }];
    }
    
    // Выбираем случайные ложные варианты
    const selectedFalseOptions: string[] = [];
    const shuffledTranslations = [...uniqueTranslations].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < availableFalseOptions && i < shuffledTranslations.length; i++) {
      const candidate = shuffledTranslations[i];
      
      // Дополнительная проверка: избегаем слишком похожих переводов
      const isTooSimilar = selectedFalseOptions.some(selected => 
        selected.toLowerCase().includes(candidate.toLowerCase()) || 
        candidate.toLowerCase().includes(selected.toLowerCase())
      );
      
      if (!isTooSimilar) {
        selectedFalseOptions.push(candidate);
      }
    }
    
    // Если после фильтрации осталось мало вариантов, добираем из оставшихся
    while (selectedFalseOptions.length < availableFalseOptions && selectedFalseOptions.length < shuffledTranslations.length) {
      for (const candidate of shuffledTranslations) {
        if (!selectedFalseOptions.includes(candidate) && selectedFalseOptions.length < availableFalseOptions) {
          selectedFalseOptions.push(candidate);
        }
      }
      break; // Избегаем бесконечного цикла
    }
    
    console.log(`Selected ${selectedFalseOptions.length} false options:`, selectedFalseOptions);
    
    // Создаем массив вариантов
    const options: AnswerOption[] = [
      {
        text: correctAnswer,
        isCorrect: true,
        id: 0,
      },
      ...selectedFalseOptions.map((option, index) => ({
        text: option,
        isCorrect: false,
        id: index + 1,
      }))
    ];
    
    // Перемешиваем варианты только один раз при создании нового упражнения
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    console.log(`Final options count: ${shuffledOptions.length} (1 correct + ${selectedFalseOptions.length} false)`);
    
    return shuffledOptions;
  };

  // Воспроизведение аудио
  const playAudio = async (text: string) => {
    try {
      await Speech.stop();
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Обработка выбора ответа
  const handleAnswerSelect = (optionId: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(optionId);
    const selectedOption = answerOptions.find(option => option.id === optionId);
    
    if (selectedOption) {
      setIsCorrectAnswer(selectedOption.isCorrect);
      setShowResult(true);
      
      // Увеличиваем счетчик попыток только при неправильном ответе
      if (!selectedOption.isCorrect) {
        const newAttemptCount = currentExerciseAttempts + 1;
        setCurrentExerciseAttempts(newAttemptCount);
        updateWordProgress(selectedOption.isCorrect, newAttemptCount);
      } else {
        updateWordProgress(selectedOption.isCorrect, currentExerciseAttempts);
      }
    }
  };

  // Обновление прогресса слова
  const updateWordProgress = (isCorrect: boolean, currentAttempts: number) => {
    // В режиме повторения не обновляем прогресс, только логируем
    if (isRepeatMode) {
      console.log(`Repeat mode: ${isCorrect ? 'correct' : 'wrong'} answer for "${words[currentWordIndex].english}"`);
      return;
    }
    
    setWords(prevWords => {
      const updatedWords = prevWords.map((word, index) => {
        if (index === currentWordIndex) {
          const updatedProgress = { ...word.progress };
          
          if (isCorrect) {
            // Увеличиваем соответствующий счетчик
            if (exerciseType === 'eng-to-rus') {
              const oldValue = updatedProgress.engToRusCorrect;
              updatedProgress.engToRusCorrect = Math.min(3, updatedProgress.engToRusCorrect + 1);
              console.log(`ENG→RUS counter: ${oldValue} → ${updatedProgress.engToRusCorrect}`);
              
              if (oldValue === 3) {
                console.warn(`⚠️ ENG→RUS counter already at maximum (3)! This correct answer won't increase progress.`);
              }
            } else {
              const oldValue = updatedProgress.rusToEngCorrect;
              updatedProgress.rusToEngCorrect = Math.min(3, updatedProgress.rusToEngCorrect + 1);
              console.log(`RUS→ENG counter: ${oldValue} → ${updatedProgress.rusToEngCorrect}`);
              
              if (oldValue === 3) {
                console.warn(`⚠️ RUS→ENG counter already at maximum (3)! This correct answer won't increase progress.`);
              }
            }
            
            // Простая логика: добавляем 100/6 ≈ 16.67% за каждый правильный ответ (3+3=6)
            const oldProgress = updatedProgress.totalProgress;
            const increment = 100 / 6;
            updatedProgress.totalProgress = Math.min(100, +(updatedProgress.totalProgress + increment).toFixed(2));
            
            console.log(`Progress update: ${oldProgress}% → ${updatedProgress.totalProgress}% (+${increment.toFixed(2)}%)`);
            
            // Специальная проверка для завершающего шага → 100%
            if (updatedProgress.totalProgress === 100 && oldProgress < 100) {
              console.log(`✅ CRITICAL: Progress successfully updated from 90% to 100%!`);
            }
            
            // Проверяем, выучено ли слово (достигнут 100%)
            const wasLearned = updatedProgress.isLearned;
            updatedProgress.isLearned = updatedProgress.totalProgress >= 100;
            
            if (!wasLearned && updatedProgress.isLearned) {
              console.log(`🎉 Word "${word.english}" just reached 100%! Setting isLearned = true`);
              
              // Добавляем вибрацию при достижении 100% (длительная)
              Vibration.vibrate(400);
              
              // Отслеживаем завершенное слово для streak
              (async () => {
                try {
                  const streakResult = await streakService.trackCompletedWord();
                  if (streakResult && streakResult.streakIncreased) {
                    console.log('📱 LearnWordsScreen: Triggering streak animation', streakResult);
                    trigger(streakResult.newStreak);
                  } else {
                    console.log('📱 LearnWordsScreen: No streak increase', streakResult);
                  }
                } catch (error) {
                  console.error('Error tracking completed word:', error);
                }
              })();
            }
            
            // Логируем прогресс
            console.log(`Progress update for word "${word.english}":`, {
              engToRus: `${updatedProgress.engToRusCorrect}/3`,
              rusToEng: `${updatedProgress.rusToEngCorrect}/3`,
              totalProgress: `${updatedProgress.totalProgress}%`,
              isLearned: updatedProgress.isLearned,
              wasJustLearned: !wasLearned && updatedProgress.isLearned
            });
            
            // Сбрасываем попытки и статус отложенности при правильном ответе
            updatedProgress.attempts = 0;
            updatedProgress.isDeferred = false;
            
            // Убираем слово из очереди отложенных, если оно там было
            setDeferredWordsQueue(prev => prev.filter(item => item.wordIndex !== index));
            
            // Отслеживаем любой правильный ответ для streak (если еще не было активности сегодня)
            (async () => {
              try {
                const streakResult = await streakService.trackCompletedWord();
                if (streakResult && streakResult.streakIncreased) {
                  console.log('📱 LearnWordsScreen: Triggering streak animation for correct answer', streakResult);
                  trigger(streakResult.newStreak);
                }
              } catch (error) {
                console.error('Error tracking correct answer:', error);
              }
            })();
            
          } else {
            // При неправильном ответе увеличиваем счетчик попыток
            updatedProgress.attempts = currentAttempts;
            
            console.log(`Wrong answer for word "${word.english}". Attempts: ${updatedProgress.attempts}/3`);
            
            // Если 3 неудачные попытки - откладываем слово
            if (updatedProgress.attempts >= 3) {
              updatedProgress.isDeferred = true;
              updatedProgress.attempts = 0;
              
              // Добавляем слово в очередь отложенных
              setDeferredWordsQueue(prev => {
                const alreadyInQueue = prev.some(item => item.wordIndex === index);
                if (!alreadyInQueue) {
                  return [...prev, { wordIndex: index, deferredAt: wordsShownSinceDefer }];
                }
                return prev;
              });
              
              console.log(`Word "${word.english}" deferred after 3 failed attempts`);
            }
          }
          
          return {
            ...word,
            progress: updatedProgress
          };
        }
        return word;
      });
      
      // Применяем систему скользящего окна
      // НЕ вызываем updateActiveWindow здесь - это вызывает визуальный сброс
      // const finalWords = updateActiveWindow(updatedWords);
      const finalWords = updatedWords;
      
      // Обновляем также полный список слов в allWords
      console.log(`\nUpdating allWords with progress from finalWords...`);
      setAllWords(prevAllWords => 
        prevAllWords.map(allWord => {
          const updatedWord = finalWords.find(w => w.number === allWord.number);
          if (updatedWord && allWord.number === updatedWord.number) {
            console.log(`Updating word #${allWord.number} in allWords: ${allWord.progress.totalProgress}% → ${updatedWord.progress.totalProgress}%`);
          }
          return updatedWord || allWord;
        })
      );
      
      return finalWords;
    });
  };

  // Переход к следующему слову
  const goToNextWord = () => {
    // Логируем текущий прогресс перед переходом
    const currentWord = words[currentWordIndex];
    if (currentWord) {
      console.log(`Moving from word "${currentWord.english}" with progress:`, {
        engToRus: currentWord.progress.engToRusCorrect,
        rusToEng: currentWord.progress.rusToEngCorrect,
        total: currentWord.progress.totalProgress,
        isLearned: currentWord.progress.isLearned
      });
      
      // Специальная проверка для слов с 90% или 100%
      if (currentWord.progress.totalProgress === 90) {
        console.log(`⚠️ WARNING: Moving away from word with 90% progress!`);
      } else if (currentWord.progress.totalProgress === 100) {
        console.log(`✅ Moving away from completed word (100%)`);
      }
    }
    
    // Проверяем, есть ли изученные слова, которые нужно заменить
    const learnedWords = words.filter(w => w.progress.isLearned);
    let effectiveWords = words; // рабочее «активное окно» для дальнейшей логики
    if (learnedWords.length > 0 && !isRepeatMode) {
      console.log(`Found ${learnedWords.length} learned words that need to be replaced`);
      
      // Сначала обновляем allWords с текущим прогрессом
      const updatedAllWords = allWords.map(allWord => {
        const currentWord = words.find(w => w.number === allWord.number);
        if (currentWord && currentWord.progress.totalProgress !== allWord.progress.totalProgress) {
          console.log(`Updating word #${allWord.number} progress: ${allWord.progress.totalProgress}% → ${currentWord.progress.totalProgress}%`);
        }
        return currentWord || allWord;
      });
      
      console.log(`Current nextWordIndexToAdd before update: ${nextWordIndexToAdd}`);
      
      // Применяем обновление скользящего окна с актуальным allWords
      const updatedWords = updateActiveWindow(words, updatedAllWords);
      
      // Обновляем состояния
      setAllWords(updatedAllWords);
      setWords(updatedWords);
      effectiveWords = updatedWords;
    }
    
    resetExerciseState();
    
    // Увеличиваем счетчик показанных слов
    setWordsShownSinceDefer(prev => prev + 1);
    
    // Получаем текущее состояние слов (используем обновлённое окно, если оно изменилось)
    const currentWords = effectiveWords;
    const activeWords = currentWords.filter(w => !w.progress.isLearned && !w.progress.isDeferred);
    
    console.log(`Current state: ${activeWords.length} active, ${deferredWordsQueue.length} deferred in queue, ${currentWords.filter(w => w.progress.isLearned).length} learned`);
    
    // Проверяем, нужно ли вернуть отложенное слово
    const shouldReturnDeferred = deferredWordsQueue.some(item => 
      wordsShownSinceDefer - item.deferredAt >= WORDS_BEFORE_RETURN
    );
    
    if (shouldReturnDeferred && deferredWordsQueue.length > 0) {
      // Находим первое слово, которое готово к возврату
      const readyToReturn = deferredWordsQueue.find(item => 
        wordsShownSinceDefer - item.deferredAt >= WORDS_BEFORE_RETURN
      );
      
      if (readyToReturn) {
        // Убираем слово из очереди отложенных
        setDeferredWordsQueue(prev => prev.filter(item => item.wordIndex !== readyToReturn.wordIndex));
        
        // Убираем статус отложенности с слова
        setWords(prevWords => 
          prevWords.map((word, index) => {
            if (index === readyToReturn.wordIndex) {
              return {
                ...word,
                progress: {
                  ...word.progress,
                  isDeferred: false,
                  attempts: 0,
                }
              };
            }
            return word;
          })
        );
        
        setCurrentWordIndex(readyToReturn.wordIndex);
        
        // Чередуем типы упражнений
        const nextExerciseType = exerciseType === 'eng-to-rus' ? 'rus-to-eng' : 'eng-to-rus';
        setExerciseType(nextExerciseType);
        

        return;
      }
    }
    
    // Чередуем типы упражнений для следующего слова
    const nextExerciseType = exerciseType === 'eng-to-rus' ? 'rus-to-eng' : 'eng-to-rus';
    
    // Если есть активные слова, выбираем следующее из них
    if (activeWords.length > 0) {
      // Сначала ищем слова, которые еще не проходились в следующем типе упражнения
      let priorityWords = currentWords.filter((word, index) => {
        if (word.progress.isLearned || word.progress.isDeferred) return false;
        
        // Проверяем, нужно ли еще пройти это слово в следующем типе упражнения
        if (nextExerciseType === 'eng-to-rus') {
          return word.progress.engToRusCorrect < 3;
        } else {
          return word.progress.rusToEngCorrect < 3;
        }
      });
      
      // Если нет слов для приоритетного прохождения, берем любые активные
      if (priorityWords.length === 0) {
        priorityWords = activeWords;
      }
      
      // Находим следующее слово после текущего
      let nextWordIndex = -1;
      
      // Сначала ищем среди приоритетных слов после текущего индекса
      for (let i = currentWordIndex + 1; i < currentWords.length; i++) {
        const word = currentWords[i];
        if (priorityWords.includes(word)) {
          nextWordIndex = i;
          break;
        }
      }
      
      // Если не нашли после текущего, ищем с начала
      if (nextWordIndex === -1) {
        for (let i = 0; i <= currentWordIndex; i++) {
          const word = currentWords[i];
          if (priorityWords.includes(word)) {
            nextWordIndex = i;
            break;
          }
        }
      }
      
      if (nextWordIndex !== -1) {
        // Нормализуем индекс на случай, если окно сузилось
        const safeIndex = Math.max(0, Math.min(nextWordIndex, currentWords.length - 1));
        setCurrentWordIndex(safeIndex);
        setExerciseType(nextExerciseType);
        
        const debugWord = currentWords[safeIndex];
        console.log(`Moving to word ${safeIndex} (${debugWord ? debugWord.english : 'N/A'}) with exercise type ${nextExerciseType}`);
        return;
      }
    }
    
    // Если нет активных слов, но есть отложенные в очереди - принудительно возвращаем первое
    if (deferredWordsQueue.length > 0) {
      const firstDeferred = deferredWordsQueue[0];
      
      // Убираем слово из очереди
      setDeferredWordsQueue(prev => prev.slice(1));
      
      // Убираем статус отложенности
      setWords(prevWords => 
        prevWords.map((word, index) => {
          if (index === firstDeferred.wordIndex) {
            return {
              ...word,
              progress: {
                ...word.progress,
                isDeferred: false,
                attempts: 0,
              }
            };
          }
          return word;
        })
      );
      
      setCurrentWordIndex(firstDeferred.wordIndex);
      
      // Выбираем тип упражнения для отложенного слова
      // Приоритет отдаем направлению с меньшим прогрессом
      const deferredWord = currentWords[firstDeferred.wordIndex];
      let nextExerciseType: 'eng-to-rus' | 'rus-to-eng';
      
      if (deferredWord.progress.engToRusCorrect < deferredWord.progress.rusToEngCorrect) {
        nextExerciseType = 'eng-to-rus';
      } else if (deferredWord.progress.rusToEngCorrect < deferredWord.progress.engToRusCorrect) {
        nextExerciseType = 'rus-to-eng';
      } else {
        // Если прогресс одинаковый, чередуем
        nextExerciseType = exerciseType === 'eng-to-rus' ? 'rus-to-eng' : 'eng-to-rus';
      }
      
      setExerciseType(nextExerciseType);
      

      return;
    }
    
    // Если все слова урока изучены (проверяем по всему списку allWords)
    const allLearned = allWords.length > 0 && allWords.every(w => w.progress.isLearned);
    if (allLearned) {
      handleAllWordsCompleted();
      return;
    }
    
    // Fallback: если что-то пошло не так, возвращаемся к началу
    Alert.alert(
      'Тренировка завершена',
      'Вы прошли все доступные слова!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  // Загрузка слов из JSON
  const loadWordsFromJson = async (): Promise<WordItem[]> => {
    try {
      const numericLessonId = Number(lessonId);
      console.log("Loading vocabulary for lesson:", numericLessonId);
      
      const vocabularyData = await lessonService.getLessonVocabulary(numericLessonId);
      
      if (vocabularyData && vocabularyData.allWords && vocabularyData.allWords.length > 0) {
        // Фильтруем слова по типу списка
        const filteredWords = vocabularyData.allWords.filter((word: any) => {
          return word.listSource === wordListType;
        });
        
        console.log("Filtered words count:", filteredWords.length);
        
        // Форматируем слова для тренировки
        const formattedWords: WordItem[] = filteredWords.map((word: any) => {
          const translation = word[mappedLanguage] || word.russian;
          
          return {
            id: word.number,
            number: word.number,
            english: word.english,
            russian: word.russian,
            translation: translation,
            listSource: word.listSource,
            progress: {
              engToRusCorrect: 0,
              rusToEngCorrect: 0,
              totalProgress: 0,
              isLearned: false,
              isDeferred: false,
              attempts: 0,
            }
          };
        });
        
        return formattedWords;
      } else {
        console.log('No vocabulary data for this lesson');
        return [];
      }
    } catch (error) {
      console.error('Error loading words from JSON:', error);
      return [];
    }
  };

  // Загрузка сохраненного прогресса
  const loadSavedProgress = async (wordsData: WordItem[]): Promise<WordItem[]> => {
    try {
      const savedProgress = await AsyncStorage.getItem(`learnWordsProgress_lesson${lessonId}_${wordListType}`);
      
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        console.log('Loaded saved progress:', progressData);
        
        // Применяем сохраненный прогресс к словам
        return wordsData.map(word => {
          const savedWordProgress = progressData[word.number];
          if (savedWordProgress) {
            return {
              ...word,
              progress: {
                engToRusCorrect: savedWordProgress.engToRusCorrect || 0,
                rusToEngCorrect: savedWordProgress.rusToEngCorrect || 0,
                totalProgress: savedWordProgress.totalProgress || 0,
                isLearned: savedWordProgress.isLearned || false,
                isDeferred: savedWordProgress.isDeferred || false,
                attempts: 0, // Сбрасываем попытки при загрузке
              }
            };
          }
          return word;
        });
      }
      
      return wordsData;
    } catch (error) {
      console.error('Error loading saved progress:', error);
      return wordsData;
    }
  };

  // Сохранение прогресса
  const saveProgress = async (updatedWords: WordItem[]) => {
    try {
      // Загружаем существующий прогресс, чтобы не потерять выученные слова
      const existingProgressKey = `learnWordsProgress_lesson${lessonId}_${wordListType}`;
      const existingProgressData = await AsyncStorage.getItem(existingProgressKey);
      const existingProgress = existingProgressData ? JSON.parse(existingProgressData) : {};
      
      const progressData: {[wordId: number]: WordProgress} = {};
      
      // Сначала копируем существующий прогресс (включая выученные слова)
      Object.keys(existingProgress).forEach(wordId => {
        progressData[parseInt(wordId)] = existingProgress[wordId];
      });
      
      // Затем обновляем прогресс для активных слов
      updatedWords.forEach(word => {
        progressData[word.number] = word.progress;
      });
      
      // Сохраняем прогресс тренажера
      await AsyncStorage.setItem(existingProgressKey, JSON.stringify(progressData));
      
      // Также обновляем прогресс для основного экрана слов
      const wordRepetitionsData: {[wordId: number]: {repetitions: number, totalProgress: number}} = {};
      
      // Сохраняем прогресс для всех слов (включая выученные)
      Object.keys(progressData).forEach(wordId => {
        const progress = progressData[parseInt(wordId)];
        const repetitions = Math.floor((progress.totalProgress / 100) * 10);
        wordRepetitionsData[parseInt(wordId)] = { 
          repetitions,
          totalProgress: progress.totalProgress 
        };
      });
      
      await AsyncStorage.setItem(
        `wordRepetitions_lesson${lessonId}`,
        JSON.stringify(wordRepetitionsData)
      );
      
      console.log('Progress saved successfully for both systems');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Сохранение состояния сессии
  const saveSessionState = async () => {
    try {
      const sessionState = {
        currentWordIndex,
        // Сохраняем идентификатор слова для точного восстановления независимо от смещения окна
        currentWordNumber: words[currentWordIndex]?.number,
        exerciseType,
        deferredWordsQueue,
        wordsShownSinceDefer,
        currentExerciseAttempts,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(
        `learnWordsSession_lesson${lessonId}_${wordListType}`,
        JSON.stringify(sessionState)
      );
      
      console.log('Session state saved successfully');
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  };

  // Загрузка состояния сессии
  const loadSessionState = async (wordsBase?: WordItem[]) => {
    try {
      const savedSession = await AsyncStorage.getItem(`learnWordsSession_lesson${lessonId}_${wordListType}`);
      
      if (savedSession) {
        const sessionState = JSON.parse(savedSession);
        const now = Date.now();
        const sessionAge = now - (sessionState.timestamp || 0);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 часа
        
        // Если сессия не старше 24 часов, восстанавливаем состояние
        if (sessionAge < maxSessionAge) {
          console.log('Restoring session state:', sessionState);
          
          // Пытаемся восстановить по номеру слова, чтобы не зависеть от смещения окна
          const candidateNumber = sessionState.currentWordNumber;
          let targetIndex: number = sessionState.currentWordIndex || 0;
          if (candidateNumber && Array.isArray(wordsBase) && wordsBase.length > 0) {
            const idx = wordsBase.findIndex(w => w.number === candidateNumber);
            if (idx >= 0) {
              targetIndex = idx;
            }
          }
          
          // Если восстановленное слово уже выучено, перейти к следующему невыученному в текущем окне
          if (Array.isArray(wordsBase) && wordsBase.length > 0) {
            const isLearned = wordsBase[targetIndex]?.progress?.isLearned;
            if (isLearned) {
              const nextUnlearned = wordsBase.findIndex(w => !w.progress.isLearned);
              targetIndex = nextUnlearned >= 0 ? nextUnlearned : 0;
            }
          }
          setCurrentWordIndex(targetIndex);
          setExerciseType(sessionState.exerciseType || 'eng-to-rus');
          setDeferredWordsQueue(sessionState.deferredWordsQueue || []);
          setWordsShownSinceDefer(sessionState.wordsShownSinceDefer || 0);
          setCurrentExerciseAttempts(sessionState.currentExerciseAttempts || 0);
          
          return true; // Сессия восстановлена
        } else {
          console.log('Session too old, starting fresh');
          // Удаляем старую сессию
          await AsyncStorage.removeItem(`learnWordsSession_lesson${lessonId}_${wordListType}`);
        }
      }
      
      return false; // Новая сессия
    } catch (error) {
      console.error('Error loading session state:', error);
      return false;
    }
  };

  // Очистка состояния сессии при завершении
  const clearSessionState = async () => {
    try {
      await AsyncStorage.removeItem(`learnWordsSession_lesson${lessonId}_${wordListType}`);
      console.log('Session state cleared');
    } catch (error) {
      console.error('Error clearing session state:', error);
    }
  };

  // Сохранение общей статистики обучения
  const saveTrainingStats = async (wordsData: WordItem[]) => {
    try {
      const stats = {
        totalWords: wordsData.length,
        learnedWords: wordsData.filter(w => w.progress.isLearned).length,
        totalCorrectAnswers: wordsData.reduce((sum, word) => 
          sum + word.progress.engToRusCorrect + word.progress.rusToEngCorrect, 0
        ),
        averageProgress: wordsData.reduce((sum, word) => sum + word.progress.totalProgress, 0) / wordsData.length,
        lastUpdated: Date.now(),
      };
      
      await AsyncStorage.setItem(
        `learnWordsStats_lesson${lessonId}_${wordListType}`,
        JSON.stringify(stats)
      );
      
      console.log('Training stats saved:', stats);
    } catch (error) {
      console.error('Error saving training stats:', error);
    }
  };

  // Сброс прогресса (для тестирования)
  const resetAllProgress = async () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите сбросить весь прогресс обучения?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            try {
              // Очищаем все данные
              await AsyncStorage.removeItem(`learnWordsProgress_lesson${lessonId}_${wordListType}`);
              await AsyncStorage.removeItem(`learnWordsSession_lesson${lessonId}_${wordListType}`);
              await AsyncStorage.removeItem(`learnWordsStats_lesson${lessonId}_${wordListType}`);
              
              // Сбрасываем состояние
              setWords(prevWords => 
                prevWords.map(word => ({
                  ...word,
                  progress: {
                    engToRusCorrect: 0,
                    rusToEngCorrect: 0,
                    totalProgress: 0,
                    isLearned: false,
                    isDeferred: false,
                    attempts: 0,
                  }
                }))
              );
              
              setCurrentWordIndex(0);
              setExerciseType('eng-to-rus');
              setDeferredWordsQueue([]);
              setWordsShownSinceDefer(0);
              resetExerciseState();
              
              console.log('All progress reset successfully');
            } catch (error) {
              console.error('Error resetting progress:', error);
            }
          }
        }
      ]
    );
  };

  // Управление скользящим окном активных слов
  const updateActiveWindow = (updatedWords: WordItem[], currentAllWords: WordItem[]) => {
    // В режиме повторения не используем скользящее окно
    if (isRepeatMode) return updatedWords;
    
    const newlyLearnedWords = updatedWords.filter(word => word.progress.isLearned);
    
    // Если есть новые выученные слова, заменяем их на новые из общего списка
    if (newlyLearnedWords.length > 0) {
      console.log(`Found ${newlyLearnedWords.length} newly learned words, replacing with new ones`);
      
      let newActiveWords = [...updatedWords];
      let currentNextIndex = nextWordIndexToAdd;
      
      // Для каждого выученного слова добавляем новое
      newlyLearnedWords.forEach(learnedWord => {
        console.log(`Processing learned word #${learnedWord.number} "${learnedWord.english}" with progress ${learnedWord.progress.totalProgress}%`);
        
        // Убираем выученное слово из активного списка
        newActiveWords = newActiveWords.filter(word => word.number !== learnedWord.number);
        console.log(`Removed learned word from active window. Active words count: ${newActiveWords.length}`);
        
        // Добавляем новое слово, если есть еще неиспользованные
        while (currentNextIndex < currentAllWords.length && newActiveWords.length < ACTIVE_WORDS_COUNT) {
          const newWord = currentAllWords[currentNextIndex];
          
          // Проверяем, не находится ли это слово уже в активном окне
          const isAlreadyActive = newActiveWords.some(w => w.number === newWord.number);
          
          if (newWord && !newWord.progress.isLearned && !isAlreadyActive) {
            console.log(`Adding word #${newWord.number} "${newWord.english}" to active window with progress ${newWord.progress.totalProgress}%`);
            newActiveWords.push(newWord);
            currentNextIndex++;
            break; // Добавили одно слово за раз
          } else if (newWord && newWord.progress.isLearned) {
            console.log(`Skipping word #${newWord.number} "${newWord.english}" - already learned`);
            currentNextIndex++;
          } else if (isAlreadyActive) {
            console.log(`Skipping word #${newWord.number} "${newWord.english}" - already in active window`);
            currentNextIndex++;
          } else {
            currentNextIndex++;
          }
        }
        
        if (currentNextIndex >= currentAllWords.length) {
          console.log(`No more words to add. All ${currentAllWords.length} words have been processed.`);
        }
      });
      
      // Обновляем индекс следующего слова для добавления
      setNextWordIndexToAdd(currentNextIndex);
      
      console.log(`Active window updated: ${newActiveWords.length} words, next to add: ${currentNextIndex}`);
      return newActiveWords;
    }
    
    return updatedWords;
  };

  // Инициализация активного окна
  const initializeActiveWindow = (allWordsData: WordItem[]): WordItem[] => {
    // В режиме повторения возвращаем все выученные слова
    if (isRepeatMode) {
      return allWordsData.filter(word => word.progress.isLearned);
    }
    
    // В режиме изучения собираем первые ACTIVE_WORDS_COUNT НЕвыученных слов
    const newActive: WordItem[] = [];
    let scanIndex = 0;
    while (scanIndex < allWordsData.length && newActive.length < ACTIVE_WORDS_COUNT) {
      const candidate = allWordsData[scanIndex];
      if (!candidate.progress.isLearned) {
        newActive.push(candidate);
      }
      scanIndex++;
    }
    
    // Индекс следующего кандидата — это место, с которого будем подбирать новые слова дальше
    setNextWordIndexToAdd(scanIndex);
    
    console.log(`Initialized active window with ${newActive.length} words (unlearned only), next to add: ${scanIndex}`);
    return newActive;
  };

  // Инициализация данных
  useEffect(() => {
    console.log('🔄 LearnWordsScreen mounted/remounted. Loading data...');
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Загружаем слова из JSON
        const wordsFromJson = await loadWordsFromJson();
        
        if (wordsFromJson.length === 0) {
          console.log('No words found for this lesson and word list type');
          setWords([]);
          setLoading(false);
          return;
        }
        
        // Загружаем сохраненный прогресс
        const wordsWithProgress = await loadSavedProgress(wordsFromJson);
        
        console.log('Initialized words with progress:', wordsWithProgress.length);
        
        // Сохраняем полный список всех слов
        setAllWords(wordsWithProgress);
        
        // Инициализируем активное окно
        const activeWordsWindow = initializeActiveWindow(wordsWithProgress);
        
        // В режиме повторения показываем только выученные слова
        let finalWords = activeWordsWindow;
        if (isRepeatMode) {
          finalWords = wordsWithProgress.filter(word => word.progress.isLearned);
          console.log('Repeat mode: filtered to learned words:', finalWords.length);
        }
        
        setWords(finalWords);
        
        // Проверяем, есть ли слова для показа
        if (finalWords.length === 0) {
          setLoading(false);
          return;
        }
        
        // Пытаемся восстановить состояние сессии (по номеру слова в текущем окне)
        const sessionRestored = await loadSessionState(finalWords);
        
        if (!sessionRestored) {
          // Если сессия не восстановлена, начинаем с первого неизученного слова
          const firstUnlearnedIndex = wordsWithProgress.findIndex(w => !w.progress.isLearned);
          if (firstUnlearnedIndex !== -1) {
            setCurrentWordIndex(firstUnlearnedIndex);
            
            // Выбираем тип упражнения с меньшим прогрессом для первого слова
            const firstWord = wordsWithProgress[firstUnlearnedIndex];
            if (firstWord.progress.engToRusCorrect < firstWord.progress.rusToEngCorrect) {
              setExerciseType('eng-to-rus');
            } else if (firstWord.progress.rusToEngCorrect < firstWord.progress.engToRusCorrect) {
              setExerciseType('rus-to-eng');
            }
            // Если прогресс одинаковый, оставляем значение по умолчанию (eng-to-rus)
          }
          console.log('Starting new session from word index:', firstUnlearnedIndex);
          

        } else {
          console.log('Session restored successfully');
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, [lessonId, wordListType, language]);

  // Автосохранение при изменении прогресса
  useEffect(() => {
    if (words.length > 0 && !loading) {
      saveProgress(words);
      saveTrainingStats(words);
    }
  }, [words, loading]);

  // Автосохранение состояния сессии при изменениях
  useEffect(() => {
    if (!loading && words.length > 0) {
      saveSessionState();
    }
  }, [currentWordIndex, exerciseType, deferredWordsQueue, wordsShownSinceDefer, currentExerciseAttempts, loading]);

  // Очистка при выходе из компонента
  useEffect(() => {
    return () => {
      // Сохраняем состояние при выходе
      if (words.length > 0) {
        saveSessionState();
        saveTrainingStats(words);
      }
    };
  }, [words]);

  // Обработка завершения всех слов
  const handleAllWordsCompleted = async () => {
    await saveTrainingStats(words);
    await clearSessionState();
    const total = Array.isArray(allWords) ? allWords.length : 0;
    
    Alert.alert(
      t('learn.allWordsLearnedTitle'),
      t('learn.allWordsLearnedMessage', { total }),
      [{ text: t('common.ok'), onPress: () => navigation.navigate('LessonList') }]
    );
  };

  // Генерация вариантов ответов при смене слова или типа упражнения
  useEffect(() => {
    if (words.length > 0) {
      if (exerciseType === 'eng-to-rus') {
        const currentWord = words[currentWordIndex];
        if (currentWord && currentWord.id !== answerOptionsWordId) {
          const options = generateAnswerOptions(currentWord, words);
          setAnswerOptions(options);
          setAnswerOptionsWordId(currentWord.id); // Устанавливаем ID текущего слова
        }
      } else {
        // При переключении на RUS→ENG сбрасываем ID, чтобы при возврате генерировались новые варианты
        setAnswerOptionsWordId(null);
      }
    }
  }, [currentWordIndex, exerciseType, words, answerOptionsWordId]); // Добавили answerOptionsWordId в зависимости

  // Фокус на поле ввода для RUS→ENG
  useEffect(() => {
    if (exerciseType === 'rus-to-eng' && !showResult) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [exerciseType, currentWordIndex, showResult]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (words.length === 0) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {/* Header */}
          <View style={styles.navigationHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isRepeatMode ? t('words.repeat') : t('words.learn')}
              </Text>
            </View>
            <View style={styles.placeholderButton} />
          </View>
          
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Нет слов для изучения</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentWord = words[currentWordIndex];
  // Если по каким-то причинам индекс вышел за границы (например, после завершения) — показать завершение
  if (!currentWord) {
    // Если активное окно опустело, проверяем по всему уроку, что ВСЕ слова выучены,
    // и только тогда показываем завершение
    const allLearned = allWords.length > 0 && allWords.every(w => w.progress.isLearned);
    if (allLearned) {
      setTimeout(() => handleAllWordsCompleted(), 0);
      return null;
    }
    // Иначе безопасно переходим к началу окна и ждём следующего рендера
    if (words.length > 0) {
      setTimeout(() => setCurrentWordIndex(0), 0);
    }
    return null;
  }
  const learnedCount = allWords.filter(w => w.progress.isLearned).length; // Считаем по всем словам
  const totalWords = allWords.length; // Общее количество всех слов
  const activeWordsCount = words.length; // Количество слов в активном окне

  // Компонент ENG→RUS упражнения
  const renderEngToRusExercise = () => {
    return (
      <View style={styles.exerciseContainer}>
        {/* Английское слово с кнопкой аудио */}
        <View style={styles.questionContainer}>
          <Text style={styles.englishWordText}>{currentWord.english}</Text>
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() => playAudio(currentWord.english)}
          >
            <Ionicons name="volume-high" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Варианты ответов */}
        <View style={styles.optionsContainer}>
          {answerOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedAnswer === option.id && (
                  isCorrectAnswer 
                    ? styles.correctOption 
                    : styles.incorrectOption
                ),
                selectedAnswer === option.id && option.isCorrect && !isCorrectAnswer && styles.correctOption
              ]}
              onPress={() => handleAnswerSelect(option.id)}
              disabled={showResult}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Результат */}
        {showResult && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultText,
              { color: isCorrectAnswer ? '#10B981' : '#EF4444' }
            ]}>
              {isCorrectAnswer ? t('exam.correct') : t('exam.incorrect')}
            </Text>
            
            {!isCorrectAnswer && currentExerciseAttempts >= 3 && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerText}>
                  {t('exam.correctAnswer')}: {currentWord.translation}
                </Text>
              </View>
            )}
            
            {/* Кнопки действий */}
            <View style={styles.actionButtonsContainer}>
              {isCorrectAnswer ? (
                // При правильном ответе - кнопка "Далее"
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextWord}
                >
                  <Text style={styles.nextButtonText}>{t('learn.next')}</Text>
                </TouchableOpacity>
              ) : currentExerciseAttempts < 3 ? (
                // При неправильном ответе, если остались попытки - кнопка "Повторить"
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={retryCurrentExercise}
                  >
                    <Text style={styles.retryButtonText}>
                      {t('learn.retry')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={goToNextWord}
                  >
                    <Text style={styles.skipButtonText}>{t('learn.skip')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // При исчерпании попыток - только кнопка "Далее"
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextWord}
                >
                  <Text style={styles.nextButtonText}>{t('learn.next')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Компонент RUS→ENG упражнения
  const renderRusToEngExercise = () => {
    return (
      <View style={styles.rusToEngContainer}>
        {/* Русский перевод */}
        <View style={styles.questionContainer}>
          <Text style={styles.russianWordText}>{currentWord.translation}</Text>
        </View>

        {/* Поле для ввода */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('learn.enterEnglishWord')}</Text>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              inputSubmitted && (
                isCorrectAnswer 
                  ? styles.correctInput 
                  : styles.incorrectInput
              )
            ]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Введите перевод..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!inputSubmitted}
            onSubmitEditing={checkRusToEngAnswer}
            returnKeyType="done"
          />
        </View>

        {/* Кнопка проверки */}
        {!inputSubmitted && (
          <TouchableOpacity
            style={[
              styles.checkButton,
              userInput.trim() === '' && styles.disabledButton
            ]}
            onPress={checkRusToEngAnswer}
            disabled={userInput.trim() === ''}
          >
            <Text style={styles.checkButtonText}>{t('exam.check')}</Text>
          </TouchableOpacity>
        )}

        {/* Результат */}
        {showResult && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultText,
              { color: isCorrectAnswer ? '#10B981' : '#EF4444' }
            ]}>
              {isCorrectAnswer ? t('exam.correct') : t('exam.incorrect')}
            </Text>
            
            {!isCorrectAnswer && currentExerciseAttempts >= 3 && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerText}>
                  {t('exam.correctAnswer')}: {currentWord.english}
                </Text>
              </View>
            )}
            
            {/* Кнопки действий */}
            <View style={styles.actionButtonsContainer}>
              {isCorrectAnswer ? (
                // При правильном ответе - кнопка "Далее"
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextWord}
                >
                  <Text style={styles.nextButtonText}>{t('learn.next')}</Text>
                </TouchableOpacity>
              ) : currentExerciseAttempts < 3 ? (
                // При неправильном ответе, если остались попытки - кнопка "Повторить"
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={retryCurrentExercise}
                  >
                    <Text style={styles.retryButtonText}>
                      {t('learn.retry')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={goToNextWord}
                  >
                    <Text style={styles.skipButtonText}>{t('learn.skip')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // При исчерпании попыток - только кнопка "Далее"
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={goToNextWord}
                >
                  <Text style={styles.nextButtonText}>{t('learn.next')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isRepeatMode ? t('words.repeat') : t('words.learn')}
            </Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfoContainer}>
          <Text style={styles.progressInfoText}>
            {t('learn.learnedCounter', { learned: learnedCount, total: totalWords })}
          </Text>
        </View>

        {/* Word Progress */}
        <View style={styles.wordProgressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={
                  currentWord.progress.isLearned 
                    ? ['#10B981', '#059669'] 
                    : currentWord.progress.isDeferred 
                      ? ['#F59E0B', '#D97706']
                      : ['#3B82F6', '#2563EB']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${currentWord.progress.totalProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentWord.progress.totalProgress}%
            </Text>
          </View>
          

        </View>

        {/* Exercise Type Indicator */}
        <View style={styles.exerciseTypeContainer}>
          {/* Attempt Indicator - всегда показываем */}
          <View style={styles.attemptIndicator}>
            <View style={styles.attemptDots}>
              {[1, 2, 3].map(attempt => (
                <View
                  key={attempt}
                  style={[
                    styles.attemptDot,
                    attempt <= currentExerciseAttempts && styles.attemptDotUsed
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.contentContainer}>
            {exerciseType === 'eng-to-rus' ? renderEngToRusExercise() : renderRusToEngExercise()}
          </ScrollView>
        </KeyboardAvoidingView>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 44,
    zIndex: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  placeholderButton: {
    width: 44,
  },
  resetButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfoContainer: {
    padding: 12,
    alignItems: 'center',
  },
  progressInfoText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 0,
  },
  progressInfoSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  deferredInfoText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  wordProgressContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  exerciseTypeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseTypeText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  attemptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8, // Увеличено с 4
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16, // Увеличено с 12
    paddingVertical: 8, // Увеличено с 4
    paddingHorizontal: 12, // Увеличено с 8
  },
  attemptText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
    marginRight: 8,
  },
  attemptDots: {
    flexDirection: 'row',
    gap: 8, // Увеличено с 4
  },
  attemptDot: {
    width: 12, // Увеличено с 8
    height: 12, // Увеличено с 8
    borderRadius: 6, // Увеличено с 4
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  attemptDotUsed: {
    backgroundColor: '#EF4444',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
    justifyContent: 'center',
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  rusToEngContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align content to the top
    paddingTop: 20, // Add some padding to the top
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  englishWordText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  russianWordText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  audioButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
  },
  optionButton: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    minWidth: 120,
    maxWidth: 160,
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  incorrectOption: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 12,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  correctInput: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  incorrectInput: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  checkButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    opacity: 0.6,
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  activeBadge: {
    borderColor: '#3B82F6',
  },
  deferredBadge: {
    borderColor: '#F59E0B',
  },
  attempsBadge: {
    borderColor: '#EF4444',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  correctAnswerContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 16,
    alignItems: 'center',
  },
  noLearnedWordsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noLearnedWordsTitle: {
    fontSize: 20,
    color: '#9CA3AF',
    marginTop: 20,
    textAlign: 'center',
  },
  noLearnedWordsText: {
    fontSize: 16,
    color: '#D1D5DB',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  goToLearnButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  goToLearnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LearnWordsScreen; 