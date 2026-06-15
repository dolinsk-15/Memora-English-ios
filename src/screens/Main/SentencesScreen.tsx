import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../localization';
import RepetitionCountModal from '../../components/RepetitionCountModal';
import { lessonService } from '../../services/lessonService';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<LessonsStackParamList, 'Sentences'>;

interface SentenceItem {
  id: number;
  english: string;
  translation?: string;
  russian?: string;
  mastery?: number;
  timesReviewed?: number;
  totalReviews?: number;
  repetitions: number;
}

// Добавить маппинг языка
const languageMap = { ru: 'russian', es: 'spanish', fr: 'french', de: 'german' };

// Skeleton component for loading state
const SentenceSkeletonCard = () => (
    <View style={styles.sentenceCardSkeleton}>
        <View style={styles.skeletonLeft}>
            <View style={[styles.skeletonLine, { width: '80%' }]} />
            <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
        </View>
        <View style={styles.skeletonRight}>
            <View style={styles.skeletonProgressBar} />
            <View style={[styles.skeletonLine, { width: 50, height: 14, marginTop: 8 }]} />
        </View>
    </View>
);

interface SentenceCardProps {
  sentence: SentenceItem;
  onPress: (sentenceId: number) => void;
  targetRepetitions: number;
  renderRepetitionBar: (sentence: SentenceItem) => React.ReactNode;
}

