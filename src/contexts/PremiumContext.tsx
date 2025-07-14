import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SuperwallService from '../services/SuperwallService';

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

const CHECK_INTERVAL = 30 * 60 * 1000; // 30 минут

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to persist with strict logic
  const persist = async (value: boolean, reason: string) => {
    setIsPro(value);
    try {
      await AsyncStorage.setItem('isPro', value ? 'true' : 'false');
      console.log(`[Premium] ✅ Value cached in AsyncStorage (reason: ${reason})`);
    } catch (e) {
      console.warn('[Premium] ⚠️ Failed to write AsyncStorage', e);
    }
  };

  // Main logic for subscription status
  const handleSubscriptionStatus = async (status: any, source: string) => {
    if (status === undefined || status === null) {
      // БЕЗОПАСНЫЙ fallback: проверяем время последней валидации
      const lastValidation = await AsyncStorage.getItem('last_validation_timestamp');
      const now = Date.now();
      const validationAge = lastValidation ? now - parseInt(lastValidation) : Number.MAX_SAFE_INTEGER;
      const CACHE_VALID_TIME = 24 * 60 * 60 * 1000; // 24 часа
      
      if (validationAge > CACHE_VALID_TIME) {
        // Кэш слишком старый, сбрасываем для безопасности
        console.log(`[Premium] 🔒 Cache too old (${Math.round(validationAge / (60 * 60 * 1000))}h), resetting to false for security`);
        setIsPro(false);
        await AsyncStorage.setItem('isPro', 'false');
        return;
      }
      
      // Используем кэш только если он свежий (< 24 часов)
      const cached = await AsyncStorage.getItem('isPro');
      const cachedBool = cached === 'true';
      setIsPro(cachedBool);
      console.log(`[Premium] ⚠️ Using fresh cache (${Math.round(validationAge / (60 * 1000))}min old): ${cachedBool}`);
      return;
    }
    
    // Сохраняем время последней валидации при получении статуса от Superwall
    await AsyncStorage.setItem('last_validation_timestamp', Date.now().toString());
    
    if (status.status === 'ACTIVE' || status.status === 'active') {
      await persist(true, source);
    } else if (status.status === 'INACTIVE' || status.status === 'inactive') {
      // Явно сбрасываем кэш и статус
      await persist(false, source + ' (INACTIVE)');
      console.log('[Premium] 🔒 Superwall reported INACTIVE, cache and state set to false');
    } else {
      await persist(false, source + ' (other)');
      console.log('[Premium] 🔒 Superwall reported unknown status, cache and state set to false');
    }
  };

  // Initialize and periodic check
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeAndCheckStatus = async () => {
      console.log("[Premium] 🚀 Starting initialization...");

      // --- NEW: Instant startup from cache ---
      try {
        const cachedIsPro = await AsyncStorage.getItem('isPro');
        if (cachedIsPro !== null) {
          console.log(`[Premium] ✨ Found cached status: ${cachedIsPro}. Starting instantly.`);
          setIsPro(cachedIsPro === 'true');
          setIsLoading(false); // Instantly remove loading screen
        } else {
          console.log('[Premium] No cached status. Will show loading screen on first launch.');
          setIsLoading(true); // Explicitly set loading for first launch
        }
      } catch (e) {
        console.warn('[Premium] ⚠️ Could not read cache. Defaulting to loading screen.', e);
        setIsLoading(true);
      }
      // --- END NEW ---

      // This timeout is now a safety net for the *first launch only*.
      // If we loaded from cache, isLoading is already false.
      const resolutionTimeout = setTimeout(() => {
        if (isLoading) { // Only run if we are still in the initial loading state
          console.warn('[Premium] ⚠️ Superwall did not provide a status within 5s on first launch. Assuming non-premium.');
          persist(false, 'Initialization Timeout');
          setIsLoading(false);
        }
      }, 5000);

      // Set up the callback. It will now ALWAYS update the state in the background.
      SuperwallService.setSubscriptionCallback((isActive: boolean) => {
        console.log(`[Premium] 📞 Superwall status update received: ${isActive}`);
        
        // Always clear the timeout when we get a real status
        clearTimeout(resolutionTimeout);

        // Persist the new state
        persist(isActive, 'Superwall Callback');

        // This is safe to call multiple times. It will only change state if we were loading.
        setIsLoading(false);
      });

      // Initialize Superwall in the background.
      try {
        await SuperwallService.initialize();
        console.log('[Premium] SuperwallService initialized. Waiting for status event...');
      } catch (error) {
        console.error('[Premium] ❌ CRITICAL: Superwall initialization failed.', error);
        clearTimeout(resolutionTimeout);
        persist(false, 'Initialization Error');
        setIsLoading(false);
      }

      // Set up periodic checks
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        console.log('[Premium] 🕒 Periodic check triggered.');
        await SuperwallService.syncPremiumStatus();
      }, CHECK_INTERVAL);
    };

    initializeAndCheckStatus();

    // --- NEW: AppState listener to refresh status on foreground ---
    const handleAppStateChange = (nextAppState: any) => {
      if (nextAppState === 'active') {
        console.log('[Premium] ✨ App came to foreground, forcing status check...');
        SuperwallService.syncPremiumStatus();
      }
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    // --- END NEW ---


    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      SuperwallService.cleanup();
      appStateSubscription.remove(); // --- NEW: Cleanup listener ---
      isInitialized.current = false;
    };
  }, []);

  return (
    <PremiumContext.Provider value={{ 
      isPro, 
      setPro: (v) => persist(v, 'manual setPro'),
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