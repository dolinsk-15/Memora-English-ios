import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'user_streak_data';
const DAILY_PROGRESS_KEY = 'daily_progress';
const LIFETIME_STATS_KEY = 'lifetime_statistics';
const COMPLETED_DATES_KEY = 'streak_completed_dates';

// Helper: format date as local YYYY-MM-DD
function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  completedWords: number;
  completedSentences: number;
  examErrors: number;
  isStreakCompleted: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakStartDate: string | null;
}

export interface LifetimeStats {
  totalWords: number;
  totalSentences: number;
  totalExamErrors: number;
}

class StreakService {
  // Get today's date in local YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    return formatLocalDate(today);
  }

  // Get yesterday's date in local YYYY-MM-DD format
  private getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatLocalDate(yesterday);
  }

  private async getCompletedDates(): Promise<Record<string, boolean>> {
    try {
      const json = await AsyncStorage.getItem(COMPLETED_DATES_KEY);
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }

  private async markDateCompleted(date: string): Promise<void> {
    const map = await this.getCompletedDates();
    if (!map[date]) {
      map[date] = true;
      await AsyncStorage.setItem(COMPLETED_DATES_KEY, JSON.stringify(map));
    }
  }

  // Initialize streak data if not exists
  async initializeStreak(): Promise<void> {
    const streakData = await this.getStreakData();
    if (!streakData) {
      const initialData: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakStartDate: null,
      };
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(initialData));
    }
  }

  // Get current streak data
  async getStreakData(): Promise<StreakData | null> {
    try {
      const data = await AsyncStorage.getItem(STREAK_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting streak data:', error);
      return null;
    }
  }

  // Get today's progress
  async getTodayProgress(): Promise<DailyProgress> {
    try {
      const today = this.getTodayDate();
      const progressData = await AsyncStorage.getItem(`${DAILY_PROGRESS_KEY}_${today}`);
      
      if (progressData) {
        return JSON.parse(progressData);
      }
      
      // Initialize today's progress if not exists
      const initialProgress: DailyProgress = {
        date: today,
        completedWords: 0,
        completedSentences: 0,
        examErrors: 0,
        isStreakCompleted: false,
      };
      
      await AsyncStorage.setItem(`${DAILY_PROGRESS_KEY}_${today}`, JSON.stringify(initialProgress));
      return initialProgress;
    } catch (error) {
      console.error('Error getting today progress:', error);
      return {
        date: this.getTodayDate(),
        completedWords: 0,
        completedSentences: 0,
        examErrors: 0,
        isStreakCompleted: false,
      };
    }
  }

  // Get lifetime statistics
  async getLifetimeStats(): Promise<LifetimeStats> {
    try {
      const stats = await AsyncStorage.getItem(LIFETIME_STATS_KEY);
      if (stats) {
        return JSON.parse(stats);
      }
      
      const initialStats: LifetimeStats = {
        totalWords: 0,
        totalSentences: 0,
        totalExamErrors: 0,
      };
      
      await AsyncStorage.setItem(LIFETIME_STATS_KEY, JSON.stringify(initialStats));
      return initialStats;
    } catch (error) {
      console.error('Error getting lifetime stats:', error);
      return {
        totalWords: 0,
        totalSentences: 0,
        totalExamErrors: 0,
      };
    }
  }

  // Track completed word
  async trackCompletedWord(): Promise<{streakIncreased: boolean; newStreak: number} | null> {
    return await this.trackActivity('word');
  }

  // Track completed sentence
  async trackCompletedSentence(): Promise<{streakIncreased: boolean; newStreak: number} | null> {
    return await this.trackActivity('sentence');
  }

  // Track exam error
  async trackExamError(): Promise<{streakIncreased: boolean; newStreak: number} | null> {
    return await this.trackActivity('examError');
  }

  // Main tracking function
  private async trackActivity(type: 'word' | 'sentence' | 'examError'): Promise<{streakIncreased: boolean; newStreak: number} | null> {
    try {
      // Update today's progress
      const todayProgress = await this.getTodayProgress();
      const lifetimeStats = await this.getLifetimeStats();
      const today = this.getTodayDate();
      
      switch (type) {
        case 'word':
          todayProgress.completedWords++;
          lifetimeStats.totalWords++;
          break;
        case 'sentence':
          todayProgress.completedSentences++;
          lifetimeStats.totalSentences++;
          break;
        case 'examError':
          todayProgress.examErrors++;
          lifetimeStats.totalExamErrors++;
          break;
      }
      
      // Check if streak is completed (1 total activity)
      const totalActivities = todayProgress.completedWords + 
                            todayProgress.completedSentences + 
                            todayProgress.examErrors;
      
      let streakResult: {streakIncreased: boolean; newStreak: number} | null = null;
      if (totalActivities >= 1 && !todayProgress.isStreakCompleted) {
        todayProgress.isStreakCompleted = true;
        streakResult = await this.updateStreak();
        // Persist permanently for calendar
        await this.markDateCompleted(today);
      }
      
      // Save progress and lifetime
      await AsyncStorage.setItem(
        `${DAILY_PROGRESS_KEY}_${todayProgress.date}`, 
        JSON.stringify(todayProgress)
      );
      await AsyncStorage.setItem(LIFETIME_STATS_KEY, JSON.stringify(lifetimeStats));
      
      return streakResult;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return null;
    }
  }

  // Update streak when daily goal is met
  private async updateStreak(): Promise<{streakIncreased: boolean; newStreak: number}> {
    try {
      let streakData = await this.getStreakData();
      if (!streakData) {
        // Initialize if missing so the first completion today starts the streak
        streakData = {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          streakStartDate: null,
        };
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
      }
      
      const today = this.getTodayDate();
      const yesterday = this.getYesterdayDate();
      const previousStreak = streakData.currentStreak;
      
      // Check if streak continues from yesterday
      if (streakData.lastActiveDate === yesterday) {
        // Continue streak
        streakData.currentStreak++;
      } else if (streakData.lastActiveDate !== today) {
        // Start new streak (if not already counted today)
        streakData.currentStreak = 1;
        streakData.streakStartDate = today;
      }
      
      // Update longest streak if needed
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }
      
      streakData.lastActiveDate = today;
      
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
      
      // Return whether streak increased
      const increased = streakData.currentStreak > previousStreak;
      return {
        streakIncreased: increased,
        newStreak: streakData.currentStreak
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      return {streakIncreased: false, newStreak: 0};
    }
  }

  // Check and reset streak if broken
  async checkAndResetStreakIfNeeded(): Promise<void> {
    try {
      const streakData = await this.getStreakData();
      if (!streakData || !streakData.lastActiveDate) return;
      
      const today = this.getTodayDate();
      const yesterday = this.getYesterdayDate();
      
      // If last active date is not today or yesterday, reset streak
      if (streakData.lastActiveDate !== today && streakData.lastActiveDate !== yesterday) {
        streakData.currentStreak = 0;
        streakData.streakStartDate = null;
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  }

  // Get all stats for profile screen
  async getAllStats(): Promise<{
    streak: StreakData;
    todayProgress: DailyProgress;
    lifetime: LifetimeStats;
  }> {
    await this.checkAndResetStreakIfNeeded();
    
    const [streak, todayProgress, lifetime] = await Promise.all([
      this.getStreakData(),
      this.getTodayProgress(),
      this.getLifetimeStats(),
    ]);
    
    return {
      streak: streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakStartDate: null,
      },
      todayProgress,
      lifetime,
    };
  }

  // Get all dates with activity
  async getActivityDates(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const activityDates: string[] = [];
      
      // Find all daily progress keys
      const progressKeys = keys.filter(key => key.startsWith(DAILY_PROGRESS_KEY + '_'));
      
      for (const key of progressKeys) {
        const progressData = await AsyncStorage.getItem(key);
        if (progressData) {
          const progress = JSON.parse(progressData) as DailyProgress;
          // Add date if any activity was done
          if (progress.completedWords > 0 || progress.completedSentences > 0 || progress.examErrors > 0) {
            activityDates.push(progress.date);
          }
        }
      }
      
      return activityDates.sort();
    } catch (error) {
      console.error('Error getting activity dates:', error);
      return [];
    }
  }

  // Get statuses for date range: 'completed' (streak increased), 'not_completed' (had activity but not enough), 'none' (no activity)
  async getStatusesForRange(startDate: string, endDate: string): Promise<Record<string, 'completed' | 'not_completed' | 'none'>> {
    const result: Record<string, 'completed' | 'not_completed' | 'none'> = {};
    try {
      // Preload persisted completed dates
      const completedMap = await this.getCompletedDates();
      // Build dates between start and end inclusive
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
        const dateStr = formatLocalDate(d);
        if (completedMap[dateStr]) {
          result[dateStr] = 'completed';
          continue;
        }
        const key = `${DAILY_PROGRESS_KEY}_${dateStr}`;
        const json = await AsyncStorage.getItem(key);
        if (!json) {
          result[dateStr] = 'none';
          continue;
        }
        const progress = JSON.parse(json) as DailyProgress;
        if (progress.isStreakCompleted) {
          result[dateStr] = 'completed';
        } else {
          // No red crosses; only completed or none
          result[dateStr] = 'none';
        }
      }
    } catch (error) {
      console.error('Error getting statuses for range:', error);
    }
    return result;
  }
}

export default new StreakService(); 