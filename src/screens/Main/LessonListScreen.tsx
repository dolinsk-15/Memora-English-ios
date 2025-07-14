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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SuperwallService from '../../services/SuperwallService';
import { useTranslation } from '../../localization';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../../contexts/PremiumContext';
import LoadingIndicator from '../../components/LoadingIndicator';

const LessonListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList, 'LessonList'>>();
  const { t, language } = useTranslation();
  const { isPro, setPro, isLoading } = usePremium();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Состояние уроков (с прогрессом)
  const [lessons, setLessons] = useState<any[]>([]);

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

  // Загружаем уроки и прогресс
  useEffect(() => {
    if (isLoading) return; // Ждём определения статуса подписки

    const loadData = async () => {
      try {
        const newLessons = Array.from({ length: 18 }, (_, i) => ({
          id: i + 1,
          title: `${t('lessons.lessonTitle')} ${i + 1}`,
          progress: 0,
          unlocked: i === 0 || isPro,
          isCompleted: false,
        }));

        for (let i = 0; i < newLessons.length; i++) {
          const lessonId = i + 1;
          const savedProgress = await AsyncStorage.getItem(`lessonProgress_${lessonId}`);
          const isCompleted = await AsyncStorage.getItem(`lesson_${lessonId}_completed`);

          if (savedProgress) {
            const progress = parseInt(savedProgress, 10);
            if (!isNaN(progress)) newLessons[i].progress = progress;
          }
          if (isCompleted === 'true') newLessons[i].isCompleted = true;
          if (isPro) newLessons[i].unlocked = true;
        }

        if (!lessonsEqual(lessons, newLessons)) {
          setLessons(newLessons);
        }
      } catch (err) {
        console.error('LessonListScreen loadData error:', err);
      }
    };

    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return () => unsubscribe();
  }, [navigation, t, language, isPro, isLoading]);

  const handleLessonPress = async (lessonId: number) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return;
  
      // Если нет подписки и это не первый урок — показываем Paywall
      if (!isPro && lessonId > 1) {
        await SuperwallService.showPaywall('campaign_trigger');
        return;
      }
  
      navigation.navigate('LessonDetail', { lessonId });
    } catch (error) {
      console.error('LessonListScreen: Error handling lesson press:', error);
    }
  };
  

  const renderProgressBar = (progress: number) => (
    <View style={styles.progressBarContainer}>
      <LinearGradient
        colors={['#3B82F6', '#06B6D4']}
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
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        <View style={styles.navigationHeader}>
          <View style={styles.leftSideContainer}>
            <Image
              source={require('../../../my-app-new/assets/icon.png')}
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
            <View style={styles.lessonsList}>
              {lessons.map((lesson) => {
                const isSelected = selectedId === lesson.id;
                const isPressed = pressedId === lesson.id;
                const isUnlocked = lesson.unlocked;
                const isCompleted = lesson.progress === 100 || lesson.isCompleted;

                if (Platform.OS === 'android') {
                  const gradientColors: [string, string] = isUnlocked
                    ? ['#3B82F6', '#1F2937']
                    : ['#1F2937', '#374151'];
                  return (
                    <View
                      key={lesson.id}
                      style={[
                        styles.lessonCardAndroidShadow,
                        isUnlocked ? styles.unlockedCardAndroid : styles.lockedCardAndroid,
                        isSelected && styles.selectedCardAndroid,
                        isPressed && styles.pressedCardAndroid,
                        isCompleted && styles.completedCardAndroid,
                      ]}
                    >
                      <Pressable
                        android_ripple={{ borderless: true, radius: 300 }}
                        onPress={() => handleLessonPress(lesson.id)}
                        onPressIn={() => setPressedId(lesson.id)}
                        onPressOut={() => setPressedId(null)}
                        style={styles.lessonCardAndroidPressable}
                      >
                        <LinearGradient
                          colors={gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.lessonCardAndroidInner}
                        >
                          <View style={styles.lessonContentAndroid}>
                            <View style={[styles.lessonNumberAndroid, isCompleted && { backgroundColor: '#10B981' }]}>
                              <Text style={[styles.numberTextAndroid, isCompleted && { color: 'white' }]}>{lesson.id}</Text>
                            </View>
                            <Text style={[styles.lessonTitleAndroid, isCompleted && { color: '#10B981' }]}>
                              {lesson.title}
                              {isCompleted && ' ✓'}
                            </Text>
                            <View style={styles.progressSectionAndroid}>
                              <View style={styles.progressBarContainerAndroid}>
                                <View style={[styles.progressBarAndroid, { width: `${lesson.progress}%`, backgroundColor: isCompleted ? '#10B981' : '#3B82F6' }]} />
                              </View>
                              <Text style={[styles.progressTextAndroid, isCompleted && { color: '#10B981' }]}>{lesson.progress}%</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonCard,
                      isUnlocked ? styles.unlockedCard : styles.lockedCard,
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
                          isUnlocked ? styles.unlockedNumber : styles.lockedNumber,
                          isPressed && styles.pressedNumber,
                          isCompleted && styles.completedNumber,
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
                          !isUnlocked && styles.lockedText,
                          isPressed && styles.pressedText
                        ]}>
                          {lesson.progress}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
    paddingBottom: Platform.OS === 'android' ? 32 : 0,
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
    ...Platform.select({
      ios: {
        // no shadow for iOS
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
    gap: 16,
    flex: 1,
  },
  lessonNumber: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    minWidth: 80,
    marginLeft: 10,
  },
  progressBarContainer: {
    width: 82,
    height: 4.5,
    backgroundColor: '#374151',
    borderRadius: 2.25,
    overflow: 'hidden',
    marginRight: 9,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2.25,
  },
  progressText: {
    color: 'white',
    fontSize: 15,
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
    marginLeft: 10,
  },
  progressBarContainerAndroid: {
    width: 82,
    height: 4.5,
    backgroundColor: '#374151',
    borderRadius: 2.25,
    overflow: 'hidden',
    marginRight: 9,
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
    minWidth: 40,
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
});

export default LessonListScreen; 