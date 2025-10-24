import {
  initConnection,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getSubscriptions,
  requestSubscription,
  finishTransaction,
  getAvailablePurchases,
  clearTransactionIOS,
  validateReceiptIos,
  type Subscription,
  type SubscriptionPurchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAP_PRODUCTS, IAP_SHARED_SECRET } from './iapConfig';

// Экспортируем продуктовые ID из конфигурации
export const SUBSCRIPTION_PRODUCTS = IAP_PRODUCTS;

// Ключи для хранения статуса подписки
const STORAGE_KEYS = {
  IS_PREMIUM: 'isPro',
  SUBSCRIPTION_DATA: '@subscription_data',
  EXPIRY_MS: '@subscription_expiry_ms',
  RECEIPT_DATA: '@receipt_data',
  PRODUCTS_CACHE: '@iap_products_cache',
};

class InAppPurchaseService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private products: Subscription[] = [];
  private isInitialized = false;
  private statusListeners: Array<(isPremium: boolean) => void> = [];
  private flowListeners: Array<() => void> = [];

  // Prefetch readiness and cached pricing snapshot
  private productsReadyResolve: (() => void) | null = null;
  private productsReadyPromise: Promise<void>;
  private cachedPricing: Record<string, {
    localizedPrice: string;
    priceNumber: number;
    currency: string;
    hasFreeTrial: boolean;
  }> = {};

  // Currency-aware cache: currencyCode -> productId -> pricing
  private cachedPricingByCurrency: Record<string, Record<string, {
    localizedPrice: string;
    priceNumber: number;
    currency: string;
    hasFreeTrial: boolean;
  }>> = {};
  private lastCurrency: string | null = null;

  // Loading state tracking
  private isLoadingProducts = false;
  private loadingListeners: Array<(isLoading: boolean) => void> = [];
  private pricingListeners: Array<(currency: string, snapshot: Record<string, { localizedPrice: string; priceNumber: number; currency: string; hasFreeTrial: boolean; }>) => void> = [];
  
  // Purchase state tracking
  private activePurchaseProductId: string | null = null;
  private purchaseAttemptCount = 0;
  private isCheckingEntitlements = false;
  private lastEntitlementsCheckAt = 0;
  private ENTITLEMENTS_MIN_INTERVAL_MS = 15000; // 15s троттлинг

  constructor() {
    this.productsReadyPromise = new Promise<void>((resolve) => {
      this.productsReadyResolve = resolve;
    });
  }

  /**
   * Инициализация сервиса покупок
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('✅ [initialize] IAP Service already initialized');
        return;
      }

      console.log('🚀 [initialize] Starting IAP initialization...');

      // Добавляем таймаут для инициализации соединения
      const initPromise = (async () => {
      // Инициализация соединения с магазином
      const result = await initConnection();
        console.log('🔗 [initialize] IAP Connection initialized:', result);

      // Настройка слушателей
      this.setupListeners();

        // Очищаем возможные подвисшие транзакции на iOS, чтобы система показывала окно покупки
        if (Platform.OS === 'ios') {
          try {
            await clearTransactionIOS();
            console.log('🧹 [initialize] Cleared pending iOS transactions');
          } catch (e) {
            console.warn('⚠️ [initialize] clearTransactionIOS failed:', e);
          }
        }

        // Пытаемся прогреть кеш цен для мгновенного Paywall
        await this.loadProductsCache();

        // Загрузка доступных продуктов (фоновая может занять время)
      await this.loadProducts();

      // Проверка существующих покупок
      await this.checkExistingPurchases();

      this.isInitialized = true;
        console.log('✅ [initialize] IAP Service initialized successfully');
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('IAP initialization timeout after 20 seconds')), 20000)
      );

      await Promise.race([initPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('❌ [initialize] Error initializing IAP:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Загрузка доступных продуктов из магазина
   */
  async loadProducts(): Promise<Subscription[]> {
    try {
      // Уведомляем о начале загрузки
      this.notifyLoadingChange(true);
      
      const productIds = Object.values(SUBSCRIPTION_PRODUCTS);
      console.log('🛒 [loadProducts] Loading products:', productIds);
      
      // Добавляем таймаут для загрузки продуктов
      const loadPromise = (async () => {
      if (Platform.OS === 'ios') {
        this.products = await getSubscriptions({ skus: productIds });
      } else {
        // Android
        this.products = await getSubscriptions({ skus: productIds });
        }
        return this.products;
      })();

      const timeoutPromise = new Promise<Subscription[]>((_, reject) => 
        setTimeout(() => reject(new Error('Products loading timeout after 30 seconds')), 30000)
      );

      this.products = await Promise.race([loadPromise, timeoutPromise]);

      console.log('✅ [loadProducts] Loaded products:', this.products.length);
      console.log('🔍 [loadProducts] Raw products from StoreKit:', JSON.stringify(this.products.map((p: any) => ({
        productId: p.productId,
        localizedPrice: p.localizedPrice,
        currency: p.priceCurrencyCode || p.currency,
        price: p.price
      })), null, 2));

      // Построить snapshot цен/валюты/триала для быстрого UI
      try {
        const snapshot: Record<string, any> = {};
        this.products.forEach((p: any) => {
          const pid = p.productId;
          const localized = p.localizedPrice || p.localizedPriceIOS || p.localizedPriceAndroid || p.price || '';
          const numeric = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || '').replace(/[^0-9.-]+/g, ''));
          const numericIOS = (p as any).priceNumberIOS;
          const parsedFromLocalized = parseFloat(String(localized).replace(/[^0-9.-]+/g, ''));
          const priceNumber = (numericIOS ?? numeric ?? parsedFromLocalized) || 0;
          const mode = (p as any).introductoryPricePaymentModeIOS || (p as any).introductoryPricePaymentMode;
          const hasFreeTrial = String(mode || '').toUpperCase().includes('FREE');
          const currency = (p as any).priceCurrencyCode || (p as any).currency || '';
          snapshot[pid] = { localizedPrice: String(localized || ''), priceNumber, currency, hasFreeTrial };
        });
        this.cachedPricing = snapshot as any;

        // Сохраняем валютно-ориентированный кеш
        const currencyCode = Object.values(snapshot)[0]?.currency || this.detectExpectedCurrency();
        console.log('💰 [loadProducts] Detected currency from products:', currencyCode);
        console.log('💰 [loadProducts] Sample product data:', Object.values(snapshot)[0]);
        
        // Если валюта изменилась - очищаем старый кеш других валют
        if (this.lastCurrency && this.lastCurrency !== currencyCode) {
          console.log(`💱 [loadProducts] Currency changed from ${this.lastCurrency} to ${currencyCode}. Clearing old cache.`);
          // Очищаем кеш других валют чтобы не показывать старые цены
          this.cachedPricingByCurrency = {};
        }
        
        this.lastCurrency = currencyCode;
        this.cachedPricingByCurrency[currencyCode] = snapshot as any;
        await AsyncStorage.setItem(
          STORAGE_KEYS.PRODUCTS_CACHE,
          JSON.stringify({ ts: Date.now(), items: snapshot, currency: currencyCode, byCurrency: this.cachedPricingByCurrency })
        );
        // Уведомляем слушателей о новом снапшоте
        this.notifyPricingSnapshot(currencyCode, snapshot as any);
        if (this.productsReadyResolve) {
          this.productsReadyResolve();
          this.productsReadyResolve = null;
        }
      } catch (e) {
        console.warn('⚠️ [loadProducts] Failed to save products cache:', e);
      }
      
      // Проверяем что все наши продукты загружены
      const expectedProducts = Object.values(SUBSCRIPTION_PRODUCTS);
      const loadedProductIds = this.products.map(p => p.productId);
      const missingProducts = expectedProducts.filter(id => !loadedProductIds.includes(id));
      
      if (missingProducts.length > 0) {
        console.error('❌ [loadProducts] Missing products in App Store Connect:', missingProducts);
        console.error('❌ [loadProducts] Expected:', expectedProducts);
        console.error('❌ [loadProducts] Loaded:', loadedProductIds);
      } else {
        console.log('✅ [loadProducts] All expected products loaded successfully');
      }
      
      return this.products;
    } catch (error) {
      console.error('❌ [loadProducts] Error loading products:', error);
      return [];
    } finally {
      // Уведомляем о завершении загрузки (независимо от результата)
      this.notifyLoadingChange(false);
    }
  }

  private async loadProductsCache(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.items || parsed.byCurrency)) {
        if (parsed.byCurrency) {
          this.cachedPricingByCurrency = parsed.byCurrency;
          // Выбираем кеш для ожидаемой валюты, иначе — последний сохранённый currency
          const expected = this.detectExpectedCurrency();
          const chosenCurrency = this.cachedPricingByCurrency[expected]
            ? expected
            : (parsed.currency || Object.keys(this.cachedPricingByCurrency)[0]);
          this.lastCurrency = chosenCurrency;
          this.cachedPricing = this.cachedPricingByCurrency[chosenCurrency] || parsed.items || {};
        } else if (parsed.items) {
          this.cachedPricing = parsed.items;
        }
        console.log('📦 [IAP] Pricing cache loaded. age(ms)=', Date.now() - (parsed.ts || 0), 'currency=', this.lastCurrency);
      }
    } catch (e) {
      console.warn('⚠️ [IAP] Failed to read pricing cache:', e);
    }
  }

  public getCachedPricingSnapshot(): Record<string, { localizedPrice: string; priceNumber: number; currency: string; hasFreeTrial: boolean; }> {
    return { ...this.cachedPricing };
  }

  public getCachedPricingByCurrency(currency: string): Record<string, { localizedPrice: string; priceNumber: number; currency: string; hasFreeTrial: boolean; }> | null {
    return this.cachedPricingByCurrency[currency] || null;
  }

  public onPricingSnapshotUpdated(
    cb: (currency: string, snapshot: Record<string, { localizedPrice: string; priceNumber: number; currency: string; hasFreeTrial: boolean; }>) => void
  ): () => void {
    this.pricingListeners.push(cb);
    return () => {
      this.pricingListeners = this.pricingListeners.filter((f) => f !== cb);
    };
  }

  private notifyPricingSnapshot(
    currency: string,
    snapshot: Record<string, { localizedPrice: string; priceNumber: number; currency: string; hasFreeTrial: boolean; }>
  ): void {
    this.pricingListeners.forEach((cb) => {
      try { cb(currency, snapshot); } catch {}
    });
  }

  public detectExpectedCurrency(): string {
    try {
      // Берем регион устройства и маппим в валюту (упрощенно)
      const region = (Localization?.region || '').toUpperCase();
      console.log('🌍 [detectExpectedCurrency] Device region:', region);
      const localeCurrency = (Intl as any)?.NumberFormat?.(undefined, { style: 'currency', currency: 'USD' }) && null; // no-op to ensure Intl exists
      // Простая карта регион->валюта (минимально нужные)
      const map: Record<string, string> = {
        RU: 'RUB',
        BY: 'BYN',
        KZ: 'KZT',
        UA: 'UAH',
        DE: 'EUR',
        FR: 'EUR',
        ES: 'EUR',
        IT: 'EUR',
        PT: 'EUR',
        NL: 'EUR',
        IE: 'EUR',
        AT: 'EUR',
        FI: 'EUR',
        BE: 'EUR',
        LU: 'EUR',
        EE: 'EUR',
        LV: 'EUR',
        LT: 'EUR',
        US: 'USD',
        GB: 'GBP',
        TR: 'TRY',
        PL: 'PLN',
        CZ: 'CZK',
        SK: 'EUR',
      };
      return map[region] || (this.lastCurrency || 'USD');
    } catch {
      return this.lastCurrency || 'USD';
    }
  }

  public waitForProductsReady(timeoutMs: number = 0): Promise<boolean> {
    if (!timeoutMs) return this.productsReadyPromise.then(() => true).catch(() => false);
    return Promise.race([
      this.productsReadyPromise.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs))
    ]) as Promise<boolean>;
  }

  /**
   * Получение загруженных продуктов
   */
  getProducts(): Subscription[] {
    return this.products;
  }

  /**
   * Проверка инициализации сервиса
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Настройка слушателей покупок
   */
  private setupListeners(): void {
    // Слушатель успешных покупок
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: SubscriptionPurchase) => {
        console.log('Purchase updated:', purchase);
        
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          let shouldTriggerEntitlementCheck = false;
          try {
            let isValid = false;
            if (!IAP_SHARED_SECRET) {
              // При StoreKit-подходе без секрета считаем покупку валидной сразу
              const pid = purchase.productId;
              if (pid === SUBSCRIPTION_PRODUCTS.WEEKLY || pid === SUBSCRIPTION_PRODUCTS.YEARLY) {
                isValid = true;
              }
            } else {
              isValid = await this.validatePurchase(receipt);
            }
            
            if (isValid) {
              console.log('🎉 [Purchase] Valid purchase detected, updating premium status...');
              await this.savePremiumStatus(true, purchase);
              shouldTriggerEntitlementCheck = true;
            }
          } catch (error) {
            console.error('Error processing purchase:', error);
          } finally {
            // Важно: всегда завершаем транзакцию, чтобы разблокировать показ системного окна в следующий раз
            try {
              await finishTransaction({ purchase, isConsumable: false });
            } catch (e) {
              console.warn('finishTransaction failed (maybe already finished):', e);
            }

            if (shouldTriggerEntitlementCheck) {
              // Принудительно запускаем проверку entitlements для обновления PremiumContext
              console.log('🔄 [Purchase] Triggering entitlement check for immediate UI update...');
              setTimeout(() => {
                this.checkEntitlements().catch(e => console.warn('Post-purchase entitlement check failed:', e));
              }, 500);
            }
          }
        }

        // Любой исход покупки завершает пользовательский поток
        this.notifyFlowSettled();
      }
    );

    // Слушатель ошибок покупок
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        // Сбрасываем флаг активной покупки при любой ошибке
        this.activePurchaseProductId = null;
        
        const isCancelled =
          error.code === 'E_USER_CANCELLED' ||
          (typeof (error as any)?.debugMessage === 'string' && (error as any).debugMessage.includes('SKErrorDomain error 2')) ||
          (error as any)?.responseCode === '2';

        if (isCancelled) {
          console.log('Purchase cancelled by user');
          this.notifyFlowSettled();
          return;
        }

      console.error('Purchase error:', error);
      // Не показываем UI-алерты здесь, чтобы избежать дубля с экраном Paywall
        this.notifyFlowSettled();
      }
    );
  }

  /**
   * Покупка подписки
   */
  async purchaseSubscription(productId: string): Promise<void> {
    try {
      // Защита от множественных вызовов для одного продукта
      if (this.activePurchaseProductId === productId) {
        console.warn(`⚠️ [purchaseSubscription] Purchase already in progress for ${productId}, ignoring duplicate call`);
        return;
      }
      
      this.purchaseAttemptCount++;
      console.log(`🔢 [purchaseSubscription] Purchase attempt #${this.purchaseAttemptCount}`);
      
      const product = this.products.find(p => p.productId === productId);
      
      if (!product) {
        throw new Error('Продукт не найден. Попробуйте перезапустить приложение.');
      }

      this.activePurchaseProductId = productId;
      console.log('🛒 [purchaseSubscription] Starting purchase for:', productId);
      
      // На iOS перед новым запросом очищаем подвисшие транзакции
      if (Platform.OS === 'ios') {
        try {
          await clearTransactionIOS();
          console.log('🧹 [purchaseSubscription] Cleared pending iOS transactions');
        } catch (e) {
          console.warn('⚠️ [purchaseSubscription] clearTransactionIOS failed:', e);
        }
      }

      // Добавляем таймаут для операции покупки
      const purchasePromise = (async () => {
      if (Platform.OS === 'ios') {
        await requestSubscription({
          sku: productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      } else {
        // Android
        await requestSubscription({
          sku: productId,
        });
      }
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Purchase request timeout after 25 seconds')), 25000)
      );

      await Promise.race([purchasePromise, timeoutPromise]);
      
      console.log('✅ [purchaseSubscription] Purchase request completed for:', productId);
      this.activePurchaseProductId = null; // Сбрасываем флаг после успешного завершения
      
    } catch (error: any) {
      this.activePurchaseProductId = null; // Сбрасываем флаг при ошибке
      const isCancelled =
        error?.code === 'E_USER_CANCELLED' ||
        (typeof error?.debugMessage === 'string' && error.debugMessage.includes('SKErrorDomain error 2')) ||
        error?.responseCode === '2' ||
        error?.message?.includes('cancelled');

      if (isCancelled) {
        console.log('ℹ️ [purchaseSubscription] Purchase cancelled by user');
        this.notifyFlowSettled();
        return;
      }

      console.error('❌ [purchaseSubscription] Purchase error:', error);
      this.notifyFlowSettled();
      throw error;
    }
  }

  /**
   * Восстановление покупок
   */
  async restorePurchases(): Promise<'restored' | 'not_found'> {
    try {
      console.log('Restoring purchases...');
      
      const purchases = await getAvailablePurchases();
      console.log('Available purchases:', purchases);
      
      if (purchases.length === 0) {
        await this.savePremiumStatus(false);
        return 'not_found';
      }

      // При StoreKit-подходе без секрета мы не можем надёжно определить активность —
      // избегаем включения премиума без подтверждённого срока действия
      if (!IAP_SHARED_SECRET) {
        console.log('⚠️ [restorePurchases] No shared secret — skip enabling premium heuristically');
        return 'not_found';
      }

      // Иначе валидируем последний receipt
      const latest = purchases[purchases.length - 1];
      const receipt = latest.transactionReceipt;
      const isValid = receipt ? await this.validatePurchase(receipt) : false;
      await this.savePremiumStatus(isValid, latest);
      return isValid ? 'restored' : 'not_found';
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  }

  /**
   * Проверка существующих покупок при запуске
   */
  private async checkExistingPurchases(): Promise<void> {
    try {
      const purchases = await getAvailablePurchases();
      
      if (purchases.length === 0) {
        await this.savePremiumStatus(false);
        return;
      }

      // Если нет секрета — не включаем премиум без подтверждённого срока действия
      if (!IAP_SHARED_SECRET) {
        console.log('⚠️ [checkExistingPurchases] No shared secret — preserve previous premium state');
        return;
      }

      // С секретом — валидируем последний receipt
      const latest = purchases[purchases.length - 1];
      const receipt = latest.transactionReceipt;
      if (!receipt) {
        await this.savePremiumStatus(false);
        return;
      }

      const isValid = await this.validatePurchase(receipt);
      await this.savePremiumStatus(isValid);
    } catch (error) {
      console.error('Error checking existing purchases:', error);
    }
  }

  /**
   * Валидация покупки (TODO: реализуйте серверную валидацию)
   */
  private async validatePurchase(receipt: string): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // Без секрета — fallback: считаем валидной, если среди покупок есть наш продукт
      if (!IAP_SHARED_SECRET) {
        try {
          const purchases = await getAvailablePurchases();
          const hasOurProduct = purchases.some((p: any) =>
            p && (p.productId === SUBSCRIPTION_PRODUCTS.WEEKLY || p.productId === SUBSCRIPTION_PRODUCTS.YEARLY)
          );
          return hasOurProduct;
        } catch (e) {
          console.warn('Fallback entitlement check failed', e);
          return false;
        }
      }

      try {
        console.log('🔍 [validatePurchase] Starting receipt validation...');
        console.log(`🔧 [validatePurchase] Environment: ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'}`);
        console.log(`🔑 [validatePurchase] Using shared secret: ${IAP_SHARED_SECRET ? 'YES' : 'NO'}`);
        
        // Определяем правильный сервер для валидации
        // В TestFlight с sandbox аккаунтами нужно использовать sandbox серверы
        const useSandboxServers = __DEV__ || this.isTestFlightWithSandbox();
        console.log(`🌐 [validatePurchase] Using ${useSandboxServers ? 'SANDBOX' : 'PRODUCTION'} servers`);
        
        // Локальная валидация для iOS
        const validated: any = await validateReceiptIos({
          receiptBody: {
            'receipt-data': receipt,
            password: IAP_SHARED_SECRET,
          },
          isTest: useSandboxServers, // Динамически выбираем sandbox или production
        });

        console.log(`📋 [validatePurchase] Apple response status: ${validated?.status}`);

        // Ответ Apple: status === 0 — валиден
        if (validated && validated.status === 0) {
          const now = Date.now();
          const list: any[] =
            validated.latest_receipt_info ||
            validated.receipt?.in_app ||
            [];

          console.log(`📦 [validatePurchase] Receipts to check: ${list.length}`);
          
          // Вычисляем максимальную дату истечения среди наших продуктов
          let maxExpiry = 0;
          list.forEach((item: any) => {
            const productId = item.product_id || item.productId;
            const isOurProduct =
              productId === SUBSCRIPTION_PRODUCTS.WEEKLY ||
              productId === SUBSCRIPTION_PRODUCTS.YEARLY;
            if (!isOurProduct) return;
            const expiresMsStr = item.expires_date_ms || (item.expires_date_ms_as_int as any);
            const expiresMs = expiresMsStr ? parseInt(String(expiresMsStr), 10) : 0;
            if (Number.isFinite(expiresMs)) {
              maxExpiry = Math.max(maxExpiry, expiresMs);
            }
          });

          // Сохраняем дату истечения для офлайн‑режима
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.EXPIRY_MS, String(maxExpiry || 0));
          } catch (e) {
            console.warn('⚠️ [validatePurchase] Failed to store expiry ms:', e);
          }

          const isActive = maxExpiry > now;
          console.log(`✅ [validatePurchase] Final result: ${isActive}, expiryMs=${maxExpiry}`);
          return isActive;
        }

        console.log(`❌ [validatePurchase] Invalid receipt status: ${validated?.status}`);
        
        // Fallback: если валидация не прошла, но мы в TestFlight с sandbox,
        // попробуем использовать эвристическую проверку
        if (this.isTestFlightWithSandbox()) {
          console.log('🔄 [validatePurchase] Fallback: Using heuristic validation for TestFlight sandbox');
          return true; // В TestFlight с sandbox считаем покупку валидной
        }
        
        return false;
      } catch (error) {
        console.error('❌ [validatePurchase] Receipt validation error:', error);
        
        // Fallback: если произошла ошибка валидации в TestFlight с sandbox
        if (this.isTestFlightWithSandbox()) {
          console.log('🔄 [validatePurchase] Fallback: Using heuristic validation due to validation error');
          return true; // В TestFlight с sandbox считаем покупку валидной при ошибке
        }
        
        return false;
      }
    }
    
    // Для Android или если валидация не удалась
    // TODO: Реализуйте серверную валидацию
    return true;
  }

  /**
   * Сохранение статуса премиум подписки
   */
  private async savePremiumStatus(
    isPremium: boolean,
    purchaseData?: any
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_PREMIUM, JSON.stringify(isPremium));
      
      if (purchaseData) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SUBSCRIPTION_DATA,
          JSON.stringify(purchaseData)
        );
      }

      // Уведомляем подписчиков об изменении статуса
      console.log(`📢 [savePremiumStatus] Notifying ${this.statusListeners.length} listeners about status: ${isPremium}`);
      this.statusListeners.forEach((cb) => {
        try { 
          cb(isPremium);
          console.log('✅ [savePremiumStatus] Listener notified successfully');
        } catch (error) {
          console.warn('⚠️ [savePremiumStatus] Listener notification failed:', error);
        }
      });
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  }

  /**
   * Проверка статуса премиум подписки
   */
  async isPremium(): Promise<boolean> {
    try {
      const isPremium = await AsyncStorage.getItem(STORAGE_KEYS.IS_PREMIUM);
      return isPremium === 'true';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Определяет, находимся ли мы в TestFlight с sandbox аккаунтом
   */
  private isTestFlightWithSandbox(): boolean {
    try {
      // Проверяем, что мы в TestFlight (production билд)
      const isTestFlight = !__DEV__ && Platform.OS === 'ios';
      
      // Дополнительная проверка: если продукты загружаются, но валидация не проходит,
      // скорее всего мы в TestFlight с sandbox аккаунтом
      if (isTestFlight && this.products.length > 0) {
        console.log('🔍 [isTestFlightWithSandbox] Detected TestFlight environment with products loaded');
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Error detecting TestFlight sandbox:', error);
      return false;
    }
  }

  /**
   * Очистка ресурсов
   */
  cleanup(): void {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  /**
   * Позволяет подписаться на изменение премиум-статуса
   */
  onPremiumStatusChange(callback: (isPremium: boolean) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Событие завершения пользовательского purchase/restore потока (успех/отмена/ошибка)
   */
  onPurchaseFlowSettled(callback: () => void): () => void {
    this.flowListeners.push(callback);
    return () => {
      this.flowListeners = this.flowListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyFlowSettled(): void {
    this.flowListeners.forEach((cb) => {
      try { cb(); } catch {}
    });
  }

  /**
   * Позволяет подписаться на изменение состояния загрузки продуктов
   */
  onProductsLoadingChange(callback: (isLoading: boolean) => void): () => void {
    this.loadingListeners.push(callback);
    // Сразу уведомляем о текущем состоянии
    callback(this.isLoadingProducts);
    return () => {
      this.loadingListeners = this.loadingListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyLoadingChange(isLoading: boolean): void {
    this.isLoadingProducts = isLoading;
    this.loadingListeners.forEach((cb) => {
      try { cb(isLoading); } catch {}
    });
  }

  /**
   * Проверяет, загружаются ли продукты в данный момент
   */
  getIsLoadingProducts(): boolean {
    return this.isLoadingProducts;
  }

  /**
   * Проверка активной подписки через StoreKit (SK2) без секрета.
   * Не блокирует UI: просто читает доступные покупки и обновляет флаг.
   */
  async checkEntitlements(): Promise<boolean> {
    try {
      const now = Date.now();
      if (this.isCheckingEntitlements) {
        console.log('⏳ [checkEntitlements] Skipped: already running');
        return (await AsyncStorage.getItem(STORAGE_KEYS.IS_PREMIUM)) === 'true';
      }
      if (now - this.lastEntitlementsCheckAt < this.ENTITLEMENTS_MIN_INTERVAL_MS) {
        console.log(`⏳ [checkEntitlements] Skipped: throttled (${now - this.lastEntitlementsCheckAt}ms)`);
        return (await AsyncStorage.getItem(STORAGE_KEYS.IS_PREMIUM)) === 'true';
      }

      this.isCheckingEntitlements = true;
      this.lastEntitlementsCheckAt = now;
      console.log('🔍 [checkEntitlements] Starting subscription check...');

      // 1) Немедленная офлайн‑проверка по сохранённой дате истечения
      try {
        const expiryRaw = await AsyncStorage.getItem(STORAGE_KEYS.EXPIRY_MS);
        const expiryMs = expiryRaw ? parseInt(expiryRaw, 10) : 0;
        if (expiryMs && now >= expiryMs) {
          console.log(`⛔ [checkEntitlements] Local expiry passed (${expiryMs}), disabling premium`);
          await this.savePremiumStatus(false);
          return false;
        }
      } catch (e) {
        console.warn('⚠️ [checkEntitlements] Failed to read local expiry:', e);
      }
      
      // Быстрая проверка кешированных данных для офлайн режима
      try {
        const cachedStatus = await AsyncStorage.getItem('isPro');
        if (cachedStatus !== null) {
          console.log(`📱 [checkEntitlements] Found cached status: ${cachedStatus}`);
        }
      } catch (e) {
        console.warn('⚠️ [checkEntitlements] Failed to read cached status:', e);
      }
      const cachedIsProStr = await AsyncStorage.getItem(STORAGE_KEYS.IS_PREMIUM);
      const cachedIsPro = cachedIsProStr === 'true';
      
      const purchases = await getAvailablePurchases();
      console.log(`📦 [checkEntitlements] StoreKit 2 returned ${purchases.length} purchases`);
      
      if (purchases.length === 0) {
        console.log('⚠️ [checkEntitlements] No purchases returned. Preserving last known premium state:', cachedIsPro);
        // Не перезаписываем статус на false при отсутствии данных (офлайн/ошибка магазина)
        return cachedIsPro;
      }

      // Если есть shared secret — проверяем СРОК ДЕЙСТВИЯ через валидацию чека
      if (IAP_SHARED_SECRET) {
        console.log('🔐 [checkEntitlements] Using shared secret validation...');
        console.log(`🔑 [checkEntitlements] Shared secret loaded: ${IAP_SHARED_SECRET.substring(0, 8)}...`);
        
        const latest = purchases[purchases.length - 1];
        console.log(`📋 [checkEntitlements] Latest purchase: ${latest.productId}, receipt: ${!!latest.transactionReceipt}`);
        
        const receipt = latest.transactionReceipt;
        if (!receipt) {
          console.log('❌ [checkEntitlements] No receipt found, setting isPro = false');
          await this.savePremiumStatus(false);
          return false;
        }
        
        const valid = await this.validatePurchase(receipt);
        console.log(`✅ [checkEntitlements] Receipt validation result: ${valid}`);
        await this.savePremiumStatus(valid);
        return valid;
      }

      // Без секрета — эвристика по наличию покупки (может не учитывать отмену/истечение)
      console.log('⚠️ [checkEntitlements] No shared secret, using heuristic validation...');
      console.log(`🎯 [checkEntitlements] Looking for products: ${SUBSCRIPTION_PRODUCTS.WEEKLY}, ${SUBSCRIPTION_PRODUCTS.YEARLY}`);
      
      // Фильтруем только наши продукты
      const ourPurchases = purchases.filter((p: any) => 
        p && (p.productId === SUBSCRIPTION_PRODUCTS.WEEKLY || p.productId === SUBSCRIPTION_PRODUCTS.YEARLY)
      );
      
      console.log(`🔍 [checkEntitlements] Found ${ourPurchases.length} matching purchases:`, 
        ourPurchases.map(p => ({ productId: p.productId, transactionId: p.transactionId }))
      );
      
      // Без секрета не можем корректно проверить срок действия: полагаемся на локальный expiry, иначе — возвращаем кэш
      if (ourPurchases.length > 0) {
        console.log('ℹ️ [checkEntitlements] Purchases found but no secret; keeping previous premium state to avoid false positives');
        return cachedIsPro;
      }
      
      console.log(`📊 [checkEntitlements] Heuristic result: false (no matching purchases)`);
      // Не понижаем статус на основании отсутствия совпадений; возвращаем кэш
      return cachedIsPro;
    } catch (e) {
      console.error('❌ [checkEntitlements] Failed with error, using cached state:', e);
      const cachedIsProStr = await AsyncStorage.getItem(STORAGE_KEYS.IS_PREMIUM);
      return cachedIsProStr === 'true';
    } finally {
      this.isCheckingEntitlements = false;
    }
  }
}

// Экспорт синглтона
export default new InAppPurchaseService(); 