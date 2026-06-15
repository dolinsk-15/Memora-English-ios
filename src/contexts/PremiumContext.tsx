import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import InAppPurchaseService from '../services/inAppPurchaseService';
// IAP инициализируем лениво на экранах Paywall

interface PremiumContextType {
  isPro: boolean;
  setPro: (value: boolean) => void;
  isLoading: boolean;
}

const PremiumContext = createContext<PremiumContextType>({
  isPro: false,
  setPro: () => {},
  isLoading: true,
});

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Простая функция для сохранения статуса
  const setPremiumStatus = async (value: boolean) => {
    console.log(`[Premium] 💾 Setting premium status to: ${value}`);
    setIsPro(value);
    try {
      await AsyncStorage.setItem('isPro', value ? 'true' : 'false');
      console.log(`[Premium] ✅ Status saved to AsyncStorage: ${value}`);
      
      // Принудительно обновляем UI если статус изменился на true
      if (value && !isPro) {
        console.log('[Premium] 🚀 Premium status activated, UI should update immediately');
      }
    } catch (e) {
      console.warn('[Premium] ⚠️ Failed to save to AsyncStorage', e);
    }
  };

  // Загружаем сохраненный статус при запуске
  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        // Загружаем сохранённый статус мгновенно для UX
        const savedStatus = await AsyncStorage.getItem('isPro');
        console.log(`[Premium] 📦 Loading from AsyncStorage 'isPro': ${savedStatus}`);
        // Дополнительно читаем локальную дату истечения и мгновенно понижаем доступ, если истёк
        const expiryRaw = await AsyncStorage.getItem('@subscription_expiry_ms');
        const expiryMs = expiryRaw ? parseInt(expiryRaw, 10) : 0;
        const now = Date.now();
        const expired = !!expiryMs && now >= expiryMs;

        if (savedStatus !== null) {
          const initialPro = savedStatus === 'true' && !expired;
          setIsPro(initialPro);
          console.log(`[Premium] ✨ Set isPro to: ${initialPro} (cached=${savedStatus}, expired=${expired})`);
        } else {
          console.log(`[Premium] ⚠️ No saved status found, keeping default: false`);
        }
        // Фоновая проверка StoreKit 2 (не блокирует UI)
        // Примечание: основная приоритетная проверка происходит в App.tsx при запуске
        // Здесь делаем дополнительную проверку только если App.tsx не успел
        setTimeout(async () => {
          try {
            console.log('[Premium] 🔄 Starting background subscription check...');
            
            // Проверяем, инициализирован ли уже сервис
            const checkWithTimeout = Promise.race([
              InAppPurchaseService.checkEntitlements(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Background check timeout')), 2000)
              )
            ]);
            
            const active = await checkWithTimeout;
            console.log(`[Premium] 🔄 Background StoreKit 2 check result: ${active}`);
            if (typeof active === 'boolean') {
              console.log(`[Premium] ✅ Background update isPro to: ${active}`);
              setPremiumStatus(active);
            }
          } catch (e) {
            console.warn('[Premium] Background entitlement check failed, using cached data:', e.message);
            // При ошибке используем кешированные данные
          }
        }, 1500); // Запускаем через 1.5 секунды после старта
      } catch (e) {
        console.warn('[Premium] ⚠️ Bootstrap failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  // Проверяем при возврате из фона
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Сначала быстрый локальный даунгрейд по истечению, затем сетевой чек
        (async () => {
          try {
            const expiryRaw = await AsyncStorage.getItem('@subscription_expiry_ms');
            const expiryMs = expiryRaw ? parseInt(expiryRaw, 10) : 0;
            if (expiryMs && Date.now() >= expiryMs) {
              console.log('[Premium] ⛔ Local expiry reached on foreground — disabling premium');
              await AsyncStorage.setItem('isPro', 'false');
              setIsPro(false);
            }
          } catch {}
          InAppPurchaseService.checkEntitlements().catch(() => {});
        })();
      }
    });
    return () => sub.remove();
  }, []);

  // Слушаем изменения статуса премиума для мгновенного обновления UI
  useEffect(() => {
    const unsub = InAppPurchaseService.onPremiumStatusChange((isPremium) => {
      console.log(`[Premium] 🔔 Premium status change received: ${isPremium}`);
      if (isPremium !== isPro) {
        console.log(`[Premium] 🔄 Status changed from ${isPro} to ${isPremium}, updating UI...`);
        setPremiumStatus(isPremium);
      }
    });
    return unsub;
  }, [isPro]);

  return (
    <PremiumContext.Provider value={{ 
      isPro, 
      setPro: setPremiumStatus,
      isLoading 
    }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used inside PremiumProvider');
  return ctx;
}; 