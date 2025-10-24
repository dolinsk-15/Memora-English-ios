import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../../localization';
import streakService from '../../services/streakService';
import type { StreakData } from '../../services/streakService';

const StreakScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  const loadStreakData = async () => {
    try {
      const stats = await streakService.getAllStats();
      setStreakData(stats.streak);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  useEffect(() => {
    loadStreakData();
  }, []);

  // Обновляем данные при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadStreakData();
    }, [])
  );

  if (!streakData) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.currentStreak')}</Text>
        </View>

        {/* Main Streak Card */}
        <View style={styles.mainContent}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.streakCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.streakIconContainer}>
              <MaterialIcons 
                name="local-fire-department" 
                size={80} 
                color="#fff" 
              />
            </View>
            
            <Text style={styles.streakLabel}>{t('profile.currentStreak')}</Text>
            
            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
            
            <Text style={styles.streakDays}>
              {streakData.currentStreak === 1 
                ? t('profile.day') 
                : t('profile.days')}
            </Text>
            
            {streakData.longestStreak > 0 && (
              <View style={styles.longestStreakContainer}>
                <Text style={styles.longestStreakText}>
                  {t('profile.longestStreak')}: {streakData.longestStreak}
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Motivational Text */}
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>
              {getMotivationalText(streakData.currentStreak, t)}
            </Text>
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

// Helper function to get motivational text based on streak
const getMotivationalText = (streak: number, t: any): string => {
  if (streak === 0) {
    return t('streak.startToday') || 'Начните свою серию сегодня!';
  } else if (streak === 1) {
    return t('streak.greatStart') || 'Отличное начало! Продолжайте в том же духе!';
  } else if (streak < 7) {
    return t('streak.keepGoing') || 'Продолжайте! Вы на правильном пути!';
  } else if (streak < 30) {
    return t('streak.impressive') || 'Впечатляюще! Вы формируете привычку!';
  } else {
    return t('streak.amazing') || 'Невероятно! Вы настоящий чемпион!';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    width: '100%',
    maxWidth: 350,
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  streakIconContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  streakLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  streakNumber: {
    fontSize: 90,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  streakDays: {
    fontSize: 24,
    color: '#fff',
    opacity: 0.9,
    marginTop: 10,
  },
  longestStreakContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  longestStreakText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  motivationContainer: {
    marginTop: 40,
    paddingHorizontal: 30,
  },
  motivationText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },

});

export default StreakScreen; 