import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Superwall removed. Use internal PaywallFlow only.
import { useTranslation } from '../../localization';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../../contexts/PremiumContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import { lessonService } from '../../services/lessonService';

type LessonActivity = {
  id: string;
  title: string;
  icon: string;
  progress: number;
  unlocked: boolean;
  screen: keyof LessonsStackParamList;
  params?: any;
};

const LessonListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<LessonsStackParamList, 'LessonList'>>();
  const { t, language } = useTranslation();
  const { isPro, setPro, isLoading } = usePremium();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  // Плавное появление контента экрана
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(8)).current;
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 220, useNativeDriver: true })
    ]).start();
  };

  // Состояние уроков (с прогрессом)
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonActivities, setLessonActivities] = useState<{[lessonId: number]: LessonActivity[]}>({});
  
  // State for tracking viewed activities
  const [viewedActivities, setViewedActivities] = useState<{[key: string]: boolean}>({});
  
  // State for tracking collapsed lessons
  const [collapsedLessons, setCollapsedLessons] = useState<{[lessonId: number]: boolean}>({});
  
  // Animation refs for pulsing
  const pulseAnims = useRef<{[key: string]: Animated.Value}>({}).current;
  // Отключаем пульсацию кнопок активностей
  const ENABLE_ACTIVITY_PULSE = false;

  // Helper для глубокого сравнения массивов уроков (по ключевым полям)
  const lessonsEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const la = a[i];
      const lb = b[i];
      if (la.id !== lb.id || la.progress !== lb.progress || la.unlocked !== lb.unlocked || la.isCompleted !== lb.isCompleted) {
        return false;
      }
    }
    return true;
  };

  // Load viewed activities state
  const loadViewedActivities = async () => {
    try {
      const saved = await AsyncStorage.getItem('viewedActivities');
      if (saved) {
        setViewedActivities(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading viewed activities:', error);
    }
  };

  // Save viewed activity
  const markActivityAsViewed = async (lessonId: number, activityId: string) => {
    const key = `${lessonId}_${activityId}`;
    const newViewedActivities = { ...viewedActivities, [key]: true };
    setViewedActivities(newViewedActivities);
    try {
      await AsyncStorage.setItem('viewedActivities', JSON.stringify(newViewedActivities));
    } catch (error) {
      console.error('Error saving viewed activities:', error);
    }
  };

  // Загружаем активности для урока
  const loadLessonActivities = async (lessonId: number): Promise<LessonActivity[]> => {
    try {
      // Загружаем прогресс слов и предложений
      const wordsProgress = await AsyncStorage.getItem(`lesson_${lessonId}_words_progress`);
      const sentencesProgress = await AsyncStorage.getItem(`lesson_${lessonId}_sentences_progress`);
      const examProgress = await AsyncStorage.getItem(`lesson_${lessonId}_exam_progress`);
      const descriptionViewed = await AsyncStorage.getItem(`lesson_${lessonId}_description_viewed`);
      
      // Базовые активности для всех уроков
      const activities: LessonActivity[] = [
        {
          id: 'description',
          title: t('lessons.description'),
          icon: 'information-circle',
          progress: descriptionViewed === 'true' ? 100 : 0,
          unlocked: true,
          screen: 'Description',
          params: { lessonId }
        },
        {
          id: 'words',
          title: t('lessons.words'),
          icon: 'list',
          progress: wordsProgress ? parseInt(wordsProgress, 10) : 0,
          unlocked: true,
          screen: 'Words',
          params: { lessonId }
        }
      ];

      // Добавляем специальные разделы для конкретных уроков
      if (lessonId === 1) {
        activities.push({
          id: 'irregular-verbs',
          title: t('words.irregularVerbsSection'),
          icon: 'refresh',
          progress: 0,
          unlocked: true,
          screen: 'Words',
          params: { lessonId, wordListType: 'secondList' }
        });
      } else if (lessonId === 14) {
        activities.push({
          id: 'third-form',
          title: t('words.pastParticipleSection'),
          icon: 'library',
          progress: 0,
          unlocked: true,
          screen: 'Words',
          params: { lessonId, wordListType: 'secondList' }
        });
      } else if (lessonId === 16) {
        activities.push({
          id: 'phrasal-verbs',
          title: t('words.phrasalVerbsSection'),
          icon: 'link',
          progress: 0,
          unlocked: true,
          screen: 'Words',
          params: { lessonId, wordListType: 'secondList' }
        });
      }

      // Добавляем "Продолжить урок" в конце (кроме урока 18)
      if (lessonId !== 18) {
        activities.push({
          id: 'exam',
          title: t('lessons.exam'),
          icon: 'school',
          progress: examProgress ? parseInt(examProgress, 10) : 0,
          unlocked: true,
          screen: 'Exam',
          params: { lessonId }
        });
      }

      return activities;
    } catch (error) {
      console.error('Error loading lesson activities:', error);
      return [];
    }
  };

  // Загружаем уроки и прогресс
  useEffect(() => {
    if (isLoading) return; // Ждём определения статуса подписки

    const loadData = async () => {
      try {
        const newLessons = Array.from({ length: 18 }, (_, i) => ({
          id: i + 1,
          title: `${t('lessons.lessonTitle')} ${i + 1}`,
          progress: 0,
          // Реальная логика разблокировки устанавливается ниже
          unlocked: i === 0,
          isCompleted: false,
        }));

        // Попытка загрузить офлайн-кэш разблокированных уроков
        let cachedUnlocked: Record<string, boolean> | null = null;
        try {
          const raw = await AsyncStorage.getItem('lastUnlockedLessons');
          if (raw) cachedUnlocked = JSON.parse(raw);
        } catch {}

        for (let i = 0; i < newLessons.length; i++) {
          const lessonId = i + 1;
          const savedProgress = await AsyncStorage.getItem(`lessonProgress_${lessonId}`);
          const isCompleted = await AsyncStorage.getItem(`lesson_${lessonId}_completed`);

          if (savedProgress) {
            const progress = parseInt(savedProgress, 10);
            if (!isNaN(progress)) newLessons[i].progress = progress;
          }

          // Специальная логика прогресса для урока 18: только по выученным словам
          if (lessonId === 18) {
            try {
              const vocabulary = await lessonService.getLessonVocabulary(18);
              const totalWords = (vocabulary?.allWords || []).length;
              let learnedCount = 0;
              if (totalWords > 0) {
                const progressFirst = await AsyncStorage.getItem('learnWordsProgress_lesson18_firstList');
                const progressSecond = await AsyncStorage.getItem('learnWordsProgress_lesson18_secondList');
                const merged: any = {};
                if (progressFirst) Object.assign(merged, JSON.parse(progressFirst));
                if (progressSecond) Object.assign(merged, JSON.parse(progressSecond));
                learnedCount = Object.values(merged).filter((p: any) => p && p.totalProgress >= 100).length;
                const pct = Math.min(100, Math.round((learnedCount / totalWords) * 100));
                newLessons[i].progress = pct;
              }
            } catch (e) {
              console.warn('Lesson 18 progress calc failed:', e);
            }
          }

          newLessons[i].isCompleted = isCompleted === 'true';

          // Разблокировка уроков: первый всегда открыт; остальные — только при активной подписке и 90%+ в предыдущем
          if (lessonId === 1) {
            newLessons[i].unlocked = true;
          } else if (typeof navigator !== 'undefined' && (navigator as any).onLine === false && cachedUnlocked) {
            // Офлайн: используем последнее сохранённое состояние
            newLessons[i].unlocked = Boolean(cachedUnlocked[String(lessonId)]);
          } else if (!isPro) {
            newLessons[i].unlocked = false;
          } else {
            const prevCompleted = await AsyncStorage.getItem(`lesson_${lessonId - 1}_completed`);
            newLessons[i].unlocked = prevCompleted === 'true';
          }
        }

        // Сравниваем и обновляем состояние только при изменениях
        setLessons(prev => (lessonsEqual(prev, newLessons) ? prev : newLessons));

        // Сохраняем текущее состояние разблокировки для офлайн-старта
        try {
          const map: Record<string, boolean> = {};
          newLessons.forEach(l => { map[String(l.id)] = Boolean(l.unlocked); });
          await AsyncStorage.setItem('lastUnlockedLessons', JSON.stringify(map));
        } catch (e) {
          console.warn('Failed to cache lastUnlockedLessons', e);
        }

        // Загружаем активности для всех разблокированных уроков
        const activitiesByLesson: { [lessonId: number]: LessonActivity[] } = {};
        for (const lesson of newLessons) {
          if (lesson.unlocked) {
            activitiesByLesson[lesson.id] = await loadLessonActivities(lesson.id);
        }
        }
        setLessonActivities(activitiesByLesson);
      } catch (error) {
        console.error('Error loading lessons and progress:', error);
      }
    };

    loadData();

    const unsubscribe = navigation.addListener('focus', loadData);
    return () => unsubscribe();
  }, [navigation, t, language, isPro, isLoading]);

  // Загружаем отметки просмотренных активностей один раз
  useEffect(() => {
    loadViewedActivities();
  }, []);

  // Избегаем двойной анимации со сплэшем: при первом открытии экрана появление без screen‑fade,
  // при последующих фокусах — обычная короткая анимация
  // На экране "Уроки" не делаем дополнительный fade-in: он уже был после сплэша (App-level).
  // Всегда показываем контент сразу без анимации, чтобы исключить двойной эффект.
  useEffect(() => {
    contentOpacity.setValue(1);
    contentTranslateY.setValue(0);
  }, []);
  
  // Start pulse animations for activities (отключено)
  useEffect(() => {
    if (!ENABLE_ACTIVITY_PULSE) return;
    // Clear all animations first
    Object.keys(pulseAnims).forEach(key => {
      if (pulseAnims[key]) {
        pulseAnims[key].stopAnimation();
      }
    });
    lessons.forEach(lesson => {
      if (lesson.unlocked && lessonActivities[lesson.id]) {
        lessonActivities[lesson.id].forEach((activity, index) => {
          const key = `${lesson.id}_${activity.id}`;
          if (shouldActivityPulse(lesson.id, activity, index)) {
            const anim = createPulseAnimation(key);
            anim.start();
          }
        });
      }
    });
  }, [lessons, lessonActivities, viewedActivities]);

  // Автоматическое сворачивание завершенных уроков
  useEffect(() => {
    if (!lessons.length) return;

    const updatedCollapsedLessons: {[lessonId: number]: boolean} = {};
    
    lessons.forEach(lesson => {
      // Автоматически сворачиваем уроки с прогрессом ≥90%
      if (lesson.progress >= 90) {
        updatedCollapsedLessons[lesson.id] = true;
      }
    });

    // Обновляем состояние только если есть изменения
    setCollapsedLessons(prev => {
      const hasChanges = Object.keys(updatedCollapsedLessons).some(
        lessonId => prev[parseInt(lessonId)] !== updatedCollapsedLessons[parseInt(lessonId)]
      );
      
      if (hasChanges) {
        console.log('🔄 Auto-collapsing completed lessons:', updatedCollapsedLessons);
        return { ...prev, ...updatedCollapsedLessons };
      }
      
      return prev;
    });
  }, [lessons]);

  // Create pulse animation for activity
  const createPulseAnimation = (key: string) => {
    if (!pulseAnims[key]) {
      pulseAnims[key] = new Animated.Value(1);
    }
    
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnims[key], {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnims[key], {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    return anim;
  };

  // Получить цвет активности по ID
  const getActivityColor = (activityId: string): string => {
    switch (activityId) {
      case 'description':
        return '#3B82F6'; // Синий
      case 'words':
        return '#10B981'; // Зеленый
      case 'irregular-verbs':
        return '#8B5CF6'; // Фиолетовый
      case 'third-form':
        return '#F59E0B'; // Оранжевый
      case 'phrasal-verbs':
        return '#EC4899'; // Розовый
      case 'exam':
        return '#EF4444'; // Красный
      default:
        return '#6B7280'; // Серый по умолчанию
    }
  };

  // Determine if activity should pulse
  const shouldActivityPulse = (lessonId: number, activity: LessonActivity, index: number) => {
    const key = `${lessonId}_${activity.id}`;
    const isViewed = viewedActivities[key];
    
    // If already viewed, don't pulse
    if (isViewed) return false;
    
    // For exam, pulse if progress < 90%
    if (activity.id === 'exam') {
      return activity.progress < 90;
    }
    
    // For other activities, check if previous activities are viewed
    const activities = lessonActivities[lessonId];
    if (!activities) return false;
    
    // Check if all previous activities are viewed
    for (let i = 0; i < index; i++) {
      const prevKey = `${lessonId}_${activities[i].id}`;
      if (!viewedActivities[prevKey]) {
        return false; // Previous activity not viewed, so don't pulse this one
      }
    }
    
    return true; // All previous viewed, so pulse this one
  };

  const handleLessonPress = async (lessonId: number) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return;
  
      // Нет подписки и это не первый урок → показываем Paywall
      if (!isPro && lessonId > 1) {
        navigation.getParent()?.getParent()?.navigate('PaywallFlow' as never);
        return;
      }
  
      // Подписка есть, но урок ещё заблокирован → подсказка о 90%
      if (isPro && !lesson.unlocked) {
        Alert.alert(
          t('lessons.lessonsTitle'),
          t('lessons.examInfo')
        );
        return;
      }

      // Если урок завершен (≥90%), переключаем состояние сворачивания
      if (lesson.progress >= 90) {
        setCollapsedLessons(prev => ({
          ...prev,
          [lessonId]: !prev[lessonId]
        }));
        return;
      }

      // Если открыт: загружаем активности (если не загружены)
      if (!lessonActivities[lessonId]) {
        const activities = await loadLessonActivities(lessonId);
        setLessonActivities(prev => ({
          ...prev,
          [lessonId]: activities
        }));
      }
    } catch (err) {
      console.error('handleLessonPress error:', err);
    }
  };

  // Обработчик нажатия на активность
  const handleActivityPress = async (activity: LessonActivity, lessonId?: number) => {
    if (lessonId) {
      await markActivityAsViewed(lessonId, activity.id);
    }
    
    navigation.navigate(activity.screen, activity.params);
  };
  

  const renderProgressBar = (progress: number) => (
    <View style={styles.progressBarContainer}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressBar, { width: `${progress}%` }]}
      />
    </View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  return (
    <LoadingIndicator isLoading={isLoading}>
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        <View style={styles.navigationHeader}>
          <View style={styles.leftSideContainer}>
            <Image
              source={require('../../../my-app-new/assets/icon.png')}
              style={styles.logoImage}
            />
            <Text
              style={styles.brandName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              maxFontSizeMultiplier={1.1}
            >
              Memora English
            </Text>
          </View>

          <View style={styles.headerTitleContainer}>
            <View />
          </View>

          <View style={styles.rightSideContainer} />
        </View>

                 <Animated.ScrollView
           style={[styles.scrollView, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}
           contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
                     <View>
            <View style={styles.lessonsList}>
              {lessons.map((lesson) => {
                const isSelected = selectedId === lesson.id;
                const isPressed = pressedId === lesson.id;
                const isUnlocked = lesson.unlocked;
                const isCompleted = lesson.progress === 100 || lesson.isCompleted;

                if (Platform.OS === 'android') {
                  const gradientColors: [string, string] = ['#3B82F6', '#1F2937'];

                  return (
                    <View key={lesson.id}>
                      <Pressable
                      style={[
                          styles.lessonCard,
                          styles.unlockedCard,
                          isSelected && styles.selectedCard,
                          isPressed && styles.pressedCard,
                          isCompleted && styles.completedCard,
                      ]}
                        onPress={() => handleLessonPress(lesson.id)}
                        onPressIn={() => setPressedId(lesson.id)}
                        onPressOut={() => setPressedId(null)}
                      >
                        <LinearGradient
                          colors={gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientOverlay}
                        >
                          <View style={styles.lessonContent}>
                            <View style={styles.leftSection}>
                              <View style={[
                                styles.lessonNumber,
                                styles.unlockedNumber,
                                isPressed && styles.pressedNumber,
                                isCompleted && styles.completedNumber,
                              ]}>
                                {isUnlocked ? (
                                  <Text style={styles.numberText}>{lesson.id}</Text>
                                ) : (
                                  isPro ? (
                                    <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                                  ) : (
                                    <Ionicons name="close-circle" size={36} color="#EF4444" />
                                  )
                                )}
                            </View>
                              <Text style={[
                                styles.lessonTitle,
                                isPressed && styles.pressedText,
                                isCompleted && styles.completedText,
                              ]}>
                              {lesson.title}
                              {isCompleted && ' ✓'}
                            </Text>
                              </View>

                            <View style={styles.progressSection}>
                              {renderProgressBar(lesson.progress)}
                              <Text style={[
                                styles.progressText,
                                isPressed && styles.pressedText
                              ]}>
                                {lesson.progress}%
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </Pressable>

                      {/* Render activities if lesson is unlocked and not collapsed (or lesson progress < 90%) */}
                      {isUnlocked && lessonActivities[lesson.id] && (lesson.progress < 90 || !collapsedLessons[lesson.id]) && (
                        <View style={styles.activitiesContainer}>
                            {/* Activity 1: Объяснение */}
                            {lessonActivities[lesson.id][0] && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][0], 0) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][0].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][0], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][0].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][0].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][0].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {/* Activity 2: Слова */}
                            {lessonActivities[lesson.id][1] && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][1], 1) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][1].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][1], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][1].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][1].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][1].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {/* Activity 3: спец-раздел (показываем, только если это не exam) */}
                            {lessonActivities[lesson.id][2] && lessonActivities[lesson.id][2].id !== 'exam' && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][2], 2) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][2].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][2], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][2].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][2].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][2].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {/* Activity 4: Предложения (hidden per request)
                            {lessonActivities[lesson.id][3] && (
                              <TouchableOpacity
                                style={styles.activityCard}
                                onPress={() => handleActivityPress(lessonActivities[lesson.id][3], lesson.id)}
                              >
                                <View style={styles.activityContent}>
                                  <View style={[styles.activityIcon, { backgroundColor: '#F59E0B' }]}>
                                    <Ionicons 
                                      name={lessonActivities[lesson.id][3].icon as any} 
                                      size={22} 
                                      color="white" 
                                    />
                                  </View>
                                  <Text style={styles.activityTitle}>
                                    {lessonActivities[lesson.id][3].title}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                            */}

                            {/* Activity 5: Экзамен (рендерим только если последний — exam) */}
                            {lessonActivities[lesson.id].length > 0 && lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].id === 'exam' && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1], 3) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                          </View>
                      )}
                    </View>
                  );
                }

                return (
                  <View key={lesson.id}>
                  <TouchableOpacity
                    style={[
                      styles.lessonCard,
                        styles.unlockedCard,
                      isSelected && styles.selectedCard,
                      isPressed && styles.pressedCard,
                      isCompleted && styles.completedCard,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleLessonPress(lesson.id)}
                    onPressIn={() => setPressedId(lesson.id)}
                    onPressOut={() => setPressedId(null)}
                  >
                    <View style={styles.lessonContent}>
                      <View style={styles.leftSection}>
                        <View style={[ 
                          styles.lessonNumber,
                            styles.unlockedNumber,
                          isPressed && styles.pressedNumber,
                          isCompleted && styles.completedNumber,
                        ]}>
                          {isUnlocked ? (
                            <Text style={styles.numberText}>{lesson.id}</Text>
                          ) : (
                              isPro ? (
                            <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                              ) : (
                                <View style={styles.fullRedCircle}>
                                  <Ionicons name="close" size={22} color="#FFFFFF" />
                                </View>
                              )
                          )}
                        </View>
                        <Text
                          style={[
                            styles.lessonTitle,
                            isPressed && styles.pressedText,
                            isCompleted && styles.completedText,
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {lesson.title}
                          {isCompleted && ' ✓'}
                        </Text>
                      </View>

                      <View style={styles.progressSection}>
                        {renderProgressBar(lesson.progress)}
                        <Text style={[
                          styles.progressText,
                          isPressed && styles.pressedText
                        ]}>
                          {lesson.progress}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                    {/* Render activities if lesson is unlocked and not collapsed (or lesson progress < 90%) */}
                    {isUnlocked && lessonActivities[lesson.id] && (lesson.progress < 90 || !collapsedLessons[lesson.id]) && (
                          <View style={styles.activitiesContainer}>
                            {/* Activity 1: Объяснение */}
                            {lessonActivities[lesson.id][0] && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][0], 0) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][0].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][0], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][0].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][0].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][0].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {/* Activity 2: Слова */}
                            {lessonActivities[lesson.id][1] && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][1], 1) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][1].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][1], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][1].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][1].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][1].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {/* Activity 3: спец-раздел (показываем, только если это не exam) */}
                            {lessonActivities[lesson.id][2] && lessonActivities[lesson.id][2].id !== 'exam' && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][2], 2) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][2].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][2], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][2].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][2].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][2].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {/* Activity 4: Предложения (hidden per request)
                            {lessonActivities[lesson.id][3] && (
                              <TouchableOpacity
                                style={styles.activityCard}
                                onPress={() => handleActivityPress(lessonActivities[lesson.id][3], lesson.id)}
                              >
                                <View style={styles.activityContent}>
                                  <View style={[styles.activityIcon, { backgroundColor: '#F59E0B' }]}>
                                    <Ionicons 
                                      name={lessonActivities[lesson.id][3].icon as any} 
                                      size={22} 
                                      color="white" 
                                    />
                                  </View>
                                  <Text style={styles.activityTitle}>
                                    {lessonActivities[lesson.id][3].title}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                            */}

                            {/* Activity 5: Экзамен (рендерим только если последний — exam) */}
                            {lessonActivities[lesson.id].length > 0 && lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].id === 'exam' && (
                              <Animated.View style={{
                                transform: [{
                                  scale: shouldActivityPulse(lesson.id, lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1], 3) 
                                    ? pulseAnims[`${lesson.id}_${lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].id}`] || 1
                                    : 1
                                }]
                              }}>
                                <TouchableOpacity
                                  style={styles.activityCard}
                                  onPress={() => handleActivityPress(lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1], lesson.id)}
                                >
                                  <View style={styles.activityContent}>
                                    <View style={[styles.activityIcon, { backgroundColor: getActivityColor(lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].id) }]}>
                                      <Ionicons 
                                        name={lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].icon as any} 
                                        size={22} 
                                        color="white" 
                                      />
                                    </View>
                                    <Text style={styles.activityTitle}>
                                      {lessonActivities[lesson.id][lessonActivities[lesson.id].length - 1].title}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                          </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
    </LoadingIndicator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 44,
    zIndex: 2,
    position: 'relative',
  },
  leftSideContainer: {
    width: 140,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 8,
  },
  placeholderButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  rightSideContainer: {
    width: 44,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  purchasedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  lessonsList: {
    gap: 16,
    marginTop: 10,
  },
  lessonCard: {
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 0,
    borderColor: '#374151',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  unlockedCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
    borderWidth: 0,
  },
  lockedCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderColor: '#374151',
    opacity: 0.5,
    borderWidth: 0,
  },
  completedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  selectedCard: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.02 }],
  },
  pressedCard: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    transform: [{ scale: 0.98 }],
  },
  lessonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  lessonNumber: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  fullRedCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedNumber: {
    backgroundColor: '#2563EB',
  },
  lockedNumber: {
    backgroundColor: '#374151',
  },
  completedNumber: {
    backgroundColor: '#10B981',
  },
  pressedNumber: {
    borderColor: '#60A5FA',
    transform: [{ scale: 0.95 }],
  },
  numberText: {
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    flexShrink: 1,
  },
  completedText: {
    color: '#10B981',
  },
  lockedText: {
    color: '#9CA3AF',
  },
  pressedText: {
    color: '#60A5FA',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 80,
    marginLeft: 6,
  },
  progressBarContainer: {
    width: 80,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 8,
  },
  brandName: {
    fontWeight: '700',
    color: '#3B82F6',
    fontSize: 17,
    maxWidth: 180, // чтобы не уезжало под правый край на iPhone X
  },
  // --- Android styles ---
  lessonCardAndroidShadow: {
    borderRadius: 20,
    marginBottom: 14,
    elevation: 8,
  },
  lessonCardAndroidPressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  lessonCardAndroidInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  lessonContentAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  lessonNumberAndroid: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  numberTextAndroid: {
    color: 'white',
    fontSize: 23,
    fontWeight: 'bold',
  },
  lessonTitleAndroid: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  progressSectionAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    marginLeft: 6,
  },
  progressBarContainerAndroid: {
    width: 80,
    height: 4.5,
    backgroundColor: '#374151',
    borderRadius: 2.25,
    overflow: 'hidden',
    marginRight: 4,
  },
  progressBarAndroid: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2.25,
  },
  progressTextAndroid: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  lockedCardAndroid: {
    opacity: 0.5,
  },
  unlockedCardAndroid: {
    opacity: 1,
  },
  completedCardAndroid: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  selectedCardAndroid: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.02 }],
  },
  pressedCardAndroid: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    transform: [{ scale: 0.98 }],
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  activitiesContainer: {
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
});

export default LessonListScreen; 