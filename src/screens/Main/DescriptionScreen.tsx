import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импортируем данные уроков
import lesson1Data from '../../../data/lessons/lesson1.json';
import lesson2Data from '../../../data/lessons/lesson2.json';
import lesson3Data from '../../../data/lessons/lesson3.json';
import lesson4Data from '../../../data/lessons/lesson4.json';
import lesson5Data from '../../../data/lessons/lesson5.json';
import lesson6Data from '../../../data/lessons/lesson6.json';
import lesson7Data from '../../../data/lessons/lesson7.json';
import lesson8Data from '../../../data/lessons/lesson8.json';
import lesson9Data from '../../../data/lessons/lesson9.json';
import lesson10Data from '../../../data/lessons/lesson10.json';
import lesson11Data from '../../../data/lessons/lesson11.json';
import lesson12Data from '../../../data/lessons/lesson12.json';
import lesson13Data from '../../../data/lessons/lesson13.json';
import lesson14Data from '../../../data/lessons/lesson14.json';
import lesson15Data from '../../../data/lessons/lesson15.json';
import lesson16Data from '../../../data/lessons/lesson16.json';
import lesson17Data from '../../../data/lessons/lesson17.json';
import lesson18Data from '../../../data/lessons/lesson18.json';

// Интерфейсы для типизации
interface LessonDescription {
  english: string;
  russian: string;
  spanish: string;
  french: string;
  german: string;
}

// Новые интерфейсы для обновленной структуры данных
interface TableData {
  headers: string[];
  rows: string[][];
}

interface ListItem {
  title?: string;
  subitems?: string[];
}

interface Section {
  type: string;
  content?: string;
  items?: string[] | ListItem[];
  headers?: string[];
  rows?: string[][];
}

interface DetailedDescription {
  russian?: {
    title: string;
    sections: Section[];
  };
  english?: {
    title: string;
    sections: Section[];
  };
  spanish?: {
    title: string;
    sections: Section[];
  };
  french?: {
    title: string;
    sections: Section[];
  };
  german?: {
    title: string;
    sections: Section[];
  };
}

interface LessonData {
  id: number;
  title: {
    english: string;
    russian: string;
    spanish: string;
    french: string;
    german: string;
  };
  description?: LessonDescription;
  detailedDescription?: DetailedDescription;
  // Другие поля
}

type Props = NativeStackScreenProps<MainStackParamList, 'Description'>;
type Language = 'english' | 'russian' | 'spanish' | 'french' | 'german';

const DescriptionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Если библиотека i18next не установлена, просто используем переменную состояния
  const [currentLanguage, setCurrentLanguage] = useState<Language>('russian'); // По умолчанию русский для тестирования

  // Получаем данные урока в зависимости от ID
  const getLessonData = (id: number): LessonData => {
    switch (id) {
      case 1:
        return lesson1Data as LessonData;
      case 2:
        return lesson2Data as LessonData;
      case 3:
        return lesson3Data as LessonData;
      case 4:
        return lesson4Data as LessonData;
      case 5:
        return lesson5Data as LessonData;
      case 6:
        return lesson6Data as LessonData;
      case 7:
        return lesson7Data as LessonData;
      case 8:
        return lesson8Data as LessonData;
      case 9:
        return lesson9Data as LessonData;
      case 10:
        return lesson10Data as LessonData;
      case 11:
        return lesson11Data as LessonData;
      case 12:
        return lesson12Data as LessonData;
      case 13:
        return lesson13Data as LessonData;
      case 14:
        return lesson14Data as LessonData;
      case 15:
        return lesson15Data as LessonData;
      case 16:
        return lesson16Data as LessonData;
      case 17:
        return lesson17Data as LessonData;
      case 18:
        return lesson18Data as LessonData;
      default:
        return lesson1Data as LessonData;
    }
  };

  const lessonData = getLessonData(lessonId);

  // Получаем локализованное название урока
  const getLocalizedLessonName = (): string => {
    const translations: Record<Language, string> = {
      english: `Lesson ${lessonId}`,
      russian: `Урок ${lessonId}`,
      spanish: `Lección ${lessonId}`,
      french: `Leçon ${lessonId}`,
      german: `Lektion ${lessonId}`
    };
    
    return translations[currentLanguage] || translations.english;
  };

  // Отслеживаем изменение языка
  useEffect(() => {
    const checkLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user_language');
        if (savedLanguage && ['english', 'russian', 'spanish', 'french', 'german'].includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error fetching language:', error);
      }
    };
    
    checkLanguage();
  }, []);

  // Mark description as viewed
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        await AsyncStorage.setItem(`description_viewed_lesson${lessonId}`, 'true');
      } catch (error) {
        console.error('Error marking description as viewed:', error);
      }
    };
    
    markAsViewed();
  }, [lessonId]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  // Рендеринг таблицы
  const renderTable = (table: TableData, index: number) => {
    // Detect first table in lesson 3 (to be conjugation table)
    // It will have specific patterns like "Will I be", "Am I", "Was I" etc.
    const isToBeConjugationTable = lessonId === 3 && table.rows.some(row => 
      row.some(cell => 
        (cell.includes('Will I be') || cell.includes('Am I') || cell.includes('Was I')) ||
        // Spanish equivalents
        (cell.includes('¿Seré?') || cell.includes('¿Soy?') || cell.includes('¿Era?')) ||
        // German equivalents
        (cell.includes('Werde ich sein') || cell.includes('Bin ich') || cell.includes('War ich'))
      )
    );
    
    // Check if this is the tenses table (first table in lesson 1)
    const isTensesTable = lessonId === 1 && table.rows.some(row => 
      row.some(cell => 
        // English patterns for the first table
        cell.includes('Will I') || 
        cell.includes('Do I') || 
        cell.includes('Did I') ||
        // Spanish equivalents
        cell.includes('¿Amaré?') ||
        // French equivalents
        cell.includes('Est-ce que j\'aimerai') ||
        // German equivalents
        cell.includes('Werde ich')
      )
    );
    
    // Apply purple lines only to the first table in lesson 1 (tenses table)
    // Убираем применение фиолетовых границ для таблиц to be в уроке 3
    const isPurpleTable = isTensesTable; // Убираем isToBeConjugationTable из условия
    
    return (
      <View key={index} style={styles.tableContainer}>
        <View style={styles.tableHeaderRow}>
          {table.headers.map((header, headerIndex) => (
            <View 
              key={headerIndex} 
              style={[
                styles.tableHeaderCell,
                isPurpleTable && headerIndex === 0 ? { borderRightColor: '#8B5CF6', borderRightWidth: 4 } : null,
                isPurpleTable && headerIndex === 1 ? { borderRightColor: '#8B5CF6', borderRightWidth: 4 } : null
              ]}
            >
              <Text style={styles.tableHeaderText}>
                {header.split('\n').map((line, i) => (
                  <Text key={i}>
                    {line}
                    {i === 0 ? '\n' : ''}
                  </Text>
                ))}
              </Text>
            </View>
          ))}
        </View>
        {table.rows.map((row, rowIndex) => {
          // Меняем здесь: больше не используем фиолетовые разделители для горизонтальных линий
          // const isTimeDivider = isPurpleTable && (rowIndex === 5 || rowIndex === 11);
          return (
            <View 
              key={rowIndex} 
              // Используем всегда обычный стиль строки вместо стиля разделителя
              style={styles.tableRow}
            >
              {row.map((cell, cellIndex) => (
                <View 
                  key={cellIndex} 
                  style={[
                    styles.tableCell,
                    isPurpleTable && cellIndex === 0 ? { borderRightColor: '#8B5CF6', borderRightWidth: 4 } : null,
                    isPurpleTable && cellIndex === 1 ? { borderRightColor: '#8B5CF6', borderRightWidth: 4 } : null
                  ]}
                >
                  <Text style={styles.tableCellText}>
                    {cell}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // Рендеринг списка
  const renderBulletList = (items: string[], index: number) => {
    return (
      <View key={index} style={styles.listContainer}>
        {items.map((item, itemIndex) => (
          <View key={itemIndex} style={styles.bulletListItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listItemText}>
              {item.split(/(\*\*[^*]+\*\*)|(\bto be\b)|(\bas\b)|(\bam\b)/).map((part, partIndex) => {
                // Bold text marked with ** markers
                if (part && part.startsWith('**') && part.endsWith('**')) {
                  return <Text key={partIndex} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
                }
                // Bold "to be", "as", or "am" when they appear as standalone words
                else if (part === 'to be' || part === 'as' || part === 'am') {
                  return <Text key={partIndex} style={{ fontWeight: 'bold' }}>{part}</Text>;
                }
                // Regular text
                return part ? <Text key={partIndex}>{part}</Text> : null;
              })}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Рендеринг нумерованного списка
  const renderNumberedList = (items: ListItem[], index: number) => {
    return (
      <View key={index} style={styles.listContainer}>
        {items.map((item, itemIndex) => (
          <View key={itemIndex} style={styles.numberedListItem}>
            <Text style={styles.numberPoint}>{itemIndex + 1}.</Text>
            <View style={styles.numberedListContent}>
              <Text style={styles.listItemTitle}>{item.title}</Text>
              {item.subitems && item.subitems.map((subitem, subitemIndex) => (
                <View key={subitemIndex} style={styles.bulletListItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listItemText}>{subitem}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Добавляем рендер предупреждения
  const renderWarning = (content: string, index: number) => {
    return (
      <View key={index} style={styles.warningContainer}>
        <View style={styles.warningIconContainer}>
          <Ionicons name="warning" size={24} color="#F59E0B" />
        </View>
        <Text style={styles.warningText}>{content}</Text>
      </View>
    );
  };

  // Обновите функцию рендеринга текста, добавив поддержку Markdown для жирного текста
  const renderText = (content: string) => {
    // Разбиваем текст по маркерам жирного шрифта ** и по словам, которые должны быть жирными
    const parts = content.split(/(\*\*[^*]+\*\*)|(\bto be\b)|(\bas\b)|(\bam\b)/g);
    
    return (
      <Text style={styles.textContent}>
        {parts.map((part, index) => {
          // Если часть заключена в **, то это жирный текст
          if (part && part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2); // Убираем символы **
            return <Text key={index} style={{ fontWeight: 'bold' }}>{boldText}</Text>;
          }
          // Делаем "to be", "as", или "am" жирными, когда они встречаются как отдельные слова
          else if (part === 'to be' || part === 'as' || part === 'am') {
            return <Text key={index} style={{ fontWeight: 'bold' }}>{part}</Text>;
          }
          // Обычный текст
          return part ? <Text key={index}>{part}</Text> : null;
        })}
      </Text>
    );
  };

  // Затем обновите функцию renderSection
  const renderSection = (section: Section, index: number) => {
    switch (section.type) {
      case "warning":
        return renderWarning(section.content || "", index);
      case "text":
        return (
          <View key={index}>
            {renderText(section.content || "")}
          </View>
        );
      case 'heading':
        return (
          <Text key={index} style={styles.headingText}>
            {section.content}
          </Text>
        );
      case 'bullet_list':
        return renderBulletList(section.items as string[], index);
      case 'numbered_list':
        return renderNumberedList(section.items as ListItem[], index);
      case 'table':
        return renderTable({ headers: section.headers || [], rows: section.rows || [] }, index);
      case 'divider':
        return <View key={index} style={styles.divider} />;
      default:
        return null;
    }
  };

  // Рендеринг описания
  const renderDescription = () => {
    // Проверяем, есть ли detailedDescription для текущего языка
    if (lessonData.detailedDescription && 
        lessonData.detailedDescription[currentLanguage as keyof DetailedDescription]) {
      const description = lessonData.detailedDescription[currentLanguage as keyof DetailedDescription];
      
      if (description) {
        const { title, sections } = description;
        
        return (
          <View style={styles.descriptionContainer}>
            <Text style={styles.titleText}>{title}</Text>
            {sections.map((section: Section, index: number) => renderSection(section, index))}
          </View>
        );
      }
    }
    
    // Для языков без детального описания показываем простое описание
    return (
      <Text style={styles.descriptionText}>
        {lessonData.description ? (lessonData.description[currentLanguage] || lessonData.description.english) : ""}
      </Text>
    );
  };

  return (
    <LinearGradient
      colors={['#581C87', '#581C87', '#111827']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.2 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Background */}
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        
        {/* Header */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
            <Text style={styles.backText}>{getLocalizedLessonName()}</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            {/* Удален центральный текст "Помощь/Help" */}
          </View>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.contentContainer}>
            {renderDescription()}
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    color: 'white',
    fontSize: 17,
    marginLeft: 4,
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  textContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  tableContainer: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 2,
    borderRightColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    width: '100%',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    minHeight: 35,
  },
  tableCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 2,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#000',
    flexShrink: 1,
    padding: 4,
  },
  listContainer: {
    marginVertical: 8,
  },
  bulletListItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#8B5CF6',
    marginRight: 8,
    lineHeight: 22,
  },
  numberedListItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  numberPoint: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginRight: 8,
    width: 20,
  },
  numberedListContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    color: '#92400E',
    lineHeight: 22,
  },
});

export default DescriptionScreen; 