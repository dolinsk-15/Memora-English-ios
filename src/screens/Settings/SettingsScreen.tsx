import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Alert,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../localization';
import { useLocalization } from '../../contexts/LocalizationContext';

type SettingsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Settings'>;

// URL для Privacy Policy и Terms of Service
const PRIVACY_POLICY_URL = 'https://www.example.com/privacy-policy';
const TERMS_OF_SERVICE_URL = 'https://www.example.com/terms-of-service';
const APP_STORE_URL = Platform.OS === 'ios' 
  ? 'https://apps.apple.com/app/id[ВАШЕ_APP_ID]' 
  : 'market://details?id=[ВАШЕ_PACKAGE_NAME]';

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { resetProgress } = useLocalization();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Функция для сброса прогресса при нажатии на соответствующую кнопку
  const handleResetProgress = async () => {
    try {
      // Запрашиваем подтверждение
      Alert.alert(
        t('settings.resetProgress'),
        t('settings.resetProgressWarning'),
        [
          { text: t('common.cancel'), style: "cancel" },
          { 
            text: t('common.confirm'), 
            style: "destructive",
            onPress: async () => {
              try {
                // Вызываем функцию сброса прогресса из контекста локализации
                await resetProgress();
                
                // Показываем уведомление об успешном сбросе
                Alert.alert(
                  t('common.success'),
                  t('settings.resetProgressSuccess'),
                  [{ text: 'OK', onPress: () => navigation.navigate('LessonList') }]
                );
              } catch (error) {
                console.error('Error resetting progress:', error);
                Alert.alert(
                  t('common.error'),
                  t('settings.resetProgressError')
                );
              }
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Error in reset progress dialog:', error);
    }
  };

  // Обработчик нажатия на "Change Learning Language"
  const handleChangeLanguage = () => {
    navigation.navigate('ChangeLanguage');
  };

  // Обработчик открытия внешних ссылок
  const handleOpenURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t('common.error'),
          t('settings.cannotOpenUrl')
        );
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        t('common.error'),
        t('settings.urlError')
      );
    }
  };

  // Обработчик для кнопки Rate App
  const handleRateApp = async () => {
    try {
      const supported = await Linking.canOpenURL(APP_STORE_URL);
      
      if (supported) {
        await Linking.openURL(APP_STORE_URL);
      } else {
        Alert.alert(
          t('common.error'),
          t('settings.cannotOpenAppStore')
        );
      }
    } catch (error) {
      console.error('Error opening App Store:', error);
      Alert.alert(
        t('common.error'),
        t('settings.appStoreError')
      );
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <LinearGradient
      colors={['#581C87', '#111827', '#1F2937']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            scrollY.setValue(offsetY);
          }}
          scrollEventThrottle={16}
        >
          <TouchableOpacity 
            style={styles.button}
            onPress={handleChangeLanguage}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="language" size={24} color="#60A5FA" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t('settings.changeLanguage')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#60A5FA" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleOpenURL(PRIVACY_POLICY_URL)}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="shield-checkmark" size={24} color="#60A5FA" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t('settings.privacyPolicy')}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#60A5FA" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleOpenURL(TERMS_OF_SERVICE_URL)}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="document-text" size={24} color="#60A5FA" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{t('settings.termsOfService')}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#60A5FA" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleResetProgress}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="refresh-circle" size={24} color="#EF4444" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, styles.dangerButtonText]}>{t('settings.resetProgress')}</Text>
            </View>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
          </TouchableOpacity>
          
          {/* Rate App Button */}
          <View style={styles.rateAppContainer}>
            <TouchableOpacity 
              style={styles.rateAppButton} 
              onPress={handleRateApp}
            >
              <LinearGradient
                colors={['#4ade80', '#22c55e']}
                style={styles.rateAppGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <AntDesign name="heart" size={24} color="#fff" style={styles.rateAppIcon} />
                <Text style={styles.rateAppText}>{t('settings.rateApp')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.rateAppDescription}>
              {t('settings.rateAppDescription')}
            </Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 17,
    color: '#60A5FA',
    fontWeight: '500',
  },
  dangerButton: {
    marginTop: 30,
    marginBottom: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  dangerButtonText: {
    color: '#EF4444',
  },
  rateAppContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  rateAppButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  rateAppGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rateAppText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rateAppIcon: {
    marginRight: 10,
  },
  rateAppDescription: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
});

export default SettingsScreen; 