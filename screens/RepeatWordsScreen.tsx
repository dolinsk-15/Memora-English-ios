import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import WordCard from '../components/WordCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../src/navigation/types';

// Определяем тип для параметров маршрута
type RepeatCountingRouteProp = RouteProp<MainStackParamList, 'RepeatCounting'>;

const RepeatWordsScreen = () => {
  const route = useRoute<RepeatCountingRouteProp>();
  const navigation = useNavigation();
  const { lessonId, itemId = 0, targetRepetitions = 10 } = route.params;
  const [repetitions, setRepetitions] = useState(0);
  
  // Обновленная загрузка при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        // Сначала загружаем целевое значение повторений для этого урока
        const savedTarget = await AsyncStorage.getItem(`targetRepetitions_lesson${lessonId}`);
        // Обновляем локальную переменную targetReps с учетом загруженного значения
        let targetReps = targetRepetitions;
        if (savedTarget) {
          targetReps = parseInt(savedTarget, 10);
        }
        
        // Затем загружаем прогресс текущего слова
        const savedProgress = await AsyncStorage.getItem(`wordRepetitions_lesson${lessonId}`);
        if (savedProgress && itemId !== undefined) {
          const parsedProgress = JSON.parse(savedProgress);
          // Проверяем, что itemId существует и что соответствующий объект есть в parsedProgress
          if (parsedProgress && parsedProgress[itemId]) {
            setRepetitions(parsedProgress[itemId].repetitions || 0);
          }
        }
      } catch (error) {
        console.error('Error loading word data:', error);
      }
    };
    
    loadData();
  }, [lessonId, itemId, targetRepetitions]);
  
  // Функция для обновления прогресса
  const handleRepetitionComplete = async () => {
    const newRepetitions = repetitions + 1;
    setRepetitions(newRepetitions);
    
    try {
      // Проверяем, что itemId определен
      if (itemId === undefined) {
        console.error('Item ID is undefined');
        return;
      }
      
      // Загружаем текущий прогресс для всех слов
      const savedProgress = await AsyncStorage.getItem(`wordRepetitions_lesson${lessonId}`);
      const parsedProgress: Record<number, { repetitions: number }> = 
        savedProgress ? JSON.parse(savedProgress) : {};
      
      // Обновляем прогресс для текущего слова (с проверкой на существование)
      parsedProgress[itemId] = {
        ...((parsedProgress[itemId] as any) || {}),
        repetitions: newRepetitions
      };
      
      // Сохраняем обновленный прогресс
      await AsyncStorage.setItem(
        `wordRepetitions_lesson${lessonId}`,
        JSON.stringify(parsedProgress)
      );
      
      // Если достигли целевого количества повторений, показываем сообщение
      // targetRepetitions уже имеет дефолтное значение 10, так что эта проверка безопасна
      if (newRepetitions >= targetRepetitions) {
        // Можно добавить уведомление о завершении
      }
    } catch (error) {
      console.error('Error saving word progress:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WordCard 
        word="I" 
        translation="Я"
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRepetitionComplete}
      >
        <Text style={styles.buttonText}>Произнесите и нажмите</Text>
      </TouchableOpacity>
      <Text style={styles.repetitionCount}>{repetitions} / {targetRepetitions} повторений</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  repetitionCount: {
    marginTop: 20,
    color: 'white',
    fontSize: 16,
  },
});

export default RepeatWordsScreen; 