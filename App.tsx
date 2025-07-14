import React from 'react';
import { Animated, View } from 'react-native';
import { LocalizationProvider } from './src/contexts/LocalizationContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import RootNavigator from './src/navigation/RootNavigator';
import * as SplashScreen from 'expo-splash-screen';

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
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    async function prepare() {
      try {
        // Записываем время начала
        const startTime = Date.now();
        
        // Здесь можно добавить любую дополнительную логику инициализации
        // например, загрузку шрифтов, ресурсов и т.д.
        
        // Вычисляем, сколько времени прошло
        const elapsedTime = Date.now() - startTime;
        const minSplashTime = 1000; // 1 секунда
        
        // Если прошло меньше 1 секунды, ждем оставшееся время
        if (elapsedTime < minSplashTime) {
          await new Promise(resolve => setTimeout(resolve, minSplashTime - elapsedTime));
        }
        
        // Приложение готово
        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
        // В случае ошибки все равно помечаем приложение как готовое
        setAppIsReady(true);
      }
    }

    prepare();
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

