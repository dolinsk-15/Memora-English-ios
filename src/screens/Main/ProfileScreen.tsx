import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../../localization';
import streakService from '../../services/streakService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreakData, DailyProgress, LifetimeStats } from '../../services/streakService';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    streak: StreakData;
    todayProgress: DailyProgress;
    lifetime: LifetimeStats;
  } | null>(null);
  const [activityDates, setActivityDates] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState(0);
  const [learnedWords, setLearnedWords] = useState(0);
  const [weekStatuses, setWeekStatuses] = useState<Record<string, 'completed' | 'not_completed' | 'none'>>({});

  // Fast fade-in animation for content
  const contentOpacity = React.useRef(new Animated.Value(0)).current;
  const contentTranslateY = React.useRef(new Animated.Value(8)).current;
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const loadStats = async () => {
    try {
      const allStats = await streakService.getAllStats();
      setStats(allStats);
      
      // Primary source: lifetime total words from StreakService
      if (allStats?.lifetime?.totalWords !== undefined) {
        setLearnedWords(allStats.lifetime.totalWords);
      }
      
      // Load activity dates
      const dates = await streakService.getActivityDates();
      setActivityDates(new Set(dates));

      // Load statuses for current week (Mon-Sun)
      const today = new Date();
      const jsDay = today.getDay();
      const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
      const monday = new Date(today);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(today.getDate() + mondayOffset);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${da}`;
      };
      const startStr = fmt(monday);
      const endStr = fmt(sunday);
      const statusesMap = await streakService.getStatusesForRange(startStr, endStr);
      setWeekStatuses(statusesMap);
      
      // Count completed lessons (>= 90% exam progress)
      let lessonsCompleted = 0;
      let wordsLearned = 0;
      
      for (let i = 1; i <= 18; i++) {
        // Primary: use explicit completed flag set by ExamScreen
        const completedFlag = await AsyncStorage.getItem(`lesson_${i}_completed`);
        if (completedFlag === 'true') {
          lessonsCompleted++;
        } else {
          // Fallback: derive from stored progress keys
          const examProgressStr = await AsyncStorage.getItem(`examProgress_lesson${i}`);
          const lessonProgressStr = await AsyncStorage.getItem(`lessonProgress_${i}`);
          const progressVal = Math.max(
            examProgressStr ? parseInt(examProgressStr, 10) : 0,
            lessonProgressStr ? parseInt(lessonProgressStr, 10) : 0
          );
          if (!isNaN(progressVal) && progressVal >= 90) {
            lessonsCompleted++;
          }
        }
        
        // Count learned words based on repetitions
        const wordRepsKey = `wordRepetitions_lesson${i}`;
        const savedWordReps = await AsyncStorage.getItem(wordRepsKey);
        
        if (savedWordReps) {
          const wordReps = JSON.parse(savedWordReps);
          const targetRepsKey = `targetRepetitions_lesson${i}`;
          const targetRepsStr = await AsyncStorage.getItem(targetRepsKey);
          const targetReps = targetRepsStr ? parseInt(targetRepsStr, 10) : 10; // default target is 10
          
          // Count words that reached target repetitions
          Object.values(wordReps).forEach((wordData: any) => {
            if (wordData && wordData.repetitions >= targetReps) {
              wordsLearned++;
            }
          });
        }
      }
      
      setCompletedLessons(lessonsCompleted);
      setLearnedWords(wordsLearned);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Initial load + fade-in
  useEffect(() => {
    contentOpacity.setValue(0);
    contentTranslateY.setValue(8);
    (async () => {
      await loadStats();
      animateIn();
    })();
    streakService.initializeStreak();
  }, []);

  // Обновляем данные и fade при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      contentOpacity.setValue(0);
      contentTranslateY.setValue(8);
      (async () => {
        await loadStats();
        animateIn();
      })();
      }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    contentOpacity.setValue(0);
    contentTranslateY.setValue(8);
    await loadStats();
    animateIn();
    setRefreshing(false);
  };

  const renderCalendar = () => {
    const today = new Date();

    // Determine Monday of the current week (Monday = 0)
    const jsDay = today.getDay(); // 0=Sun..6=Sat
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay; // if Sunday, go back 6 days; otherwise to Monday
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + mondayOffset);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Локализованные метки дней недели (Пн-Вс) и месяцев (краткие)
    const daysByLang: Record<string, string[]> = {
      ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
      en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    };
    const monthsByLang: Record<string, string[]> = {
      ru: ['янв.', 'февр.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
      es: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
      fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };
    const langKey = language || 'ru';
    const daysOfWeek = daysByLang[langKey] || daysByLang.ru;
    const monthNamesShort = monthsByLang[langKey] || monthsByLang.ru;

    const sameMonth = monday.getMonth() === sunday.getMonth();
    const leftMonth = monthNamesShort[monday.getMonth()];
    const rightMonth = monthNamesShort[sunday.getMonth()];
    const title = sameMonth
      ? `${monday.getDate()}–${sunday.getDate()} ${rightMonth}`
      : `${monday.getDate()} ${leftMonth} – ${sunday.getDate()} ${rightMonth}`;

    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    // Локальный формат даты YYYY-MM-DD (как в StreakService)
    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };
 
    const days: React.ReactNode[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = formatLocal(date);
      const status = weekStatuses[dateStr] || 'none';
      const isCompletedFromStatus = status === 'completed';
      const isStreakDay = stats?.streak?.lastActiveDate === dateStr;
      const isCompletedDay = isCompletedFromStatus || isStreakDay;
      const isToday = date.toDateString() === today.toDateString();

      const dateMidnight = new Date(date);
      dateMidnight.setHours(0, 0, 0, 0);
      const isFuture = dateMidnight.getTime() > todayMidnight.getTime();

      days.push(
        <View
          key={i}
          style={[
            styles.calendarDay,
            isToday && styles.todayDay,
            isCompletedDay && styles.activeDay,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              isToday && styles.todayText,
              isCompletedDay && styles.activeDayText,
            ]}
          >
            {date.getDate()}
          </Text>
          {/* Only show green check when streak completed; nothing otherwise */}
          {!isFuture && isCompletedDay && (
            <View style={styles.cornerIcon}>
              <Ionicons
                name={'checkmark-circle'}
                size={16}
                color={'#22C55E'}
              />
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.calendar}>
        <Text style={styles.monthTitle}>{title}</Text>
        <View style={styles.weekDays}>
          {daysOfWeek.map((label, idx) => (
            <Text
              key={idx}
              style={[
                styles.weekDayText,
                (idx === 5 || idx === 6) && styles.weekendText,
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
        <View style={[styles.calendarGrid, { flexWrap: 'nowrap', justifyContent: 'space-between' }]}>
          {days}
        </View>
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Fixed header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
          style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}
        >
            {/* Streak Section */}
            <View style={styles.streakSection}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.streakCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.streakHeader}>
                  <MaterialIcons name="local-fire-department" size={32} color="#fff" />
                  <Text style={styles.streakTitle}>{t('profile.currentStreak')}</Text>
                </View>
                <Text style={styles.streakNumber}>{stats?.streak.currentStreak}</Text>
                <Text style={styles.streakDays}>
                  {stats?.streak.currentStreak === 1 
                    ? t('profile.day') 
                    : t('profile.days')}
                </Text>
                {!!stats && stats.streak.longestStreak > 0 && (
                  <Text style={styles.longestStreak}>
                    {t('profile.longestStreak')}: {stats.streak.longestStreak}
                  </Text>
                )}
              </LinearGradient>
            </View>

            {/* Calendar Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.activity')}</Text>
              {renderCalendar()}
            </View>

            {/* Lifetime Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.lifetimeStats')}</Text>
              <View style={styles.lifetimeStats}>
                <View style={styles.lifetimeStatRow}>
                  <View style={styles.lifetimeStatItem}>
                    <Ionicons name="list" size={20} color="#10B981" />
                    <Text style={styles.lifetimeStatLabel}>{t('profile.learnedWords')}</Text>
                  </View>
                  <Text style={styles.lifetimeStatValue}>{learnedWords}</Text>
                </View>
                <View style={[styles.lifetimeStatRow, styles.lifetimeStatRowLast]}>
                  <View style={styles.lifetimeStatItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#A8E6CF" />
                    <Text style={styles.lifetimeStatLabel}>{t('profile.completedLessons')}</Text>
                  </View>
                  <Text style={styles.lifetimeStatValue}>{completedLessons}</Text>
                </View>
              </View>
              {(() => {
                const motivation = t('profile.motivation');
                if (motivation === 'profile.motivation') return null; // показываем только если есть перевод
                return (
                  <View style={styles.motivationContainer}>
                    <Text style={styles.motivationText}>{motivation}</Text>
                  </View>
                );
              })()}
            </View>
        </Animated.ScrollView>

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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 12,
  },
  streakCard: {
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakDays: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  longestStreak: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  lifetimeStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
  },
  lifetimeStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)'
  },
  lifetimeStatRowLast: {
    borderBottomWidth: 0,
  },
  lifetimeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lifetimeStatLabel: {
    fontSize: 16,
    color: '#fff',
  },
  lifetimeStatValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  motivationContainer: {
    marginTop: 12,
    marginBottom: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  motivationText: {
    color: '#E5E7EB',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center'
  },
  calendar: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    borderRadius: 14,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  weekDayText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    width: '13.8%',
    textAlign: 'center',
    fontWeight: '600',
  },
  weekendText: {
    color: '#FF6B6B',
    opacity: 0.75,
  },
  calendarGrid: {
    flexDirection: 'row',
  },
  calendarDay: {
    width: '13.8%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
  },
  todayDay: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#4ECDC4',
    opacity: 1,
  },
  activeDay: {
    position: 'relative',
  },
  activeDayText: {
    color: '#fff',
    opacity: 1,
    fontWeight: '600',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  cornerIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  }

});

export default ProfileScreen; 