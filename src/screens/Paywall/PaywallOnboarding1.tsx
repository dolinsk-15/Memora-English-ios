import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PaywallStackParamList } from '../../navigation/PaywallNavigator';
import { useTranslation } from '../../localization';

type NavigationProp = NativeStackNavigationProp<PaywallStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PaywallOnboarding1: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();

  const handleContinue = () => {
    navigation.navigate('PaywallOnboarding2');
  };

  const handleClose = () => {
    // Закрываем модальный стек сверху вниз
    navigation.getParent()?.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#8B5CF6', '#A78BFA']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>💬</Text>
              </View>
              <View style={styles.sparkle1}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
              <View style={styles.sparkle2}>
                <Text style={styles.sparkleText}>⭐</Text>
              </View>
              <View style={styles.sparkle3}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {t('paywall.onboarding1Title').split('\n').map((line, index) => {
                if (line.includes('7 дней бесплатно') || line.includes('7 días gratis') || line.includes('7 jours gratuits') || line.includes('7 Tage kostenlos')) {
                  return (
                    <Text key={index}>
                      <Text style={styles.highlight}>{line}</Text>
                      {index < t('paywall.onboarding1Title').split('\n').length - 1 ? '\n' : ''}
                    </Text>
                  );
                }
                return (
                  <Text key={index}>
                    {line}
                    {index < t('paywall.onboarding1Title').split('\n').length - 1 ? '\n' : ''}
                  </Text>
                );
              })}
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {t('paywall.onboarding1Subtitle')}
            </Text>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>{t('paywall.onboarding1Button')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    marginBottom: 40,
    position: 'relative',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  iconText: {
    fontSize: 50,
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  sparkle3: {
    position: 'absolute',
    top: 40,
    right: -10,
  },
  sparkleText: {
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 20,
  },
  highlight: {
    color: '#EF4444',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  continueButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PaywallOnboarding1; 