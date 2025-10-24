import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../localization';
import { lessonService } from '../../services/lessonService';

type LessonDetailScreenNavigationProp = NativeStackNavigationProp<LessonsStackParamList, 'LessonDetail'>;
type LessonDetailScreenRouteProp = RouteProp<LessonsStackParamList, 'LessonDetail'>;

type LessonActivityScreen = 'Description' | 'Words' | 'IrregularVerbs' | 'PhrasalVerbs' | 'PastParticiple' | 'Sentences' | 'Exam';

interface LessonStats {
  wordCount: number;
  completedWords: number;
  sentenceCount: number;
  completedSentences: number;
  totalItems: number;
  completedItems: number;
  descriptionViewed: boolean;
}

const getIrregularVerbsTranslation = (language: string): string => {
  switch (language) {
    case 'russian':
      return 'Неправильные глаголы';
    case 'spanish':
      return 'Verbos Irregulares';
    case 'french':
      return 'Verbes Irréguliers';
    case 'german':
      return 'Unregelmäßige Verben';
    default:
      return 'Irregular Verbs';
  }
};

const getPhrasalVerbsTranslation = (language: string): string => {
  switch (language) {
    case 'russian':
      return 'Фразовые глаголы';
    case 'spanish':
      return 'Verbos Frasales';
    case 'french':
      return 'Verbes à Particule';
    case 'german':
      return 'Phrasal Verben';
    default:
      return 'Phrasal Verbs';
  }
};

const getPastParticipleTranslation = (language: string): string => {
  switch (language) {
    case 'russian':
      return 'Третья форма глагола';
    case 'spanish':
      return 'Participio Pasado';
    case 'french':
      return 'Participe Passé';
    case 'german':
      return 'Partizip Perfekt';
    default:
      return 'Past Participle';
  }
};

