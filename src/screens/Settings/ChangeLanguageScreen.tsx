import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LessonsStackParamList } from '../../navigation/LessonsStackNavigator';
import { languageOptions, useLocalization } from '../../contexts/LocalizationContext';
import { useTranslation } from '../../localization';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChangeLanguageScreenNavigationProp = NativeStackNavigationProp<LessonsStackParamList, 'ChangeLanguage'>;

const ChangeLanguageScreen: React.FC = () => {
  const navigation = useNavigation<ChangeLanguageScreenNavigationProp>();
  const { language: currentLanguage, setLanguage, resetProgress } = useLocalization();
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(currentLanguage);
  const [pressedId, setPressedId] = useState<string | null>(null);
  
  const handleLanguageSelect = async (languageId: string) => {
    if (languageId === currentLanguage) {
      navigation.goBack();
      return;
    }

    setSelectedId(languageId);
    
    // Предупреждаем о сбросе прогресса при смене языка
    Alert.alert(
      t('settings.changeLanguage'),
      t('settings.changeLanguageWarning'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Сначала сбрасываем прогресс
              await resetProgress();
              
              // Затем меняем язык
              await setLanguage(languageId as any);
              
              // Принудительно обновляем UI и сбрасываем навигацию
              setTimeout(() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MainStack' }],
                  })
                );
              }, 100); // Небольшая задержка для обеспечения применения изменений
            } catch (error) {
              console.error('Error changing language:', error);
              Alert.alert(
                t('common.error'),
                t('settings.changeLanguageError')
              );
            }
          }
        }
      ]
    );
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
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('settings.changeLanguage')}</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>
              {t('auth.languageDescription')}
            </Text>
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={24} color="#FBBF24" />
              <Text style={styles.warningText}>
                {t('settings.changeLanguageWarningShort')}
              </Text>
            </View>
            <View style={styles.languageList}>
              {languageOptions.filter(l => l.id !== 'en').map((language) => {
                const isSelected = selectedId === language.id;
                const isPressed = pressedId === language.id;
                const isCurrent = currentLanguage === language.id;

                if (Platform.OS === 'android') {
                  return (
                    <LinearGradient
                      key={language.id}
                      colors={['#3B82F6', '#1F2937']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.languageCardAndroid,
                        isSelected && styles.selectedCard,
                        isPressed && styles.pressedCard,
                        isCurrent && styles.currentCard,
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
                              isPressed && styles.pressedIcon,
                              isCurrent && styles.currentIcon,
                            ]}>
                              <Text style={styles.iconText}>
                                {language.name.charAt(0)}
                              </Text>
                            </View>
                            <View style={styles.languageNames}>
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
                          {isCurrent && (
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
                      isCurrent && styles.currentCard,
                    ]}
                    onPress={() => handleLanguageSelect(language.id)}
                    onPressIn={() => setPressedId(language.id)}
                    onPressOut={() => setPressedId(null)}
                  >
                    <View style={styles.languageContent}>
                      <View style={styles.leftSection}>
                        <View style={[
                          styles.languageIcon,
                          isPressed && styles.pressedIcon,
                          isCurrent && styles.currentIcon,
                        ]}>
                          <Text style={styles.iconText}>
                            {language.name.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.languageNames}>
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
                      {isCurrent && (
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
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 44,
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  warningText: {
    color: '#FBBF24',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  languageList: {
    gap: 16,
  },
  languageCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    marginBottom: 12,
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
  currentCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  languageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  },
  pressedIcon: {
    backgroundColor: '#1D4ED8',
    transform: [{ scale: 0.95 }],
  },
  currentIcon: {
    backgroundColor: '#3B82F6',
  },
  iconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
  languageCardAndroid: {
    borderRadius: 20,
    marginBottom: 12,
    elevation: 8,
    overflow: 'hidden',
  },
});

export default ChangeLanguageScreen; 