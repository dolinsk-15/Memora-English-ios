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

const PaywallOnboarding2: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();

  const handleContinue = () => {
    navigation.navigate('CustomPaywall');
  };

  const handleClose = () => {
    // Закрываем модальный стек
    navigation.getParent()?.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Подсветка фразы «бесплатных 7 дней»/эквивалентов на других языках
  const renderHighlightedLine = (line: string) => {
    // Паттерны для RU/ES/FR/DE (включая разные формы «бесплатно» и порядок слов)
    const pattern = /((бесплатн[^\n]*?7\s*дн[ея][йя])|(7\s*d[ií]as\s+gratuit[oa]s?)|(7\s*jours\s+gratuits?)|((kostenlos\w*\s*7\s*Tage)|(7\s*Tage\s+kostenlos\w*)|(7\s*Tage\s+gratis)))/i;
    const match = line.match(pattern);
    if (!match) {
      return <Text>{line}</Text>;
    }
    const start = match.index || 0;
    const end = start + match[0].length;
    return (
      <Text>
        {line.slice(0, start)}
        <Text style={styles.highlight}>{line.slice(start, end)}</Text>
        {line.slice(end)}
      </Text>
    );
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
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.bellCircle}>
                <Text style={styles.iconText}>🔔</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {t('paywall.onboarding2Title').split('\n').map((line, index, arr) => (
                <Text key={index}>
                  {renderHighlightedLine(line)}
                  {index < arr.length - 1 ? '\n' : ''}
                </Text>
              ))}
            </Text>

            {/* Info text */}
            <Text style={styles.infoText}>
              {t('paywall.onboarding2Subtitle')}
            </Text>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>{t('paywall.onboarding2Button')}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  bellCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 223, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 50,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6B46C1',
  },
  badgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  highlight: {
    color: '#FDE047',
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
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

export default PaywallOnboarding2; 