import React from 'react';
import { Animated, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { LocalizationProvider } from './src/contexts/LocalizationContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import RootNavigator from './src/navigation/RootNavigator';
import { getTranslation } from './src/localization';
import { initializeNotificationSystem, saveLastOpenNow, cancelScheduledReminders, scheduleEveningRemindersAfterInactivity } from './src/services/notificationService';
import * as SplashScreen from 'expo-splash-screen';
import InAppPurchaseService from './src/services/inAppPurchaseService';

// Предотвращаем автоматическое скрытие сплэш-экрана
SplashScreen.preventAutoHideAsync();

/**
 * @name App
 * @description Корневой компонент приложения.
 * Superwall теперь конфигурируется внутри PremiumProvider.
 */
const App = () => {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = React.useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    async function prepare() {
      try {
        // Показываем спиннер проверки подписки
        setIsCheckingSubscription(true);

        // Максимальное время ожидания загрузки (2 секунды)
        const loadingTimeout = setTimeout(() => {
          console.log('[App] ⏰ Loading timeout reached, showing app with cached data');
          setIsCheckingSubscription(false);
          setAppIsReady(true);
        }, 2000);

        const startTime = Date.now();
        
        // ПРИОРИТЕТ 1: Проверка активной подписки и загрузка продуктов (первая секунда)
        console.log('[App] 🎯 PRIORITY 1: Checking active subscription and loading products...');
        
        const subscriptionPromise = (async () => {
          try {
            console.log('[App] 🚀 Starting PRIORITY subscription check and product loading...');
            
            // Быстрая инициализация с таймаутом (1 секунда)
            const initPromise = InAppPurchaseService.initialize();
            const initTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Init timeout')), 1000)
            );
            
            await Promise.race([initPromise, initTimeout]);
            
            // Параллельно запускаем проверку подписки и загрузку продуктов
            const checkPromise = InAppPurchaseService.checkEntitlements();
            const checkTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Check timeout')), 500)
            );
            
            // Загрузка продуктов не блокирует основной поток, но запускается сразу
            InAppPurchaseService.loadProducts()
              .then(() => console.log('[App] ✅ Products loaded successfully in background'))
              .catch(e => console.warn('[App] ⚠️ Products loading failed:', e));
            
            const result = await Promise.race([checkPromise, checkTimeout]);
            console.log(`[App] ✅ PRIORITY subscription check completed: ${result}`);
            return result;
          } catch (e) {
            console.warn('[App] ⚠️ PRIORITY subscription check failed, using cached data:', e instanceof Error ? e.message : String(e));
            return null;
          }
        })();

        // Ждем завершения приоритетной проверки подписки
        await subscriptionPromise;

        // Минимальная пауза для UX (минимум 1 секунда общая загрузка)
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = Math.max(0, 1000 - elapsedTime);
        if (minDisplayTime > 0) {
          console.log(`[App] ⏱️ Waiting ${minDisplayTime}ms to reach minimum 1s loading time...`);
          await new Promise(resolve => setTimeout(resolve, minDisplayTime));
        }

        // Скрываем спиннер и помечаем приложение как готовое
        clearTimeout(loadingTimeout);
        setIsCheckingSubscription(false);
        setAppIsReady(true);
        
        console.log(`[App] 🎯 PRIORITY loading completed in: ${Date.now() - startTime}ms`);

        // ПРИОРИТЕТ 2: Инициализация остальных сервисов в фоне (вторая секунда)
        console.log('[App] 🔄 PRIORITY 2: Starting background services...');
        
        // Инициализируем локальные уведомления в фоне (не блокируем UI)
        initializeNotificationSystem()
          .then(() => console.log('[App] ✅ Background: Notifications initialized'))
          .catch(e => console.warn('[App] ⚠️ Background: Notifications failed:', e));

      } catch (e) {
        console.warn('[App] ❌ Critical error during prepare:', e);
        // В случае критической ошибки все равно показываем приложение
        setIsCheckingSubscription(false);
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // При каждом монтировании приложения сохраняем время открытия и отменяем старые напоминания
  React.useEffect(() => {
    (async () => {
      try {
        await saveLastOpenNow();
        // Останавливаем старые напоминания при открытии
        await cancelScheduledReminders();
        // Планируем напоминания, если прошло >= 72 часа неактивности — сообщение локализовано
        const resolveLanguage = async (): Promise<string> => {
          const stored = (await AsyncStorage.getItem('user_language')) as any;
          if (stored) return stored;
          try {
            const device = (Localization.locale || '').split('-')[0]?.toLowerCase();
            const supported = ['en', 'ru', 'es', 'fr', 'de'];
            return supported.includes(device) ? device : 'en';
          } catch {
            return 'en';
          }
        };
        const lang = await resolveLanguage();
        const translations: any = getTranslation(lang as any);
        const localizedMessage = translations?.notifications?.dailyReminder || 'Time to give English 3 minutes';
        await scheduleEveningRemindersAfterInactivity(localizedMessage);
      } catch (e) {
        console.warn('App notify bootstrap error', e);
      }
    })();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady && !splashAnimationComplete) {
      // Даем время на рендеринг основного интерфейса
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Теперь скрываем сплэш-экран
      await SplashScreen.hideAsync();
      
      // И сразу запускаем анимацию появления
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start(() => {
        setSplashAnimationComplete(true);
      });
    }
  }, [appIsReady, fadeAnim, scaleAnim, splashAnimationComplete]);

  // Показываем спиннер проверки подписки
  if (isCheckingSubscription) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#111827', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }}>
        <PremiumProvider>
          <LocalizationProvider>
            <RootNavigator onReady={onLayoutRootView} />
          </LocalizationProvider>
        </PremiumProvider>
      </Animated.View>
    </View>
  );
};

export default App;

