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
import { MainStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../localization';
import RepetitionCountModal from '../../components/RepetitionCountModal';
import { lessonService } from '../../services/lessonService';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<MainStackParamList, 'Words'>;

interface WordItem {
  id?: number;
  number: number;  // Используем number из JSON
  english: string;
  translation?: string; // Это поле может быть не в JSON
  russian: string;    // Это поле из JSON
  example?: string;
  mastery?: number;
  repetitions: number;
  listSource?: string; // firstList или secondList
  isIrregularVerb: boolean;
}

// Define the WordsScreenRouteProp type if you need it
type WordsScreenRouteProp = RouteProp<MainStackParamList, 'Words'>;

// Добавить маппинг языка
const languageMap = { ru: 'russian', es: 'spanish', fr: 'french', de: 'german' };

// Skeleton component for loading state
const WordSkeletonCard = () => (
    <View style={styles.wordCardSkeleton}>
        <View style={styles.skeletonLeft}>
            <View style={[styles.skeletonLine, { width: '60%' }]} />
            <View style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]} />
        </View>
        <View style={styles.skeletonRight}>
            <View style={styles.skeletonProgressBar} />
            <View style={[styles.skeletonLine, { width: 50, height: 14, marginTop: 8 }]} />
        </View>
    </View>
);

interface WordCardProps {
  word: WordItem;
  onPress: (wordId: number) => void;
  targetRepetitions: number;
  renderMasteryBar: (mastery: number) => React.ReactNode;
  t: (key: string) => string;
  numericLessonId: number;
}

