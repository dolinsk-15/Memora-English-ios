import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StreakAnimationProps {
  visible: boolean;
  newStreak: number;
  onAnimationComplete: () => void;
  tabBarHeight?: number;
}

const StreakAnimation: React.FC<StreakAnimationProps> = ({
  visible,
  newStreak,
  onAnimationComplete,
  tabBarHeight = 80,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  // Убрали вращение, делаем более спокойную анимацию
  // const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Сбрасываем анимации
      scaleAnim.setValue(0);
      translateYAnim.setValue(screenHeight - tabBarHeight);
      opacityAnim.setValue(0);

      // Запускаем последовательность анимаций
      Animated.sequence([
        // Появление и движение вверх
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: screenHeight / 2 - 100,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.6,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        // Пауза
        Animated.delay(1200),
        // Возвращение обратно
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: screenHeight - tabBarHeight,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.4,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.85,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete();
      });
    }
  }, [visible]);

  if (!visible) return null;

  // Убрали вращение

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name="local-fire-department" size={48} color="#FF6B6B" />
        <Text style={styles.streakNumber}>{newStreak}</Text>
        <Text style={styles.streakText}>🔥 Streak! 🔥</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: screenWidth / 2 - 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -6,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 2,
  },
});

export default StreakAnimation; 