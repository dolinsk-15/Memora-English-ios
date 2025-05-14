import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SuperwallService from '../../services/SuperwallService';
import { useTranslation } from '../../localization';

type LessonsNavigationProp = NativeStackNavigationProp<MainStackParamList, 'LessonList'>;

interface LessonData {
  id: number;
  title: string;
  progress: number;
  unlocked: boolean;
  isCompleted: boolean;
}

const LessonListScreen = () => {
  const navigation = useNavigation<LessonsNavigationProp>();
  const { t, language } = useTranslation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);
  
  // Начальные данные для уроков (первый урок всегда разблокирован)
  const [lessons, setLessons] = useState<LessonData[]>(
    Array.from({ length: 18 }, (_, i) => ({
      id: i + 1,
      title: `${t('lessons.lessonTitle')} ${i + 1}`,
      progress: 0,
      unlocked: i === 0, // только первый урок разблокирован изначально
      isCompleted: false // Добавляем дефолтное значение
    }))
  );
  
  const [isPurchased, setIsPurchased] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Загрузка данных прогресса и статуса покупки
  useEffect(() => {
    const loadData = async () => {
      try {
        // Проверяем, совершена ли покупка
        const purchased = await SuperwallService.isPurchased();
        setIsPurchased(purchased);
        
        // Загружаем прогресс уроков с переводом названий
        const updatedLessons = Array.from({ length: 18 }, (_, i) => ({
          id: i + 1,
          title: `${t('lessons.lessonTitle')} ${i + 1}`,
          progress: 0,
          unlocked: i === 0, // только первый урок разблокирован изначально
          isCompleted: false // Добавляем дефолтное значение
        }));
        
        // Первый урок всегда разблокирован
        updatedLessons[0].unlocked = true;
        
        // ИЗМЕНЕНИЕ: Если доступ куплен, то разблокируем ВСЕ уроки
        if (purchased) {
          for (let i = 0; i < updatedLessons.length; i++) {
            updatedLessons[i].unlocked = true;
          }
        }
        
        // Загружаем прогресс для каждого урока и статус завершения
        for (let i = 0; i < updatedLessons.length; i++) {
          const lessonId = i + 1;
          const savedProgress = await AsyncStorage.getItem(`lessonProgress_${lessonId}`);
          const isCompleted = await AsyncStorage.getItem(`lesson_${lessonId}_completed`);
          
          if (savedProgress) {
            const progress = parseInt(savedProgress, 10);
            if (!isNaN(progress) && progress >= 0 && progress <= 100) {
              updatedLessons[i].progress = progress;
              
              // Если урок имеет флаг "завершен" (вне зависимости от процента),
              // отмечаем его как завершенный визуально
              if (isCompleted === 'true') {
                updatedLessons[i].isCompleted = true;
              }
            }
          }
        }
        
        // Обновление заголовков уроков при смене языка
        const updatedLessonsWithTitles = [...updatedLessons];
        for (let i = 0; i < updatedLessonsWithTitles.length; i++) {
          updatedLessonsWithTitles[i].title = `${t('lessons.lessonTitle')} ${i + 1}`;
        }
        
        setLessons(updatedLessonsWithTitles);
      } catch (error) {
        console.error('Error loading lessons data:', error);
      }
    };
    
    loadData();
    
    // Обновление при возвращении на экран
    const unsubscribe = navigation.addListener('focus', loadData);
    return () => unsubscribe();
  }, [navigation, t, language]);

  // Обработчик нажатия на урок
  const handleLessonPress = async (lessonId: number) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      
      if (!lesson) return;
      
      if (!lesson.unlocked) {
        // Если урок заблокирован, сразу переходим на экран оплаты
        // без показа промежуточного диалогового окна
        navigation.navigate('Paywall');
        return;
      }
      
      // Проверка, если это первый урок и он завершен, и пользователь не купил доступ
      if (lessonId === 1 && lessons[0].progress === 100 && !isPurchased) {
        // Показываем экран оплаты после завершения первого урока
        navigation.navigate('Paywall');
        return;
      }
      
      // Если урок разблокирован, переходим к нему
      navigation.navigate('LessonDetail', { lessonId });
    } catch (error) {
      console.error('Error handling lesson press:', error);
    }
  };

  const renderProgressBar = (progress: number) => {
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
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Background */}
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        
        {/* Header */}
        <View style={styles.navigationHeader}>
          <View style={styles.leftSideContainer}>
            <Image 
              source={require('../../../my-app-new/assets/IMAGE 2025-05-09 01:31:20.jpg')} 
              style={styles.logoImage} 
            />
            <Text style={styles.brandName}>Memora</Text>
          </View>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {t('lessons.lessonsTitle')}
            </Text>
          </View>
          
          <View style={styles.rightSideContainer}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.contentContainer}>
            {/* Информация о прогрессе */}
            {isPurchased && (
              <View style={styles.purchasedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.purchasedText}>
                  {t('paywall.purchased')}
                </Text>
              </View>
            )}
            
            <View style={styles.lessonsList}>
              {lessons.map((lesson) => {
                const isSelected = selectedId === lesson.id;
                const isPressed = pressedId === lesson.id;
                const isUnlocked = lesson.unlocked;
                const isCompleted = lesson.progress === 100;

                return (
                  <Pressable
                    key={lesson.id}
                    style={[
                      styles.lessonCard,
                      isUnlocked ? styles.unlockedCard : styles.lockedCard,
                      isSelected && styles.selectedCard,
                      isPressed && styles.pressedCard,
                      (isCompleted || lesson.isCompleted) && styles.completedCard,
                    ]}
                    onPress={() => handleLessonPress(lesson.id)}
                    onPressIn={() => setPressedId(lesson.id)}
                    onPressOut={() => setPressedId(null)}
                  >
                    <View style={styles.lessonContent}>
                      <View style={styles.leftSection}>
                        <View style={[
                          styles.lessonNumber,
                          isUnlocked ? styles.unlockedNumber : styles.lockedNumber,
                          isPressed && styles.pressedNumber,
                          (isCompleted || lesson.isCompleted) && styles.completedNumber,
                        ]}>
                          {isUnlocked ? (
                            <Text style={styles.numberText}>{lesson.id}</Text>
                          ) : (
                            <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                          )}
                        </View>
                        <Text style={[
                          styles.lessonTitle,
                          !isUnlocked && styles.lockedText,
                          isPressed && styles.pressedText,
                          (isCompleted || lesson.isCompleted) && styles.completedText,
                        ]}>
                          {lesson.title}
                          {(isCompleted || lesson.isCompleted) && ' ✓'}
                        </Text>
                      </View>
                      
                      <View style={styles.progressSection}>
                        {renderProgressBar(lesson.progress)}
                        <Text style={[
                          styles.progressText,
                          !isUnlocked && styles.lockedText,
                          isPressed && styles.pressedText
                        ]}>
                          {lesson.progress}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
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
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#581C87',
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
    marginBottom: 12,
    overflow: 'hidden',
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
  unlockedCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  lockedCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderColor: '#374151',
    opacity: 0.5,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  lessonNumber: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    flex: 1,
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
    gap: 8,
    minWidth: 120,
  },
  progressBarContainer: {
    width: 80,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
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
  },
});

export default LessonListScreen; 