// Memoized SentenceCard component for performance
const SentenceCard = React.memo<SentenceCardProps>(({ sentence, onPress, targetRepetitions, renderRepetitionBar }) => {
  if (Platform.OS === 'android') {
    return (
      <TouchableOpacity
        style={styles.sentenceCardAndroidShadow}
        onPress={() => onPress(sentence.id)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#3B82F6', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sentenceCardAndroidInner}
        >
          <View style={styles.sentenceContentAndroid}>
            <View style={styles.leftSectionAndroid}>
              <Text style={styles.englishSentenceAndroid}>{sentence.english}</Text>
              <Text style={styles.translatedSentenceAndroid}>{sentence.translation}</Text>
            </View>
            <View style={styles.rightSectionAndroid}>
              <View style={styles.progressSectionAndroid}>
                {renderRepetitionBar(sentence)}
                <Text style={styles.progressTextAndroid}>
                  {sentence.repetitions}/{targetRepetitions}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#D1D5DB" 
                style={styles.arrowIconAndroid}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  // iOS: keep as is
  return (
  <TouchableOpacity
    style={styles.sentenceCard}
    onPress={() => onPress(sentence.id)}
  >
    <View style={styles.sentenceContent}>
      <View style={styles.leftSection}>
        <Text style={styles.englishSentence}>{sentence.english}</Text>
          <Text style={styles.translatedSentence}>{sentence.translation}</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.progressSection}>
          {renderRepetitionBar(sentence)}
          <Text style={styles.progressText}>
            {sentence.repetitions}/{targetRepetitions}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#D1D5DB" 
          style={styles.arrowIcon}
        />
      </View>
    </View>
  </TouchableOpacity>
  );
});

const SentencesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [sentencesData, setSentencesData] = useState<SentenceItem[]>([]);
  const [targetRepetitions, setTargetRepetitions] = useState<number>(10);
  const [showRepetitionModal, setShowRepetitionModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { t, language } = useTranslation();
  const mappedLanguage = languageMap[language] || 'english';

  // Загрузка данных предложений из JSON
  const loadJsonData = async () => {
    try {
      setLoading(true);
      
      // Преобразуем lessonId в число
      const numericLessonId = Number(lessonId);
      
      console.log("Loading sentences for lesson:", numericLessonId);
      
      // Используем lessonService вместо прямого импорта
      try {
        // Используем сервис для загрузки предложений
        const sentencesFromService = await lessonService.getLessonSentences(numericLessonId);
        
        if (sentencesFromService && sentencesFromService.length > 0) {
          // Получаем текущий язык из контекста перевода
          console.log("Current language for sentences:", mappedLanguage);
          
          // Преобразуем данные в формат, ожидаемый компонентом
          const formattedSentences = sentencesFromService.map((sentence: any) => {
            // Получаем перевод предложения в зависимости от выбранного языка
            const translation = sentence[mappedLanguage] || sentence.english;
            
            return {
              id: sentence.id,
              english: sentence.english,
              russian: sentence.russian, // Сохраняем для совместимости
              // Используем перевод на выбранном языке
              translation: translation,
              timesReviewed: 0,
              totalReviews: 10,
              repetitions: 0
            };
          });
          
          console.log("Formatted sentences count:", formattedSentences.length);
          
          setSentencesData(formattedSentences);
          
          // Сохраняем общее количество предложений для этого урока
          await AsyncStorage.setItem(`sentenceCount_lesson${numericLessonId}`, formattedSentences.length.toString());
        } else {
          setSentencesData([]);
          console.log('No sentences data for this lesson');
        }
      } catch (err) {
        console.log(`Lesson ${numericLessonId} has no sentences data:`, err);
        setSentencesData([]);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading JSON data:', error, error.stack);
      setLoading(false);
      
      // Показываем сообщение об ошибке только для первого урока
      if (Number(lessonId) === 1) {
        Alert.alert(
          'Loading Error',
          `There was a problem loading the lesson data: ${error.message || 'Unknown error'}`
        );
      } else {
        // Для других уроков просто устанавливаем пустой список
        setSentencesData([]);
      }
    }
  };

  // Загрузка сохраненного прогресса
  const loadSavedProgress = async (currentTarget?: number) => {
    try {
      // Получаем актуальное значение targetRepetitions
      let repetitionTarget = currentTarget;
      
      if (!repetitionTarget) {
        const savedTarget = await AsyncStorage.getItem(`sentenceRepetitions_lesson${lessonId}`);
        repetitionTarget = savedTarget ? parseInt(savedTarget, 10) : targetRepetitions;
      }
      
      // Загружаем прогресс из AsyncStorage
      const savedProgress = await AsyncStorage.getItem(`sentenceData_lesson${lessonId}`);
      
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        console.log('Loaded sentence progress:', parsedProgress, 'Target:', repetitionTarget);
        
        // Обновляем состояние с новым прогрессом
        setSentencesData(currentSentences => 
          currentSentences.map(sentence => {
            const progress = parsedProgress[sentence.id] || { repetitions: 0 };
            
            return {
              ...sentence,
              repetitions: progress.repetitions,
              // Добавляем расчет mastery как в WordsScreen
              mastery: (progress.repetitions / repetitionTarget) * 100
            };
          })
        );
        
        // Обновляем значение targetRepetitions в состоянии компонента
        if (repetitionTarget !== targetRepetitions) {
          setTargetRepetitions(repetitionTarget);
        }
      }
    } catch (error) {
      console.error('Error loading sentence progress:', error);
    }
  };

  // Загрузка данных при первом рендере
  useEffect(() => {
    const loadData = async () => {
      await loadJsonData();
      await loadSavedProgress();
    };
    
    loadData();
    
    // Создаем слушатель фокуса, который будет вызываться при возвращении на экран
    const unsubscribe = navigation.addListener('focus', () => {
      // При возвращении на экран загружаем только прогресс, не перезагружая весь список предложений
      loadSavedProgress();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, lessonId, language]);

  // Обновление при смене языка
  useEffect(() => {
    // Перезагружаем данные при смене языка
    console.log("Language changed to:", language);
    loadJsonData();
  }, [language]);
  
  // Обновление данных после загрузки предложений
  useEffect(() => {
    if (sentencesData.length > 0) {
      loadSavedProgress();
    }
  }, [sentencesData.length]);

  const renderRepetitionBar = (sentence: SentenceItem) => {
    const progress = sentence.mastery || 0;
    return (
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#3B82F6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progress}%` }]}
        />
      </View>
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  const handleSentencePress = (sentenceId: number) => {
    navigation.navigate('RepeatCounting', { 
      lessonId,
      itemId: sentenceId,
      itemType: 'sentence',
      targetRepetitions,
      onProgressUpdate: () => {
        // Обновляем прогресс сразу при изменении
        loadSavedProgress();
      }
    });
  };

  const saveTargetRepetitions = async (value: number) => {
    try {
      if (value <= 0) {
        Alert.alert('Invalid Input', 'Please enter a positive number');
        return;
      }
      await AsyncStorage.setItem(`sentenceRepetitions_lesson${lessonId}`, value.toString());
      setTargetRepetitions(value);
      setShowRepetitionModal(false);
    } catch (error) {
      console.error('Error saving target repetitions:', error);
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            {/* Header */}
            <View style={styles.navigationHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t('lessons.sentences')}</Text>
                </View>
                <TouchableOpacity style={styles.settingsButton} onPress={() => setShowRepetitionModal(true)}>
                    <Ionicons name="repeat" size={24} color="#D1D5DB" />
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentContainer}>
                    {/* Skeleton Cards */}
                    {Array.from({ length: 8 }).map((_, index) => <SentenceSkeletonCard key={index} />)}
                </View>
            </ScrollView>
        </SafeAreaView>
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
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Header Background */}
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        
        {/* Header */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('lessons.sentences')} ({sentencesData.length})</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowRepetitionModal(true)}
          >
            <Ionicons name="repeat" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={sentencesData}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SentenceCard
              sentence={item}
              onPress={handleSentencePress}
              targetRepetitions={targetRepetitions}
              renderRepetitionBar={renderRepetitionBar}
            />
          )}
          ListEmptyComponent={
            <View style={styles.noSentencesContainer}>
              <Text style={styles.noSentencesText}>No sentences available for this lesson</Text>
            </View>
          }
        />
        <RepetitionCountModal
          visible={showRepetitionModal}
          onClose={() => setShowRepetitionModal(false)}
          onSelectCount={saveTargetRepetitions}
          targetRepetitions={targetRepetitions}
          itemType="sentence"
        />
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
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#581C87',
    zIndex: 1,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 44,
    zIndex: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 44,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
  },
  sentencesList: {
    gap: 16,
  },
  sentenceCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sentenceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  englishSentence: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  translatedSentence: {
    fontSize: 15,
    color: '#D1D5DB',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  progressBarContainer: {
    width: 80,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  arrowIcon: {
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 24,
    textAlign: 'center',
  },
  repetitionOptions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  repetitionOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  selectedRepetitionOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3B82F6',
  },
  repetitionOptionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedRepetitionOptionText: {
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  closeButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add new styles for custom input
  customRepetitionContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    width: '100%',
  },
  customRepetitionButton: {
    alignItems: 'center',
  },
  customInputContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customInput: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: 'white',
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  customInputButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  customInputButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Добавляем новые стили для загрузки и пустого состояния
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  noSentencesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noSentencesText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  // --- Android styles for sentence cards ---
  sentenceCardAndroidShadow: {
    borderRadius: 20,
    marginBottom: 12,
    elevation: 8,
  },
  sentenceCardAndroidInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sentenceContentAndroid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftSectionAndroid: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  rightSectionAndroid: {
    alignItems: 'flex-end',
    gap: 8,
  },
  englishSentenceAndroid: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  translatedSentenceAndroid: {
    fontSize: 15,
    color: '#D1D5DB',
  },
  progressSectionAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  progressTextAndroid: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  arrowIconAndroid: {
    marginTop: 8,
  },
  sentenceCardSkeleton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonLeft: {
    flex: 1,
    paddingRight: 16,
  },
  skeletonRight: {
      alignItems: 'flex-end',
      gap: 8,
  },
  skeletonLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 16,
    borderRadius: 4,
  },
  skeletonProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
});

export default SentencesScreen; 