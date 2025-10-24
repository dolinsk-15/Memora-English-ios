import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform, Animated, Vibration, Modal, Dimensions, Easing, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../localization';
import { useNavigation } from '@react-navigation/native';
import LessonsStackNavigator from './LessonsStackNavigator';
import ProfileScreen from '../screens/Main/ProfileScreen';
// import StreakScreen from '../screens/Main/StreakScreen';
import streakService from '../services/streakService';
import { useFocusEffect } from '@react-navigation/native';
import { useStreakAnimation } from '../contexts/StreakAnimationContext';
import * as Audio from 'expo-av';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import SettingsStackNavigator from './SettingsStackNavigator';

export type TabParamList = {
  Lessons: undefined;
  // Streak: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Animated Tab Icon Component
const AnimatedTabIcon: React.FC<{
  focused: boolean;
  children: React.ReactNode;
}> = ({ focused, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 140, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.0, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (focused) {
      // increase focus scale by ~50% (from 1.05 to ~1.075)
      Animated.spring(scaleAnim, { toValue: 1.075, friction: 5, tension: 40, useNativeDriver: true }).start();
    } else {
      Animated.spring(scaleAnim, { toValue: 1.0, friction: 5, tension: 40, useNativeDriver: true }).start();
    }
  }, [focused, scaleAnim]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, focused && styles.activeTabShadow]}>
      {children}
    </Animated.View>
  );
};

