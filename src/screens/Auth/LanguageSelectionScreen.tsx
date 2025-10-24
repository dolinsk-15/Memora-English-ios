import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { AuthContext } from '../../navigation/RootNavigator';
import { getUserDbId } from '../../utils/userUtils';
import { useLocalization } from '../../contexts/LocalizationContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LanguageSelection'>;

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  nativeText: string;
}

// Добавляем переводы для заголовка и подзаголовка
const headerTranslations = {
  english: "Выберите родной язык",
  russian: "Выберите ваш язык",
  spanish: "Seleccione su idioma",
  french: "Choisissez votre langue",
  german: "Wählen Sie Ihre Sprache",
};

const subtitleTranslations = {
  english: "Select the language you want to learn English from",
  russian: "Выберите язык, с которого вы хотите изучать английский",
  spanish: "Seleccione el idioma desde el que desea aprender inglés",
  french: "Sélectionnez la langue à partir de laquelle vous souhaitez apprendre l'anglais",
  german: "Wählen Sie die Sprache, von der aus Sie Englisch lernen möchten",
};

const languages: LanguageOption[] = [
  { id: 'ru', name: 'Russian', nativeName: 'Русский', nativeText: 'Выберите родной язык' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', nativeText: 'Seleccione su lengua materna' },
  { id: 'fr', name: 'French', nativeName: 'Français', nativeText: 'Choisissez votre langue maternelle' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', nativeText: 'Wählen Sie Ihre Muttersprache' },
];

// Функция для получения emoji-флага по id языка
const getFlagEmoji = (id: string) => {
  switch (id) {
    case 'ru':
      return '🇷🇺';
    case 'es':
      return '🇪🇸';
    case 'fr':
      return '🇫🇷';
    case 'de':
      return '🇩🇪';
    default:
      return '🏳️';
  }
};

const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { signIn } = useContext(AuthContext);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { setLanguage, refreshUI } = useLocalization();
  // Плавный переход после выбора языка
  const screenFade = useRef(new Animated.Value(1)).current;
  const screenShift = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  const handleLanguageSelect = async (languageId: string) => {
    setSelectedId(languageId);
    try {
      await setLanguage(languageId as any);
      refreshUI();
      // Плавно скрываем текущий экран и только затем переходим дальше
      Animated.parallel([
        Animated.timing(screenFade, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(screenShift, { toValue: -8, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        try {
          // Переходим в основное приложение (экран уроков)
          signIn();
        } catch {}
      });
    } catch (error) {
      console.error('Error selecting language:', error);
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
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Header Background */}
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        <Animated.View style={{ flex: 1, opacity: screenFade, transform: [{ translateY: screenShift }] }}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
          <View style={styles.contentContainer}>
            <View style={styles.languageList}>
              {languages.map((language) => {
                const isSelected = selectedId === language.id;
                const isPressed = pressedId === language.id;

                if (Platform.OS === 'android') {
                  return (
                    <LinearGradient
                      key={language.id}
                      colors={['#1E40AF', '#0F172A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.languageCardAndroid,
                        isSelected && styles.selectedCard,
                        isPressed && styles.pressedCard,
                      ]}
                    >
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => handleLanguageSelect(language.id)}
                        onPressIn={() => setPressedId(language.id)}
                        onPressOut={() => setPressedId(null)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.languageContent}>
                          <View style={styles.leftSection}>
                            <View style={[
                              styles.languageIcon,
                              isPressed && styles.pressedIcon
                            ]}>
                              <Text style={styles.iconText}>
                                {getFlagEmoji(language.id)}
                              </Text>
                            </View>
                            <View style={styles.languageNames}>
                              <Text style={[
                                styles.nativeText,
                                isPressed && styles.pressedText
                              ]}>
                                {language.nativeText}
                              </Text>
                              <Text style={[
                                styles.languageName,
                                isPressed && styles.pressedText
                              ]}>
                                {language.name}
                              </Text>
                              <Text style={[
                                styles.nativeName,
                                isPressed && styles.pressedText
                              ]}>
                                {language.nativeName}
                              </Text>
                            </View>
                          </View>
                          {isSelected && (
                            <View style={styles.checkmark}>
                              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  );
                }
                // iOS: keep as is
                return (
                  <TouchableOpacity
                    key={language.id}
                    style={[
                      styles.languageCard,
                      isSelected && styles.selectedCard,
                      isPressed && styles.pressedCard,
                    ]}
                    onPress={() => handleLanguageSelect(language.id)}
                    onPressIn={() => setPressedId(language.id)}
                    onPressOut={() => setPressedId(null)}
                  >
                    <View style={styles.languageContent}>
                      <View style={styles.leftSection}>
                        <View style={[
                          styles.languageIcon,
                          isPressed && styles.pressedIcon
                        ]}>
                          <Text style={styles.iconText}>
                            {getFlagEmoji(language.id)}
                          </Text>
                        </View>
                        <View style={styles.languageNames}>
                          <Text style={[
                            styles.nativeText,
                            isPressed && styles.pressedText
                          ]}>
                            {language.nativeText}
                          </Text>
                          <Text style={[
                            styles.languageName,
                            isPressed && styles.pressedText
                          ]}>
                            {language.name}
                          </Text>
                          <Text style={[
                            styles.nativeName,
                            isPressed && styles.pressedText
                          ]}>
                            {language.nativeName}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          </ScrollView>
        </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 32 : 0,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  translatedSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 6,
  },
  multilingualHeader: {
    marginBottom: 24,
  },
  languageList: {
    gap: 16,
  },
  languageCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
    marginBottom: 16,
    width: '100%',
    overflow: 'hidden',
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
  selectedCard: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.02 }],
  },
  pressedCard: {
    borderColor: '#60A5FA',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    transform: [{ scale: 0.98 }],
  },
  languageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 100,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  languageIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pressedIcon: {
    backgroundColor: '#1D4ED8',
    transform: [{ scale: 0.95 }],
  },
  iconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'android' ? 32 : 40,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  pressedText: {
    color: '#60A5FA',
  },
  checkmark: {
    marginLeft: 16,
  },
  nativeText: {
    fontSize: 14,
    color: '#FFA07A',
    marginBottom: 6,
    fontWeight: '500',
  },
  languageCardAndroid: {
    borderRadius: 20,
    marginBottom: 16,
    elevation: 8,
    width: '100%',
    overflow: 'hidden',
  },
});

export default LanguageSelectionScreen; 