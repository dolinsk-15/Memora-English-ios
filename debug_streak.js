import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@streak_data';
const DAILY_PROGRESS_KEY = '@daily_progress';

// Получить текущую дату в формате YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Отладочная функция для проверки данных
const debugStreakData = async () => {
  try {
    const today = getTodayDate();
    
    // Получаем данные streak
    const streakData = await AsyncStorage.getItem(STREAK_KEY);
    console.log('STREAK DATA:', streakData ? JSON.parse(streakData) : 'null');
    
    // Получаем прогресс сегодня
    const todayProgressData = await AsyncStorage.getItem(`${DAILY_PROGRESS_KEY}_${today}`);
    console.log('TODAY PROGRESS:', todayProgressData ? JSON.parse(todayProgressData) : 'null');
    
    // Получаем все ключи прогресса
    const allKeys = await AsyncStorage.getAllKeys();
    const progressKeys = allKeys.filter(key => key.startsWith(DAILY_PROGRESS_KEY));
    console.log('ALL PROGRESS KEYS:', progressKeys);
    
  } catch (error) {
    console.error('Error debugging streak data:', error);
  }
};

// Сброс данных для тестирования
const resetStreakData = async () => {
  try {
    const today = getTodayDate();
    await AsyncStorage.removeItem(STREAK_KEY);
    await AsyncStorage.removeItem(`${DAILY_PROGRESS_KEY}_${today}`);
    console.log('Streak data reset!');
  } catch (error) {
    console.error('Error resetting streak data:', error);
  }
};

// Импортируем SubscriptionDebugger
const { SubscriptionDebugger } = require('./src/utils/subscriptionDebugger.ts');

console.log('Debug functions available:');
console.log('- debugStreakData()');
console.log('- resetStreakData()');
console.log('- SubscriptionDebugger.debugFullStatus()');
console.log('- SubscriptionDebugger.clearAllSubscriptionData()');
console.log('- SubscriptionDebugger.clearSandboxPurchases()');

// Делаем функции доступными глобально
global.debugStreakData = debugStreakData;
global.resetStreakData = resetStreakData;
global.debugFullStatus = () => SubscriptionDebugger.debugFullStatus();
global.clearSubscriptionData = () => SubscriptionDebugger.clearAllSubscriptionData();
global.clearSandboxPurchases = () => SubscriptionDebugger.clearSandboxPurchases();

// Экспортируем для использования в консоли
global.debugStreakData = debugStreakData;
global.resetStreakData = resetStreakData; 