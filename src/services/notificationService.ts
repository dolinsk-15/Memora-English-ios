import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ленивая загрузка модуля уведомлений, чтобы избежать ошибки
// "Cannot find native module 'ExpoPushTokenManager'" в средах без нативной части
const getNotificationsModule = async (): Promise<any | null> => {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    // Проверяем наличие нативного модуля заранее, чтобы избежать красного экрана при import()
    let hasNative = false;
    try {
      // expo-modules-core есть всегда в рантайме Expo/React Native
      // Проверяем наличие ключевых нативных модулей уведомлений
      // чтобы не вызывать динамический import, который бросает исключение
      // "Cannot find native module 'ExpoPushTokenManager'"
      // если модуль не встроен
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const core = require('expo-modules-core');
      const proxy = core?.NativeModulesProxy || {};
      hasNative = !!(
        proxy.ExpoPushTokenManager ||
        proxy.ExpoNotificationsHandlerModule ||
        proxy.ExpoNotificationScheduler ||
        proxy.ExpoDevicePushTokenManager
      );
    } catch (_) {
      hasNative = false;
    }

    if (!hasNative) {
      console.warn('[notifications] Native module not found, skipping initialization');
      return null;
    }

    const mod = await import('expo-notifications');
    return mod;
  } catch (e) {
    console.warn('[notifications] Module not available (skipping):', e);
    return null;
  }
};

// Ключи хранения
const LAST_OPEN_AT_KEY = 'lastOpenAtISO';
const SCHEDULED_IDS_KEY = 'scheduledReminderIds';

// Запрашиваем разрешения и настраиваем обработчик
export const initializeNotificationSystem = async () => {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch (error) {
    console.warn('initializeNotificationSystem error', error);
  }
};

export const saveLastOpenNow = async () => {
  try {
    const nowIso = new Date().toISOString();
    await AsyncStorage.setItem(LAST_OPEN_AT_KEY, nowIso);
  } catch (e) {
    console.warn('saveLastOpenNow error', e);
  }
};

export const readLastOpen = async (): Promise<Date | null> => {
  try {
    const iso = await AsyncStorage.getItem(LAST_OPEN_AT_KEY);
    return iso ? new Date(iso) : null;
  } catch (e) {
    console.warn('readLastOpen error', e);
    return null;
  }
};

export const cancelScheduledReminders = async () => {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      await AsyncStorage.removeItem(SCHEDULED_IDS_KEY);
      return;
    }
    const raw = await AsyncStorage.getItem(SCHEDULED_IDS_KEY);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    }
    await AsyncStorage.removeItem(SCHEDULED_IDS_KEY);
  } catch (e) {
    console.warn('cancelScheduledReminders error', e);
  }
};

// Возвращает 20:00 локального времени для указанной даты
const at20Local = (base: Date) => {
  const d = new Date(base);
  d.setHours(20, 0, 0, 0);
  return d;
};

// Находит первое 20:00 на или после даты threshold
const firstEightPmOnOrAfter = (threshold: Date) => {
  const at20 = at20Local(threshold);
  if (at20.getTime() >= threshold.getTime()) return at20;
  const next = new Date(at20);
  next.setDate(next.getDate() + 1);
  return next;
};

// Планирует напоминания каждый вечер, начиная с первого 20:00 после порога 72 часа неактивности
export const scheduleEveningRemindersAfterInactivity = async (message: string, daysToSchedule: number = 30) => {
  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;
    const lastOpen = await readLastOpen();
    if (!lastOpen) {
      // Если нет данных — сохраняем «сейчас» и ничего не планируем
      await saveLastOpenNow();
      return;
    }

    const thresholdMs = 72 * 60 * 60 * 1000; // 72 часа
    const thresholdDate = new Date(lastOpen.getTime() + thresholdMs);
    const now = new Date();

    // Если порог ещё не наступил — ничего не планируем сейчас
    if (now.getTime() < thresholdDate.getTime()) {
      return;
    }

    const first = firstEightPmOnOrAfter(now.getTime() >= thresholdDate.getTime() ? now : thresholdDate);

    const ids: string[] = [];
    for (let i = 0; i < daysToSchedule; i++) {
      const fireDate = new Date(first);
      fireDate.setDate(first.getDate() + i);
      const id = await Notifications.scheduleNotificationAsync({
        content: { body: message },
        trigger: fireDate,
      });
      ids.push(id);
    }
    await AsyncStorage.setItem(SCHEDULED_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('scheduleEveningRemindersAfterInactivity error', e);
  }
};


