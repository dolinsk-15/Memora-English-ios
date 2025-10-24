import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PaywallStackParamList } from '../../navigation/PaywallNavigator';
import { useTranslation } from '../../localization';
import InAppPurchaseService, { SUBSCRIPTION_PRODUCTS } from '../../services/inAppPurchaseService';
import { usePremium } from '../../contexts/PremiumContext';
import { Linking } from 'react-native';

type NavigationProp = NativeStackNavigationProp<PaywallStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// URL для Privacy Policy и Terms of Service (те же, что в настройках)
const PRIVACY_POLICY_URL = 'https://memoraprivacypolicy.carrd.co/';
const TERMS_OF_SERVICE_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

// Временные ID для демо режима
const DEMO_SUBSCRIPTION_IDS = {
  WEEKLY: 'demo_weekly_subscription',
  YEARLY: 'demo_yearly_subscription',
};

interface PricingOption {
  id: string;
  title: string;
  price: string;
  period: string;
  badge?: string;
  discount?: string;
  isPopular?: boolean;
  localizedPrice?: string;
  introductoryPrice?: string;
}

const CustomPaywallScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { setPro } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<string>(DEMO_SUBSCRIPTION_IDS.YEARLY);
  const [loading, setLoading] = useState(false); // инициализация/restore
  const [isPurchasing, setIsPurchasing] = useState(false); // спиннер на кнопке покупки
  const [isInitializing, setIsInitializing] = useState(false); // Для загрузки данных, не для кнопки
  const [storePrices, setStorePrices] = useState<Record<string, string>>({});
  const [priceNumbers, setPriceNumbers] = useState<Record<string, number>>({});
  const [priceCurrency, setPriceCurrency] = useState<string>('USD');
  const [hasTrial, setHasTrial] = useState<Record<string, boolean>>({});

  // Данные для отображения UI, показываем только если есть реальные цены от StoreKit
  const pricingOptions: PricingOption[] = React.useMemo(() => {
    // Показываем опции только если есть реальные цены (без хардкода!)
    const weeklyPrice = storePrices[SUBSCRIPTION_PRODUCTS.WEEKLY];
    const yearlyPrice = storePrices[SUBSCRIPTION_PRODUCTS.YEARLY];
    
    if (!weeklyPrice || !yearlyPrice) {
      return []; // Нет реальных цен = не показываем карточки
    }
    
    return [
      {
        id: DEMO_SUBSCRIPTION_IDS.WEEKLY,
        title: (t('paywall.weeklyTitle') as any) || 'Еженедельная',
        price: weeklyPrice, // Только реальные цены от StoreKit
        period: (t('paywall.weeklyPeriod') as any) || 'в неделю',
    },
    {
      id: DEMO_SUBSCRIPTION_IDS.YEARLY,
      title: t('paywall.yearlyTitle'),
        price: yearlyPrice, // Только реальные цены от StoreKit
      period: t('paywall.yearlyPeriod'),
        badge: '',
        discount: '',
      isPopular: true,
    },
  ];
  }, [storePrices, t]);

  // Анимации масштаба для карточек
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  // Инициализация Animated.Value для каждой опции
  pricingOptions.forEach(opt => {
    if (!scaleAnims[opt.id]) {
      scaleAnims[opt.id] = new Animated.Value(opt.id === selectedPlan ? 1.06 : 1);
    }
  });

  // Анимировать переключение выбора
  useEffect(() => {
    pricingOptions.forEach(opt => {
      Animated.spring(scaleAnims[opt.id], {
        toValue: opt.id === selectedPlan ? 1.06 : 1,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }).start();
    });
  }, [selectedPlan]);

  // --- Расчет экономии ---
  const formatCurrency = (amount: number) => {
    try {
      // eslint-disable-next-line no-undef
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: priceCurrency || 'USD' }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  const calculatePerWeekYearly = () => {
    const weeklyPlan = pricingOptions.find(p => p.id === DEMO_SUBSCRIPTION_IDS.WEEKLY);
    const yearlyPlan = pricingOptions.find(p => p.id === DEMO_SUBSCRIPTION_IDS.YEARLY);

    if (weeklyPlan && yearlyPlan) {
      const weeklyPrice = priceNumbers[SUBSCRIPTION_PRODUCTS.WEEKLY] ?? parseFloat(String(weeklyPlan.price).replace(/[^0-9.-]+/g, ''));
      const yearlyPrice = priceNumbers[SUBSCRIPTION_PRODUCTS.YEARLY] ?? parseFloat(String(yearlyPlan.price).replace(/[^0-9.-]+/g, ''));

      if (!isNaN(weeklyPrice) && !isNaN(yearlyPrice)) {
        const perWeekYearly = yearlyPrice / 52;
        return `${formatCurrency(perWeekYearly)} ${t('paywall.weeklyPeriod')}`;
      }
    }
    return '';
  };

  const calculateSavingsAmount = () => {
    const weeklyPlan = pricingOptions.find(p => p.id === DEMO_SUBSCRIPTION_IDS.WEEKLY);
    const yearlyPlan = pricingOptions.find(p => p.id === DEMO_SUBSCRIPTION_IDS.YEARLY);

    if (weeklyPlan && yearlyPlan) {
      const weeklyPrice = priceNumbers[SUBSCRIPTION_PRODUCTS.WEEKLY] ?? parseFloat(String(weeklyPlan.price).replace(/[^0-9.-]+/g, ''));
      const yearlyPrice = priceNumbers[SUBSCRIPTION_PRODUCTS.YEARLY] ?? parseFloat(String(yearlyPlan.price).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(weeklyPrice) && !isNaN(yearlyPrice)) {
        const savings = (weeklyPrice * 52) - yearlyPrice;
        return `${t('paywall.savingsText')} ${formatCurrency(savings)}`;
      }
    }
    return '';
  };

  const features = [
    { text: (t('paywall.benefitLessons') as any) || '18 уроков — доступ ко всем обучающим материалам' },
    { text: (t('paywall.benefitCoverage') as any) || 'Слова, покрывающие 90% повседневной речи' },
    { text: (t('paywall.benefitGrammar') as any) || 'Простой и понятный разбор грамматики с примерами' },
    { text: (t('paywall.benefitTrainers') as any) || 'Тренажёры для изучения слов' },
  ];

  useEffect(() => {
    (async () => {
      try {
        setIsInitializing(true);
        
        // 1) Мгновенно пытаемся заполнить из памяти или кеш‑снимка
        console.log('[Paywall] 🚀 Loading products and prices from cache...');
        // Сначала пробуем валютный кеш по ожидаемой валюте
        let expectedCurrencySnapshot = null;
        try {
          const expectedCurrency = InAppPurchaseService.detectExpectedCurrency();
          console.log('[Paywall] 🌍 Expected currency for device:', expectedCurrency);
          expectedCurrencySnapshot = InAppPurchaseService.getCachedPricingByCurrency?.(expectedCurrency);
        } catch (e) {
          console.warn('[Paywall] ⚠️ Failed to get currency-specific cache:', e);
        }
        
        // API может быть не доступен в ранних версиях — fallback к обычному снапшоту
        const fallbackSnapshot = InAppPurchaseService.getCachedPricingSnapshot();
        const initialSnapshot = (expectedCurrencySnapshot && Object.keys(expectedCurrencySnapshot).length > 0)
          ? expectedCurrencySnapshot
          : fallbackSnapshot;
        if (initialSnapshot && Object.keys(initialSnapshot).length > 0) {
          // Проверяем что валюта в кеше совпадает с ожидаемой
          const expectedCurrency = InAppPurchaseService.detectExpectedCurrency();
          const cachedCurrency = Object.values(initialSnapshot)[0]?.currency;
          
          if (cachedCurrency && cachedCurrency !== expectedCurrency) {
            console.log(`[Paywall] ⚠️ Cache currency mismatch: cached=${cachedCurrency}, expected=${expectedCurrency}. Ignoring cache.`);
            // Не используем старый кеш с неправильной валютой
          } else {
            console.log('[Paywall] ✅ Using cached pricing snapshot (currency matches)');
            applySnapshotToState(initialSnapshot);
          }
        }

        // 2) Ждём готовность «горячего» списка с тайм‑аутом (мягко)
        console.log('[Paywall] 🔄 Waiting for fresh products from StoreKit...');
        const ready = await InAppPurchaseService.waitForProductsReady(5000);
        if (ready) {
          const fresh = InAppPurchaseService.getProducts() as any[];
          if (fresh && fresh.length > 0) {
            console.log('[Paywall] ✅ Updating with fresh products');
            applyProductsToState(fresh);
          }
        } else {
          console.log('[Paywall] ⏰ Fresh products not ready within 5s, keeping cached data');
        }

        // Подписываемся на обновления прайсинга, чтобы валюта/цены обновились сразу после прихода
        if (InAppPurchaseService.onPricingSnapshotUpdated) {
          const unsubPricing = InAppPurchaseService.onPricingSnapshotUpdated((_currency, snapshot) => {
            console.log('[Paywall] 🔔 Pricing snapshot updated. Refreshing UI.');
            applySnapshotToState(snapshot as any);
          });
          // Снимем подписку при размонтировании
          return () => { try { unsubPricing && unsubPricing(); } catch {} };
        }
      } catch (e) {
        console.warn('[Paywall] ❌ Products loading failed:', e);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  const applyProductsToState = (products: any[]) => {
    const priceTextMap: Record<string, string> = {};
    const priceNumMap: Record<string, number> = {};
    const trialMap: Record<string, boolean> = {};

    products.forEach((p: any) => {
      const pid = p.productId;
      const localized = p.localizedPrice || p.localizedPriceIOS || p.localizedPriceAndroid || p.price || '';
      priceTextMap[pid] = localized;

      const numeric = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || '').replace(/[^0-9.-]+/g, ''));
      const numericIOS = (p as any).priceNumberIOS;
      const parsedFromLocalized = parseFloat(String(localized).replace(/[^0-9.-]+/g, ''));
      priceNumMap[pid] = (numericIOS ?? numeric ?? parsedFromLocalized) || 0;

      const mode = (p as any).introductoryPricePaymentModeIOS || (p as any).introductoryPricePaymentMode;
      const hasFreeTrial = String(mode).toUpperCase().includes('FREE');
      trialMap[pid] = Boolean(hasFreeTrial);

      if ((p as any).priceCurrencyCode || (p as any).currency) {
        setPriceCurrency((p as any).priceCurrencyCode || (p as any).currency);
      }
    });

    setStorePrices(priceTextMap);
    setPriceNumbers(priceNumMap);
    setHasTrial(trialMap);
  };

  const applySnapshotToState = (snapshot: Record<string, { localizedPrice: string; priceNumber: number; currency: string; hasFreeTrial: boolean; }>) => {
    try {
      const priceTextMap: Record<string, string> = {};
      const priceNumMap: Record<string, number> = {};
      const trialMap: Record<string, boolean> = {};
      Object.keys(snapshot).forEach(pid => {
        const it = snapshot[pid];
        priceTextMap[pid] = it.localizedPrice;
        priceNumMap[pid] = it.priceNumber;
        trialMap[pid] = it.hasFreeTrial;
        if (it.currency) setPriceCurrency(it.currency);
      });
      setStorePrices(priceTextMap);
      setPriceNumbers(priceNumMap);
      setHasTrial(trialMap);
    } catch (e) {
      console.warn('applySnapshotToState failed:', e);
    }
  };

  // Продукты теперь загружаются при старте приложения, 
  // а Paywall показывается только когда цены готовы

  // Закрываем Paywall, когда премиум активируется
  useEffect(() => {
    const unsub = InAppPurchaseService.onPremiumStatusChange((isPremium) => {
      console.log(`[Paywall] 📞 Premium status change callback: ${isPremium}`);
      if (isPremium) {
        console.log('[Paywall] ✅ Premium activated, closing paywall...');
        handleClose();
      }
    });
    return unsub;
  }, []);

  // Снимаем спиннер загрузки после завершения restore
  useEffect(() => {
    const unsub = InAppPurchaseService.onPurchaseFlowSettled(() => {
      // Только для restore, purchase управляет своими флагами сам
      setLoading(false);
      console.log('[Paywall] 📢 Purchase flow settled event received');
    });
    return unsub;
  }, []);

  // Используем useRef для более надёжной защиты от повторных вызовов
  const purchaseInProgressRef = useRef(false);
  const purchaseCountRef = useRef(0);

  const handlePurchase = async () => {
    // Детальное логирование для отладки
    purchaseCountRef.current += 1;
    console.log(`[Paywall] 🔢 handlePurchase called #${purchaseCountRef.current}, isPurchasing=${isPurchasing}, loading=${loading}, ref=${purchaseInProgressRef.current}`);
    
    // Тройная защита от повторных вызовов
    if (isPurchasing || loading || purchaseInProgressRef.current) {
      console.log('[Paywall] ⚠️ Purchase already in progress, ignoring duplicate call');
      return;
    }
    
    // Устанавливаем флаги защиты
    purchaseInProgressRef.current = true;
    setIsPurchasing(true);
    
    try {
      const productId = selectedPlan === DEMO_SUBSCRIPTION_IDS.WEEKLY
        ? SUBSCRIPTION_PRODUCTS.WEEKLY
        : SUBSCRIPTION_PRODUCTS.YEARLY;

      console.log('[Paywall] 🚀 Starting purchase for product:', productId);
      
      // Проверяем, что IAP сервис инициализирован
      if (!InAppPurchaseService.isServiceInitialized()) {
        console.log('[Paywall] ⚠️ IAP not initialized, initializing...');
        await InAppPurchaseService.initialize();
      }

      // Проверяем, что продукты загружены
      const products = InAppPurchaseService.getProducts();
      if (products.length === 0) {
        console.log('[Paywall] ⚠️ No products loaded, loading products...');
        await InAppPurchaseService.loadProducts();
      }

      // Добавляем таймаут для операции покупки
      const purchasePromise = InAppPurchaseService.purchaseSubscription(productId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Purchase timeout after 30 seconds')), 30000)
      );

      await Promise.race([purchasePromise, timeoutPromise]);
      
      console.log('[Paywall] ✅ Purchase completed successfully');
      
    } catch (error: any) {
      console.error('[Paywall] ❌ Purchase failed:', error);
      
      // Показываем пользователю понятную ошибку
      const errorMessage = error.message || 'Неизвестная ошибка';
      if (errorMessage.includes('timeout')) {
        // Убираем показ алерта при таймауте — просто лог и снятие спиннера
        console.log('[Paywall] ⏱️ Purchase timeout (silenced alert)');
      } else if (errorMessage.includes('cancelled') || errorMessage.includes('E_USER_CANCELLED')) {
        console.log('[Paywall] ℹ️ Purchase cancelled by user');
        // Не показываем ошибку для отмены пользователем
      } else {
        // Показываем системное сообщение без заголовка "Ошибка покупки"
        const body = (error && typeof error === 'object')
          ? (error.debugMessage || error.message || errorMessage)
          : errorMessage;
        try {
          Alert.alert('', String(body || ''));
        } catch (e) {
          console.warn('[Paywall] Purchase error (no-title alert failed):', body);
        }
      }
    } finally {
      // Сбрасываем флаги через небольшую задержку для UX
      console.log('[Paywall] 🏁 Purchase flow completed, resetting flags');
      setTimeout(() => {
        purchaseInProgressRef.current = false;
        setIsPurchasing(false);
        console.log('[Paywall] ✅ Flags reset, ready for next purchase');
      }, 1000); // Увеличиваем задержку до 1 секунды
    }
  };

  const handleRestorePurchase = async () => {
    setLoading(true);
    try {
      const result = await InAppPurchaseService.restorePurchases();
      // Локализованные тексты результата с защитой от «возврата ключа»
      const tOr = (key: string, fb: string) => {
        const val = (t(key) as unknown) as string;
        if (typeof val === 'string' && val !== key) return val;
        const commonVal = (t('common.' + key) as unknown) as string;
        return typeof commonVal === 'string' && commonVal !== 'common.' + key ? commonVal : fb;
      };

      if (result === 'restored') {
        Alert.alert(tOr('paywall.restoreSuccessTitle', 'Готово!'), tOr('paywall.restoreSuccess', 'Подписка восстановлена'));
      } else {
        Alert.alert(tOr('paywall.noPurchasesTitle', 'Нет покупок'), tOr('paywall.noPurchasesMessage', 'Не найдено покупок для восстановления'));
      }
    } catch (error) {
      console.error('Restore flow error:', error);
      const tOr = (key: string, fb: string) => {
        const val = (t(key) as unknown) as string;
        if (typeof val === 'string' && val !== key) return val;
        const commonVal = (t('common.' + key) as unknown) as string;
        return typeof commonVal === 'string' && commonVal !== 'common.' + key ? commonVal : fb;
      };
      Alert.alert(tOr('paywall.errorTitle', 'Ошибка'), tOr('paywall.restoreFailed', 'Не удалось восстановить покупки'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigation.getParent()?.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Функция для открытия URL (такая же, как в настройках)
  const handleOpenURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Ошибка', 'Невозможно открыть ссылку');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Ошибка при открытии ссылки');
    }
  };

  const handleTermsPress = () => {
    handleOpenURL(TERMS_OF_SERVICE_URL);
  };

  const handlePrivacyPress = () => {
    handleOpenURL(PRIVACY_POLICY_URL);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B46C1', '#8B5CF6', '#A78BFA']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Основной заголовок */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>{t('paywall.mainTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('paywall.mainSubtitle')}
            </Text>
          </View>

          {/* Список преимуществ */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureRow, index === features.length - 1 && { marginBottom: 0 }]}>
                <View style={styles.featureNumberLogo}>
                  <Text style={styles.featureNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Опции подписки */}
          <View style={styles.pricingContainer}>
            {pricingOptions.length === 0 ? (
              // Показываем спиннер загрузки пока нет реальных цен
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>
                  {t('paywall.loadingPrices') || 'Загрузка цен...'}
                </Text>
              </View>
            ) : (
              pricingOptions.map((option) => (
              <Animated.View
                key={option.id}
                style={{ transform: [{ scale: scaleAnims[option.id] }] }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedPlan(option.id)}
                  style={[
                    styles.pricingOption,
                    option.isPopular && styles.popularOption,
                    selectedPlan === option.id && styles.selectedOption,
                  ]}
                >
                  {/* Бейдж экономии */}
                  {option.id === DEMO_SUBSCRIPTION_IDS.YEARLY && (
                    <View style={styles.badgeContainer}>
                      <Text
                        style={styles.badgeText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {calculateSavingsAmount()}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.optionContent}>
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.radioOuter,
                        selectedPlan === option.id && styles.radioSelected
                      ]}>
                        {selectedPlan === option.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.priceInfo}>
                      <Text style={styles.planTitle}>{option.title}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>{option.price}</Text>
                        <Text style={styles.period}>{option.period}</Text>
                      </View>
                      {option.id === DEMO_SUBSCRIPTION_IDS.YEARLY && (
                        <Text style={styles.discount}>{calculatePerWeekYearly()}</Text>
                      )}
                      {option.id === DEMO_SUBSCRIPTION_IDS.YEARLY && hasTrial[SUBSCRIPTION_PRODUCTS.YEARLY] && (
                        <Text style={styles.trialText}>{t('paywall.freeTrialText')}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
              ))
            )}
          </View>

          {/* Кнопка покупки */}
          <TouchableOpacity
            style={[styles.purchaseButton, (loading || isPurchasing || pricingOptions.length === 0) && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={loading || isPurchasing || pricingOptions.length === 0}
            delayLongPress={3000} // Защита от случайных двойных нажатий
          >
            {isPurchasing ? (
              <ActivityIndicator color="#6B46C1" />
            ) : (
              <Text style={styles.purchaseButtonText}>{t('paywall.purchaseButton')}</Text>
            )}
          </TouchableOpacity>

          {/* Текст "Cancel anytime" */}
          <Text style={styles.cancelAnytimeText}>{t('paywall.cancelAnytime')}</Text>

          {/* Дополнительные ссылки */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleTermsPress}>
              <Text style={styles.linkText}>{t('paywall.termsLink')}</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={handleRestorePurchase}>
              <Text style={styles.linkText}>{t('paywall.restoreLink')}</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity onPress={handlePrivacyPress}>
              <Text style={styles.linkText}>{t('paywall.privacyLink')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {(loading || isPurchasing) && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 15 : 10,
    paddingHorizontal: 20,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFF00',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  featureNumberLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
  },
  pricingContainer: {
    marginBottom: 25,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  pricingOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  popularOption: {
    borderColor: '#F59E0B',
  },
  badgeContainer: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#10B981',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  priceInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 6,
  },
  period: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  discount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  trialText: {
    fontSize: 24,
    color: '#F59E0B',
    fontWeight: 'bold',
    marginTop: 4,
  },
  purchaseButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  cancelAnytimeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
});

export default CustomPaywallScreen; 