const LessonDetailScreen = () => {
  const navigation = useNavigation<LessonDetailScreenNavigationProp>();
  const route = useRoute<LessonDetailScreenRouteProp>();
  const { lessonId } = route.params;

  const [lessonProgress, setLessonProgress] = useState<number>(0);
  const [isLessonComplete, setIsLessonComplete] = useState<boolean>(false);
  const [nextLessonUnlocked, setNextLessonUnlocked] = useState<boolean>(false);
  const [lessonStats, setLessonStats] = useState<LessonStats>({
    wordCount: 0,
    completedWords: 0,
    sentenceCount: 0,
    completedSentences: 0,
    totalItems: 0,
    completedItems: 0,
    descriptionViewed: false
  });

  const { t, language } = useTranslation();

  /**
   * Returns lesson stats object (instead of setting them immediately).
   */
  const getLessonStats = async (): Promise<LessonStats> => {
    try {
      // Получение числовой версии ID урока
      const numericLessonId = parseInt(lessonId.toString(), 10);
      
      // Получение данных словаря для текущего урока
      const vocabularyData = await lessonService.getLessonVocabulary(numericLessonId);
      
      // Получение данных о предложениях
      const sentencesData = await lessonService.getLessonSentences(numericLessonId);
      
      // Вычисление общего количества слов и предложений на основе ID последних элементов
      let maxWordId = 0;
      let maxSentenceId = 0;
      
      // Находим максимальный ID слова (учитывая оба списка)
      if (vocabularyData && vocabularyData.allWords && vocabularyData.allWords.length > 0) {
        // Сортируем массив по номеру/id и берем последний элемент
        const sortedWords = [...vocabularyData.allWords].sort((a, b) => a.number - b.number);
        maxWordId = sortedWords[sortedWords.length - 1].number;
      }
      
      // Находим максимальный ID предложения
      if (sentencesData && Array.isArray(sentencesData) && sentencesData.length > 0) {
        // Сортируем массив по номеру/id и берем последний элемент
        const sortedSentences = [...sentencesData].sort((a, b) => a.id - b.id);
        maxSentenceId = sortedSentences[sortedSentences.length - 1].id;
      }
      
      // Используем эти значения как количество элементов
      const wordCount = maxWordId;
      const sentenceCount = maxSentenceId;
      
      // Get repetition data
      const wordRepKey = `wordRepetitions_lesson${lessonId}`;
      const sentenceKey = `sentenceData_lesson${lessonId}`;
      
      const savedWordReps = await AsyncStorage.getItem(wordRepKey);
      const savedSentenceReps = await AsyncStorage.getItem(sentenceKey);
      
      const wordReps = savedWordReps ? JSON.parse(savedWordReps) : {};
      const sentenceReps = savedSentenceReps ? JSON.parse(savedSentenceReps) : {};
      
      // Get target repetitions
      const wordTargetStr = await AsyncStorage.getItem(`targetRepetitions_lesson${lessonId}`);
      const sentenceTargetStr = await AsyncStorage.getItem(`sentenceRepetitions_lesson${lessonId}`);
      
      const wordTarget = wordTargetStr ? parseInt(wordTargetStr) : 5;
      const sentenceTarget = sentenceTargetStr ? parseInt(sentenceTargetStr) : 5;
      
      // Count completed items in each category
      let completedWords = 0;
      let completedSentences = 0;
      
      Object.values(wordReps).forEach((item: any) => {
        const reps = item?.repetitions || 0;
        if (reps >= wordTarget) completedWords++;
      });
      
      Object.values(sentenceReps).forEach((item: any) => {
        const reps = item?.repetitions || 0;
        if (reps >= sentenceTarget) completedSentences++;
      });
      
      // Check if description was viewed
      const descriptionViewedKey = `description_viewed_lesson${lessonId}`;
      const descriptionViewed = (await AsyncStorage.getItem(descriptionViewedKey)) === 'true';
      
      // Рассчитываем общее количество элементов и завершенных элементов
      const totalItems = wordCount + sentenceCount;
      const completedItems = completedWords + completedSentences;

      // Для отладки
      console.log(`Lesson ${numericLessonId} stats:`, { 
        wordCount, 
        sentenceCount, 
        totalItems, 
        maxWordId, 
        maxSentenceId 
      });

      return {
        wordCount,
        completedWords,
        sentenceCount,
        completedSentences,
        totalItems,
        completedItems,
        descriptionViewed
      };
    } catch (error) {
      console.error('Error getting lesson stats:', error);
      // Return a "safe" default in case of error
      return {
        wordCount: 0,
        completedWords: 0,
        sentenceCount: 0,
        completedSentences: 0,
        totalItems: 0,
        completedItems: 0,
        descriptionViewed: false
      };
    }
  };

  /**
   * Check if next lesson should be unlocked; accepts stats to avoid stale data.
   */
  const checkNextLesson = async (stats?: LessonStats) => {
    try {
      // If no stats were provided, fetch them
      if (!stats) {
        stats = await getLessonStats();
      }
      const nextLessonId = lessonId + 1;
      const nextLessonKey = `next_lesson_${lessonId}_unlocked`;
      
      // Проверяем, завершен ли экзамен с > 90% успехом
      const examProgress = await AsyncStorage.getItem(`examProgress_lesson${lessonId}`);
      const examProgressValue = examProgress ? parseInt(examProgress) : 0;
      const isExamComplete = examProgressValue >= 90;
      
      // Strict check if the current lesson is truly completed
      const allWordsCompleted = stats.wordCount === stats.completedWords;
      const allSentencesCompleted = stats.sentenceCount === stats.completedSentences;
      
      const isLessonReallyComplete =
        (stats.totalItems > 0 && 
        allWordsCompleted && 
        allSentencesCompleted) || // Для первого урока не проверяем тексты
        isExamComplete; // Добавляем проверку экзамена
      
      if (isLessonReallyComplete) {
        // Unlock only the immediately following lesson
        await AsyncStorage.setItem(nextLessonKey, 'true');
        setNextLessonUnlocked(true);

        // Отмечаем урок как завершенный, но НЕ устанавливаем прогресс на 100%
        await AsyncStorage.setItem(`lesson_${lessonId}_completed`, 'true');

        // Reset next lesson progress to 0%
        await AsyncStorage.setItem(`lessonProgress_${nextLessonId}`, '0');
      } else {
        // Check if the next lesson was previously unlocked
        const isUnlocked = (await AsyncStorage.getItem(nextLessonKey)) === 'true';
        setNextLessonUnlocked(isUnlocked);
      }
    } catch (error) {
      console.error('Error checking next lesson:', error);
    }
  };

  /**
   * Fetches lesson progress, sets correct progress in state,
   * and checks for completion/unlock logic.
   */
  const fetchLessonProgress = async () => {
    try {
      // Get the fresh stats from AsyncStorage
      const stats = await getLessonStats();
      // Update state with the fresh stats
      setLessonStats(stats);
      
      // Вызываем расчет прогресса урока на основе экзамена
      await calculateLessonProgress();
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  /**
   * Handle "Go to Next Lesson" button press.
   * Re-checks completion strictly and unlocks next lesson if truly complete.
   */
  const handleNextLesson = async () => {
    try {
      // Get fresh stats to be sure everything is complete
      const stats = await getLessonStats();
      
      // Проверяем прогресс экзамена
      const examProgress = await AsyncStorage.getItem(`examProgress_lesson${lessonId}`);
      const examProgressValue = examProgress ? parseInt(examProgress) : 0;
      
      console.log(`Lesson ${lessonId} exam progress: ${examProgressValue}%`);
      
      // Проверяем, что это последний урок (урок 18)
      const isLastLesson = lessonId === 18;
      
      if (examProgressValue >= 90) { // Проверяем, что прогресс экзамена >= 90%
        // Если это последний урок, то просто отмечаем его как завершенный и не переходим дальше
        if (isLastLesson) {
          // Отмечаем урок как завершенный
          await AsyncStorage.setItem(`lesson_${lessonId}_completed`, 'true');
          
          // Обновляем UI
          fetchLessonProgress();
          return;
        }
        
        const nextLessonId = lessonId + 1;
        
        // Lock all other future lessons, and unlock only the immediate next
        const keys = await AsyncStorage.getAllKeys();
        const unlockKeys = keys.filter(key => key.startsWith('next_lesson_') && key.endsWith('_unlocked'));
        for (const key of unlockKeys) {
          if (key !== `next_lesson_${lessonId}_unlocked`) {
            await AsyncStorage.setItem(key, 'false');
          }
        }

        // Unlock only next
        await AsyncStorage.setItem(`next_lesson_${lessonId}_unlocked`, 'true');
        
        // Reset progress for the next lesson
        await AsyncStorage.setItem(`lessonProgress_${nextLessonId}`, '0');

        // Отмечаем урок как завершенный, НО НЕ МЕНЯЕМ ЕГО РЕАЛЬНЫЙ ПРОГРЕСС
        await AsyncStorage.setItem(`lesson_${lessonId}_completed`, 'true');

        // Optionally reset progress for all subsequent lessons
        for (let i = nextLessonId + 1; i <= 18; i++) {
          await AsyncStorage.setItem(`lessonProgress_${i}`, '0');
        }

        navigation.navigate('LessonDetail', { lessonId: nextLessonId });
      } else {
        // Показываем ошибку если прогресс экзамена < 90%
        Alert.alert(
          'Cannot proceed',
          `You need to complete the Exam with at least 90% score. Current score: ${examProgressValue}%.`
        );

        // Refresh UI
        fetchLessonProgress();
      }
    } catch (error) {
      console.error('Error navigating to next lesson:', error);
      Alert.alert('Error', 'Could not navigate to the next lesson. Please try again.');
    }
  };

  // Модифицируем расчет прогресса урока, чтобы учитывать прогресс экзамена
  const calculateLessonProgress = async () => {
    try {
      // Получаем прогресс экзамена
      const examProgress = await AsyncStorage.getItem(`examProgress_lesson${lessonId}`);
      const examProgressValue = examProgress ? parseInt(examProgress) : 0;
      
      // ВАЖНО: прогресс урока всегда зеркалит прогресс экзамена
      await AsyncStorage.setItem(`lessonProgress_${lessonId}`, examProgressValue.toString());
      setLessonProgress(examProgressValue);
      setIsLessonComplete(examProgressValue >= 90); // Урок считается завершенным при достижении 90% в экзамене
      
      if (examProgressValue >= 90) {
        // Разблокируем следующий урок, если прогресс экзамена >= 90%
        await AsyncStorage.setItem(`next_lesson_${lessonId}_unlocked`, 'true');
        // Отмечаем урок как завершенный
        await AsyncStorage.setItem(`lesson_${lessonId}_completed`, 'true');
        setNextLessonUnlocked(true);
      }
    } catch (error) {
      console.error('Error calculating lesson progress:', error);
    }
  };

  // Load progress when the screen is focused
  useEffect(() => {
    fetchLessonProgress();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLessonProgress();
    });
    
    return () => {
      unsubscribe();
    };
  }, [navigation, lessonId]);

  const renderProgressBar = () => {
    return (
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#3B82F6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${lessonProgress}%` }]}
        />
      </View>
    );
  };

  const activities = [
    { name: 'description', screen: 'Description' as LessonActivityScreen, icon: 'information-circle-outline' as const, iconBackgroundColor: '#007AFF' },
    { name: 'words', screen: 'Words' as LessonActivityScreen, icon: 'list-outline' as const, iconBackgroundColor: '#34C759' },
    ...(lessonId === 1 ? [{ name: 'irregularVerbs', screen: 'IrregularVerbs' as LessonActivityScreen, icon: 'swap-horizontal-outline' as const, iconBackgroundColor: '#AF52DE' }] : []),
    ...(lessonId === 16 ? [{ name: 'phrasalVerbs', screen: 'PhrasalVerbs' as LessonActivityScreen, icon: 'extension-puzzle-outline' as const, iconBackgroundColor: '#FF9500' }] : []),
    ...(lessonId === 14 ? [{ name: 'pastParticiple', screen: 'PastParticiple' as LessonActivityScreen, icon: 'checkmark-done-circle-outline' as const, iconBackgroundColor: '#5856D6' }] : []),
    ...(lessonId !== 18 ? [{ name: 'sentences', screen: 'Sentences' as LessonActivityScreen, icon: 'chatbubbles-outline' as const, iconBackgroundColor: '#5AC8FA' }] : []),
    { name: 'exam', screen: 'Exam' as LessonActivityScreen, icon: 'school-outline' as const, iconBackgroundColor: '#8E8E93' },
  ] as const;

  // Создаём функцию для типизированной навигации
  const navigateToLessonActivity = (screen: string, lessonId: number) => {
    // Проверяем, просмотрено ли описание
    if (!lessonStats.descriptionViewed && screen !== 'Description') {
      Alert.alert(
        t('lessons.openDescriptionFirst'),
        '',
        [{ text: 'OK' }]
      );
      return;
    }

    switch (screen) {
      case 'Description':
        navigation.navigate('Description', { 
          lessonId,
          onDescriptionViewed: async () => {
            // Обновляем состояние сразу при открытии Description
            setLessonStats(prev => ({ ...prev, descriptionViewed: true }));
            // Перезагружаем статистику
            const stats = await getLessonStats();
            setLessonStats(stats);
          }
        });
        break;
      case 'Words':
        navigation.navigate('Words', { 
          lessonId,
          wordListType: 'firstList' // Explicitly set to firstList for regular words
        });
        break;
      case 'IrregularVerbs':
        navigation.navigate('Words', { 
          lessonId, 
          wordListType: 'secondList' 
        });
        break;
      case 'PhrasalVerbs':
        navigation.navigate('Words', { 
          lessonId, 
          wordListType: 'secondList' 
        });
        break;
      case 'PastParticiple':
        navigation.navigate('Words', { 
          lessonId, 
          wordListType: 'secondList' 
        });
        break;
      case 'Sentences':
        navigation.navigate('Sentences', { lessonId });
        break;
      case 'Exam':
        navigation.navigate('Exam', { lessonId });
        break;
      default:
        console.warn(`Unknown screen: ${screen}`);
    }
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
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {t('lessons.lessonTitle')} {lessonId}
            </Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.progressSection}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>
                {t('lessons.completedItems')}: {lessonStats.completedItems}/{lessonStats.totalItems}
              </Text>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('lessons.words')}:</Text>
                <Text style={styles.statValue}>
                  {lessonStats.completedWords}/{lessonStats.wordCount}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('lessons.sentences')}:</Text>
                <Text style={styles.statValue}>
                  {lessonStats.completedSentences}/{lessonStats.sentenceCount}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{t('lessons.description')}:</Text>
                <Text style={styles.statValue}>
                  {lessonStats.descriptionViewed ? t('lessons.viewed') : t('lessons.notViewed')}
                </Text>
              </View>
            </View>
          </View>
          
          {isLessonComplete && (
            <View style={styles.completedSection}>
              <Text style={styles.completedText}>
                {t('lessons.lessonCompleted', { lessonId })}
              </Text>
            </View>
          )}
          
          <Text style={styles.subtitle}>{t('lessons.chooseActivity')}:</Text>
          
          {activities.map((activity) => {
            const isLocked = !lessonStats.descriptionViewed && activity.name !== 'description';
            
            if (Platform.OS === 'android') {
              return (
                <View
                  key={activity.screen}
                  style={[
                    styles.activityCardAndroidShadow,
                    isLocked && styles.lockedCardShadow
                  ]}
                >
                  <TouchableOpacity
                    style={styles.activityCardAndroidPressable}
                    activeOpacity={isLocked ? 1 : 0.8}
                    onPress={() => navigateToLessonActivity(activity.screen, lessonId)}
                  >
                    <LinearGradient
                      colors={isLocked ? ['#374151', '#1F2937'] : ['#581C87', '#111827', '#1F2937']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activityCardAndroidInner}
                    >
                      <View style={[styles.activityContentAndroid, isLocked && styles.lockedContent]}>
                        <View style={[styles.iconWrapper, { backgroundColor: isLocked ? '#6B7280' : activity.iconBackgroundColor }]}>
                          <Ionicons name={activity.icon} size={24} color={isLocked ? '#9CA3AF' : '#fff'} />
                        </View>
                        <View style={styles.activityTextContainer}>
                          <Text style={[styles.activityButtonTextAndroid, isLocked && styles.lockedText]}>
                          {activity.name === 'exam'
                            ? t('lessons.exam')
                            : activity.name === 'irregularVerbs'
                              ? t('words.irregularVerbsSection')
                              : activity.name === 'phrasalVerbs'
                                ? t('words.phrasalVerbsSection')
                                : activity.name === 'pastParticiple'
                                  ? t('words.pastParticipleSection')
                                  : t(`lessons.${activity.name.toLowerCase()}`)}
                        </Text>
                        {activity.name === 'exam' && (
                          <View style={styles.examProgressContainer}>
                            <View style={styles.examProgressBarContainer}>
                              <LinearGradient
                                colors={['#3B82F6', '#06B6D4']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.examProgressBar, { width: `${lessonProgress}%` }]}
                              />
                            </View>
                            <Text style={styles.examProgressText}>{lessonProgress}%</Text>
                          </View>
                        )}
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            }
            // iOS: keep as is
            return (
              <TouchableOpacity
                key={activity.screen}
                style={[
                  styles.activityButton,
                  isLocked && styles.lockedButton
                ]}
                activeOpacity={isLocked ? 1 : 0.7}
                onPress={() => navigateToLessonActivity(activity.screen, lessonId)}
              >
                <View style={[styles.activityContent, isLocked && styles.lockedContent]}>
                  <View style={[styles.iconWrapper, { backgroundColor: isLocked ? '#6B7280' : activity.iconBackgroundColor }]}>
                    <Ionicons name={activity.icon} size={24} color={isLocked ? '#9CA3AF' : '#fff'} />
                  </View>
                  <View style={styles.activityTextContainer}>
                    <Text style={[styles.activityButtonText, isLocked && styles.lockedText]}>
                  {activity.name === 'exam'
                    ? t('lessons.exam')
                    : activity.name === 'irregularVerbs'
                      ? t('words.irregularVerbsSection')
                      : activity.name === 'phrasalVerbs'
                        ? t('words.phrasalVerbsSection')
                        : activity.name === 'pastParticiple'
                          ? t('words.pastParticipleSection')
                          : t(`lessons.${activity.name.toLowerCase()}`)}
                </Text>
                {activity.name === 'exam' && (
                  <View style={styles.examProgressContainer}>
                    <View style={styles.examProgressBarContainer}>
                      <LinearGradient
                        colors={['#3B82F6', '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.examProgressBar, { width: `${lessonProgress}%` }]}
                      />
                    </View>
                    <Text style={styles.examProgressText}>{lessonProgress}%</Text>
                  </View>
                )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    zIndex: 2,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(209, 213, 219, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statsContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  completedSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: 'white',
  },
  activityButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  examProgressContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examProgressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(209, 213, 219, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  examProgressBar: {
    height: '100%',
    borderRadius: 5,
  },
  examProgressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  // --- Android styles for activity cards ---
  activityCardAndroidShadow: {
    borderRadius: 20,
    marginBottom: 14,
    elevation: 8,
  },
  activityCardAndroidPressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityCardAndroidInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  activityContentAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  activityButtonTextAndroid: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  lockedButton: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  lockedCardShadow: {
    elevation: 2,
  },
  lockedContent: {
    opacity: 0.5,
  },
  lockedText: {
    color: '#9CA3AF',
  },
});

export default LessonDetailScreen;