// Memoized WordCard component for performance
const WordCard = React.memo<WordCardProps>(({ word, onPress, targetRepetitions, renderMasteryBar, t, numericLessonId }) => {
  if (Platform.OS === 'android') {
    return (
      <TouchableOpacity
        style={styles.wordCardAndroidShadow}
        onPress={() => onPress(word.number)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#3B82F6', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.wordCardAndroidInner}
        >
          <View style={styles.wordContentAndroid}>
            <View style={styles.leftSectionAndroid}>
              <View style={styles.wordRowAndroid}>
                <Text style={styles.englishWordAndroid}>{word.english}</Text>
                <Text style={styles.translationWordAndroid}>{word.translation}</Text>
              </View>
              {numericLessonId === 1 && word.isIrregularVerb ? (
                <Text style={styles.exampleTextAndroid}>{t('words.irregularVerb')}</Text>
              ) : null}
            </View>
            <View style={styles.rightSectionAndroid}>
              <View style={styles.masterySectionAndroid}>
                {renderMasteryBar(word.mastery || 0)}
                <Text style={styles.masteryTextAndroid}>
                  {word.repetitions}/{targetRepetitions}
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
    style={styles.wordCard}
    onPress={() => onPress(word.number)}
  >
    <View style={styles.wordContent}>
      <View style={styles.leftSection}>
        <View style={styles.wordRow}>
          <Text style={styles.englishWord}>{word.english}</Text>
          <Text style={styles.translationWord}>{word.translation}</Text>
        </View>
        {numericLessonId === 1 && word.isIrregularVerb ? (
          <Text style={styles.exampleText}>{t('words.irregularVerb')}</Text>
        ) : null}
      </View>
      <View style={styles.rightSection}>
        <View style={styles.masterySection}>
          {renderMasteryBar(word.mastery || 0)}
          <Text style={styles.masteryText}>
            {word.repetitions}/{targetRepetitions}
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

const WordsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId, wordListType = 'firstList' } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [wordsData, setWordsData] = useState<WordItem[]>([]);
  const [targetRepetitions, setTargetRepetitions] = useState<number>(10);
  const [showRepetitionModal, setShowRepetitionModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [customRepetitions, setCustomRepetitions] = useState<string>('');
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  const { t, language } = useTranslation();
  const mappedLanguage = languageMap[language] || 'english';

  // Use the existing route params directly:
  const numericLessonId = parseInt(lessonId.toString(), 10);

  // Добавьте эти логи для отладки
  console.log('Current language:', language);
  console.log('Translation for irregularVerbsSection:', t('words.irregularVerbsSection'));
  console.log('Translation for irregularVerb:', t('words.irregularVerb'));

  // Загрузка данных слов из JSON
  const loadJsonData = async () => {
    try {
      setLoading(true);
      
      // Преобразуем lessonId в число
      const numericLessonId = Number(lessonId);
      
      console.log("Loading vocabulary for lesson:", numericLessonId);
      
      // Добавляем обработку ошибок, если данные для этого урока недоступны
      try {
        const vocabularyData = await lessonService.getLessonVocabulary(numericLessonId);
        
        if (vocabularyData && 
            vocabularyData.allWords && 
            vocabularyData.allWords.length > 0) {
          
          console.log("Processing words, total:", vocabularyData.allWords.length);
          console.log("Current wordListType:", wordListType);
          
          // Filter words based on wordListType parameter
          const filteredWords = vocabularyData.allWords.filter((word: any) => {
            // If we're on the Irregular Verbs screen, show only secondList
            // If we're on the regular Words screen, show only firstList
            return word.listSource === wordListType;
          });
          
          console.log("Filtered words count:", filteredWords.length);
          
          // Get current language from context
          const currentLanguage = language || 'russian'; // Default to Russian
          console.log("Current language:", currentLanguage);
          
          // Format the filtered words for display
          const formattedWords = filteredWords.map((word: any) => {
            console.log('Formatting word:', word);
            // Get translation based on selected language
            const translation = word[mappedLanguage] || word.english;
            
            // Only show "неправильный глагол" label for lesson 1
            const showIrregularVerbLabel = numericLessonId === 1 && word.listSource === 'secondList';
            
            return {
              id: word.number,
              number: word.number,
              english: word.english,
              russian: word.russian,
              translation: translation,
              repetitions: 0,
              mastery: 0,
              // Only add example for irregular verbs in lesson 1
              example: showIrregularVerbLabel ? t('words.irregularVerb') : "",
              isIrregularVerb: word.listSource === 'secondList',
              listSource: word.listSource
            };
          });
          
          console.log("Formatted words count:", formattedWords.length);
          
          setWordsData(formattedWords);
          
          // Сохраняем общее количество слов для этого урока
          await AsyncStorage.setItem(`wordCount_lesson${numericLessonId}`, filteredWords.length.toString());
        } else {
          setWordsData([]);
          console.log('No vocabulary data for this lesson');
        }
      } catch (err) {
        // Для уроков помимо первого просто показываем пустой список
        console.log(`Lesson ${numericLessonId} has no vocabulary data:`, err);
        setWordsData([]);
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
        setWordsData([]);
      }
    }
  };
  
  // Обновленная функция для генерации примеров с учетом языка
  const getExampleForWord = (word: string, language: string = 'russian'): string => {
    // Примеры на разных языках
    const examples: Record<string, Record<string, string>> = {
      russian: {
        "I": "Я студент.",
        "you": "Ты очень умный.",
        "he": "Он работает в офисе.",
        "she": "Она изучает английский.",
        "it": "Это интересная книга.",
        "we": "Мы друзья.",
        "they": "Они живут в Нью-Йорке.",
        "go": "Я хожу в школу каждый день.",
        "read": "Она читает книги вечером.",
        // Добавьте другие примеры
      },
      english: {
        "I": "I am a student.",
        "you": "You are very smart.",
        "he": "He works at the office.",
        "she": "She studies English.",
        "it": "It is an interesting book.",
        "we": "We are friends.",
        "they": "They live in New York.",
        "go": "I go to school every day.",
        "read": "She reads books in the evening.",
        // Добавьте другие примеры
      },
      spanish: {
        "I": "Soy estudiante.",
        "you": "Eres muy inteligente.",
        "he": "Él trabaja en la oficina.",
        "she": "Ella estudia inglés.",
        "it": "Es un libro interesante.",
        "we": "Somos amigos.",
        "they": "Ellos viven en Nueva York.",
        "go": "Voy a la escuela todos los días.",
        "read": "Ella lee libros por la noche.",
        // Добавьте другие примеры
      },
      french: {
        "I": "Je suis étudiant.",
        "you": "Tu es très intelligent.",
        "he": "Il travaille au bureau.",
        "she": "Elle étudie l'anglais.",
        "it": "C'est un livre intéressant.",
        "we": "Nous sommes amis.",
        "they": "Ils vivent à New York.",
        "go": "Je vais à l'école tous les jours.",
        "read": "Elle lit des livres le soir.",
        // Добавьте другие примеры
      },
      german: {
        "I": "Ich bin ein Student.",
        "you": "Du bist sehr klug.",
        "he": "Er arbeitet im Büro.",
        "she": "Sie lernt Englisch.",
        "it": "Es ist ein interessantes Buch.",
        "we": "Wir sind Freunde.",
        "they": "Sie leben in New York.",
        "go": "Ich gehe jeden Tag zur Schule.",
        "read": "Sie liest abends Bücher.",
        // Добавьте другие примеры
      }
    };
    
    // Получаем примеры для выбранного языка, или для русского по умолчанию
    const langExamples = examples[language.toLowerCase()] || examples.russian;
    
    return langExamples[word] || `Example with "${word}".`;
  };

  // Модифицированная функция loadSavedProgress
  const loadSavedProgress = async (currentTarget?: number) => {
    try {
      // Важно! Получаем актуальное значение targetRepetitions из AsyncStorage
      let repetitionTarget = currentTarget;
      
      if (!repetitionTarget) {
        const savedTarget = await AsyncStorage.getItem(`targetRepetitions_lesson${lessonId}`);
        repetitionTarget = savedTarget ? parseInt(savedTarget, 10) : targetRepetitions;
      }
      
      // Загружаем прогресс из AsyncStorage
      const savedProgress = await AsyncStorage.getItem(`wordRepetitions_lesson${lessonId}`);
      
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        console.log('Loaded progress:', parsedProgress, 'Target:', repetitionTarget);
        
        // Обновляем состояние с новым прогрессом
        setWordsData(currentWords => 
          currentWords.map(word => {
            const progress = parsedProgress[word.number] || { repetitions: 0 };
            
            // Используем обновленное значение targetRepetitions для вычисления mastery
            return {
              ...word,
              repetitions: progress.repetitions,
              // Важно! Всегда используем актуальное значение для вычисления прогресса
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
      console.error('Error loading progress:', error);
    }
  };

  // Модифицированная функция loadTargetRepetitions
  const loadTargetRepetitions = async () => {
    try {
      const savedTarget = await AsyncStorage.getItem(`targetRepetitions_lesson${lessonId}`);
      if (savedTarget) {
        const value = parseInt(savedTarget, 10);
        setTargetRepetitions(value);
        // Перезагружаем прогресс с новым целевым значением
        await loadSavedProgress(value);
      }
    } catch (error) {
      console.error('Error loading target repetitions:', error);
    }
  };

  // Обновите useEffect для загрузки начальных данных
  useEffect(() => {
    // Добавляем слушатель фокуса для обновления прогресса
    const unsubscribe = navigation.addListener('focus', () => {
      // При возвращении на экран полностью перезагружаем прогресс
      loadSavedProgress();
    });

    // Загружаем начальные данные
    const loadInitialData = async () => {
      await loadJsonData();
      await loadTargetRepetitions(); // Загружаем целевое значение и прогресс
    };
    
    loadInitialData();

    return () => unsubscribe();
  }, [navigation, lessonId]);

  // Обновляем useEffect для обработки изменения языка
  useEffect(() => {
    console.log("Language changed to:", language);
    const reloadData = async () => {
      await loadJsonData();
      await loadSavedProgress();
    };
    reloadData();
  }, [language]);

  const handleWordPress = (wordId: number) => {
    console.log('Pressing word:', wordId);
    const selectedWord = wordsData.find(word => word.number === wordId);
    
    if (selectedWord) {
      console.log('Selected word details:', {
        id: selectedWord.number,
        english: selectedWord.english,
        repetitions: selectedWord.repetitions,
        mastery: selectedWord.mastery
      });
      
      navigation.navigate('RepeatCounting', { 
        lessonId,
        itemId: selectedWord.number,
        itemType: 'word',
        targetRepetitions
      });
    } else {
      console.error('Word not found:', wordId);
    }
  };

  // Добавляем функцию для рендера прогресс бара
  const renderMasteryBar = (mastery: number) => {
    const progressWidth = Math.min(Math.max(mastery, 0), 100);
    
    return (
      <View style={styles.masteryBarContainer}>
        <LinearGradient
          colors={['#3B82F6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.masteryBar,
            { width: `${progressWidth}%` }
          ]}
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

  // Также обновим функцию saveTargetRepetitions
  const saveTargetRepetitions = async (value: number) => {
    try {
      if (value <= 0) {
        Alert.alert(t('repetitions.invalidInput'), t('repetitions.enterPositiveNumber'));
        return;
      }
      
      await AsyncStorage.setItem(`targetRepetitions_lesson${lessonId}`, value.toString());
      setTargetRepetitions(value);
      
      // После изменения целевого значения сразу же обновляем отображение mastery для всех слов
      setWordsData(currentWords => 
        currentWords.map(word => ({
          ...word,
          // Пересчитываем mastery с новым целевым значением
          mastery: (word.repetitions / value) * 100
        }))
      );
      
      setShowRepetitionModal(false);
    } catch (error) {
      console.error('Error saving target repetitions:', error);
    }
  };

  const handleCustomRepetitions = () => {
    const value = parseInt(customRepetitions, 10);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number');
      return;
    }
    saveTargetRepetitions(value);
  };

  // Отображение загрузки со скелетоном
  if (loading) {
    return (
      <LinearGradient
        colors={['#581C87', '#111827', '#1F2937']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
          {/* Header Background */}
          <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
          
          {/* Header */}
          <View style={styles.navigationHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{`${t('lessons.words')}`}</Text>
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
              <View style={styles.repetitionInfo}>
                <Text style={styles.repetitionText}>
                  {t('words.pressTheButton')} <Ionicons name="repeat" size={18} color="#D1D5DB" />
                </Text>
              </View>
              {/* Skeleton Cards */}
              {Array.from({ length: 8 }).map((_, index) => <WordSkeletonCard key={index} />)}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const getScreenTitle = () => {
    // If we're on the Past Participle screen of lesson 14
    if (numericLessonId === 14 && wordListType === 'secondList') {
      return getPastParticipleTranslation(language) + (wordsData.length > 0 ? ` (${wordsData.length})` : '');
    }
    // If we're on the phrasal verbs screen of lesson 16
    else if (numericLessonId === 16 && wordListType === 'secondList') {
      return getPhrasalVerbsTranslation(language) + (wordsData.length > 0 ? ` (${wordsData.length})` : '');
    }
    // If we're on the irregular verbs screen of lesson 1
    else if (numericLessonId === 1 && wordListType === 'secondList') {
      return t('words.irregularVerbsSection') + (wordsData.length > 0 ? ` (${wordsData.length})` : '');
    }
    // Otherwise it's regular words
    else {
      return `${t('lessons.words')} (${wordsData.length})`;
    }
  };

  const getPhrasalVerbsTranslation = (language: string): string => {
    switch (language) {
      case 'russian':
        return 'Фразовые глаголы';
      case 'spanish':
        return 'Verbos Frasales';
      case 'french':
        return 'Verbes à Particule';
      case 'german':
        return 'Phrasal Verben';
      default:
        return 'Phrasal Verbs';
    }
  };

  const getPastParticipleTranslation = (language: string): string => {
    switch (language) {
      case 'russian':
        return 'Третья форма глагола';
      case 'spanish':
        return 'Participio Pasado';
      case 'french':
        return 'Participe Passé';
      case 'german':
        return 'Partizip Perfekt';
      default:
        return 'Past Participle';
    }
  };

  return (
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
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
            <Text style={styles.headerTitle}>
              {getScreenTitle()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowRepetitionModal(true)}
          >
            <Ionicons name="repeat" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={wordsData}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.number.toString()}
          ListHeaderComponent={
            <View style={styles.repetitionInfo}>
              <Text style={styles.repetitionText}>
                {t('words.pressTheButton')} <Ionicons name="repeat" size={18} color="#D1D5DB" />
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <WordCard
              word={item}
              onPress={handleWordPress}
              targetRepetitions={targetRepetitions}
              renderMasteryBar={renderMasteryBar}
              t={t}
              numericLessonId={numericLessonId}
            />
          )}
          ListEmptyComponent={
            <View style={styles.noWordsContainer}>
              <Text style={styles.noWordsText}>No words available for this lesson</Text>
            </View>
          }
        />
        <RepetitionCountModal
          visible={showRepetitionModal}
          onClose={() => setShowRepetitionModal(false)}
          onSelectCount={saveTargetRepetitions}
          targetRepetitions={targetRepetitions}
          itemType="word"
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
  repetitionInfo: {
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  repetitionText: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordsList: {
    gap: 16,
  },
  wordCard: {
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
  wordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  leftSection: {
    gap: 8,
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  englishWord: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  translationWord: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  exampleText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  masterySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  masteryBarContainer: {
    width: 80,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  masteryBar: {
    height: '100%',
    borderRadius: 2,
  },
  masteryText: {
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
  noWordsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noWordsText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  irregularVerbSeparator: {
    marginVertical: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  irregularVerbTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  irregularVerbText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // --- Android styles for word cards ---
  wordCardAndroidShadow: {
    borderRadius: 20,
    marginBottom: 12,
    elevation: 8,
  },
  wordCardAndroidInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  wordContentAndroid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  leftSectionAndroid: {
    gap: 8,
    flex: 1,
  },
  rightSectionAndroid: {
    alignItems: 'flex-end',
    gap: 8,
  },
  wordRowAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  englishWordAndroid: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  translationWordAndroid: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  exampleTextAndroid: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  masterySectionAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  masteryTextAndroid: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  arrowIconAndroid: {
    marginTop: 8,
  },
  wordCardSkeleton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonLeft: {
    flex: 1,
  },
  skeletonRight: {
      alignItems: 'flex-end',
  },
  skeletonLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 18,
    borderRadius: 4,
  },
  skeletonProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
});

export default WordsScreen; 