const TabNavigator: React.FC = () => {
  const { t } = useTranslation();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const streakScale = useRef(new Animated.Value(1)).current;
  const streakTranslateX = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const PARTICLE_COUNT = 36;
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }).map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;
  const particleColors = ['#FBBF24', '#FDE047', '#FFD700', '#FF6347', '#FF4500'];
  const { setHandler } = useStreakAnimation();
  const [fullCelebrationVisible, setFullCelebrationVisible] = useState(false);
  const fullScale = useRef(new Animated.Value(0.8)).current;
  const fullOpacity = useRef(new Animated.Value(0)).current;
  const fullGlowOpacity = useRef(new Animated.Value(0)).current;
  const fullTranslateY = useRef(new Animated.Value(0)).current;
  const fullNumberScale = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const screen = Dimensions.get('window');


  // Мини-анимация иконки в таббаре при увеличении streak
      const playStreakBump = (newStreak: number) => {
      console.log('🔥 STREAK ANIMATION TRIGGERED! New streak:', newStreak);
      setCurrentStreak(newStreak);

      Vibration.vibrate(30);

      // Показать полноэкранный слой
      setFullCelebrationVisible(true);
      fullScale.setValue(0.8);
      fullOpacity.setValue(0);
      fullGlowOpacity.setValue(0);
      glowScale.setValue(1);

      // Вход: из нижней кнопки (масштабируясь) → к центру
      const startY = screen.height / 2 - (Platform.OS === 'ios' ? 40 + insets.bottom : 30);
      fullTranslateY.setValue(startY);
      fullScale.setValue(0.1);
      fullNumberScale.setValue(1);

      // Сброс частиц
      particles.forEach(p => {
        p.translateX.setValue(0);
        p.translateY.setValue(0);
        p.opacity.setValue(0);
        p.scale.setValue(0);
      });

      // Анимация частиц
      const particleAnimations = particles.map((p, i) => {
        const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + Math.random() * 0.2; // slight randomness in angle
        const radius = Math.random() * 300 + 400; // full-screen spread
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius;

        return Animated.sequence([
          Animated.delay(Math.random() * 200), // random delay for natural burst
          Animated.parallel([
            Animated.timing(p.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(p.scale, { toValue: Math.random() * 1.2 + 1.0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(p.translateX, { toValue: targetX, duration: 1600, useNativeDriver: true }),
            Animated.timing(p.translateY, { toValue: targetY, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }), // gravity-like
            Animated.timing(p.opacity, { toValue: 0, duration: 1600, delay: 400, useNativeDriver: true }), // fade later
          ]),
        ]);
      });

      // Общая анимация (медленнее)
      Animated.parallel([
        // Появление карточки
        Animated.sequence([
          Animated.parallel([
            Animated.timing(fullOpacity, { toValue: 1, duration: 450, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fullGlowOpacity, { toValue: 0.45, duration: 450, useNativeDriver: true }),
            Animated.timing(fullTranslateY, { toValue: 0, duration: 550, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(fullScale, { toValue: 1.0, duration: 550, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          ]),
          Animated.delay(2400), // общая задержка (1.2с + 1.2с)
          // Исчезновение карточки
          Animated.parallel([
            Animated.timing(fullOpacity, { toValue: 0, duration: 550, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
            Animated.timing(fullGlowOpacity, { toValue: 0, duration: 550, useNativeDriver: true }),
            Animated.timing(fullTranslateY, { toValue: startY, duration: 550, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
            Animated.timing(fullScale, { toValue: 0.1, duration: 550, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
          ])
        ]),
        // Анимация числа внутри паузы
        Animated.sequence([
          Animated.delay(1200), // первая пауза
          Animated.timing(fullNumberScale, { toValue: 1.15, duration: 180, useNativeDriver: true }),
          Animated.spring(fullNumberScale, { toValue: 1.0, friction: 5, tension: 70, useNativeDriver: true })
        ]),
        // Запуск частиц
        Animated.stagger(40, particleAnimations), // closer stagger for burst effect
      ]).start(() => {
        setFullCelebrationVisible(false);
        fullTranslateY.setValue(0);

        // Post-animation zoom on tab icon
        Animated.sequence([
          Animated.timing(streakScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(streakTranslateX, { toValue: -4, duration: 240, useNativeDriver: true }),
            Animated.timing(streakTranslateX, { toValue: 4, duration: 240, useNativeDriver: true }),
            Animated.timing(streakTranslateX, { toValue: -4, duration: 240, useNativeDriver: true }),
            Animated.timing(streakTranslateX, { toValue: 4, duration: 240, useNativeDriver: true }),
            Animated.timing(streakTranslateX, { toValue: 0, duration: 240, useNativeDriver: true }),
          ]),
          Animated.spring(streakScale, { toValue: 1.0, friction: 5, tension: 70, useNativeDriver: true })
        ]).start();
      });
    };

  // Регистрируем обработчик из контекста: экраны вызывают trigger(newStreak)
  useEffect(() => {
    console.log('🔥 TabNavigator: Registering streak animation handler');
    setHandler(playStreakBump);
  }, [setHandler]);

  // Load streak on mount and focus
  const loadStreak = async () => {
    const stats = await streakService.getAllStats();
    setCurrentStreak(stats.streak.currentStreak);
    setLongestStreak(stats.streak.longestStreak);
  };

  useEffect(() => {
    loadStreak();
    const interval = setInterval(loadStreak, 4000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [])
  );

  return (
    <>
      <Modal visible={fullCelebrationVisible} transparent animationType="none">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale: fullScale }, { translateY: fullTranslateY }], opacity: fullOpacity, width: '100%' }}>
            {/* Particles */}
            {particles.map((p, i) => (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: particleColors[i % particleColors.length],
                  transform: [
                    { translateX: p.translateX },
                    { translateY: p.translateY },
                    { scale: p.scale },
                  ],
                  opacity: p.opacity,
                }}
              />
            ))}
            
            {/* Card */}
            <Animated.View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255, 107, 107, 0.35)', opacity: fullGlowOpacity }} />
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: '100%', maxWidth: 340, borderRadius: 30, paddingVertical: 32, paddingHorizontal: 22, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>
              <MaterialIcons name="local-fire-department" size={72} color="#fff" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 10 }}>{t('profile.currentStreak')}</Text>
              <Animated.Text style={{ color: '#fff', fontSize: 84, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 8, transform: [{ scale: fullNumberScale }] }}>
                {currentStreak}
              </Animated.Text>
              <Text style={{ color: '#fff', fontSize: 16, marginTop: 2, opacity: 0.9 }}>
                {currentStreak === 1 ? t('profile.day') : t('profile.days')}
              </Text>
              <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.35)', marginVertical: 18 }} />
              <Text style={{ color: '#fff', fontSize: 15, opacity: 0.9 }}>{t('profile.longestStreak')}: {longestStreak}</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          backgroundColor: '#2C2C2E',
          borderRadius: 35,
          height: 70,
          paddingBottom: 5,
          paddingTop: 5,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
>

      <Tab.Screen
        name="Lessons"
        component={LessonsStackNavigator}
        options={{
          tabBarLabel: t('tabs.lessons'),
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Ionicons name="book" size={size} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Ionicons name="person" size={size} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: t('settings.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Ionicons name="settings-outline" size={size} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
          </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  streakIconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.8)',
  },
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.35)'
  },
  streakIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  activeTabShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default TabNavigator; 