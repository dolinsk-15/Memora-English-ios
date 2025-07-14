import AsyncStorage from '@react-native-async-storage/async-storage';
import Superwall, { SubscriptionStatus } from "@superwall/react-native-superwall";
import { Platform } from 'react-native';

const PURCHASE_STATUS_KEY = 'purchase_status';
const HAS_PURCHASED_KEY = 'has_purchased_all_lessons';
const LAST_SYNC_KEY = 'last_sync_timestamp';

type SubscriptionCallback = (isActive: boolean) => void;

class SuperwallService {
  private isInitialized = false;
  private subscriptionListener: any = null;
  private subscriptionCallback: SubscriptionCallback | null = null;
  private lastKnownStatus: boolean | null = null;
  private isSyncing = false;

  setSubscriptionCallback(cb: SubscriptionCallback) {
    this.subscriptionCallback = cb;
  }

  // Initialize Superwall service
  initialize = async () => {
    if (this.isInitialized) {
      console.log('[SuperwallService] Already initialized, checking status...');
      await this.checkPurchaseStatus();
      return true;
    }

    try {
      console.log('[SuperwallService] 🚀 Initializing...');

      // Set up subscription status listener
      this.subscriptionListener = Superwall.shared.subscriptionStatusEmitter.addListener("change", (newStatus: SubscriptionStatus) => {
        console.log('[SuperwallService] 📡 Subscription status changed:', newStatus);
        this.handleSubscriptionStatusChange(newStatus);
      });

      await this.checkPurchaseStatus();
      this.isInitialized = true;
      console.log('[SuperwallService] ✅ Successfully initialized');
      return true;
    } catch (error) {
      console.error('[SuperwallService] ❌ Failed to initialize:', error);
      this.isInitialized = false;
      return false;
    }
  };

  // Handle subscription status changes with guards
  private handleSubscriptionStatusChange = async (status: SubscriptionStatus) => {
    try {
      console.log('[SuperwallService] 📡 Raw subscription status received:', JSON.stringify(status));
      
      // Guard: prevent processing if we're already syncing
      if (this.isSyncing) {
        console.log('[SuperwallService] ⏳ Skipping status change - already syncing');
        return;
      }

      // Guard: проверяем что статус валидный
      if (!status || typeof status !== 'object') {
        console.log('[SuperwallService] ⚠️ Invalid status object received, skipping');
        return;
      }

      const isActive = status.status === "ACTIVE";
      
      // Guard: prevent unnecessary updates if status hasn't changed
      // lastKnownStatus is null on the first run, so this will proceed.
      if (this.lastKnownStatus !== null && this.lastKnownStatus === isActive) {
        console.log(`[SuperwallService] ⏭️ Skipping update - status unchanged: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        return;
      }

      console.log(`[SuperwallService] 🔄 Processing status change: ${status.status} (isActive: ${isActive})`);
      
      this.isSyncing = true;
      
      // Update cache only if status is ACTIVE, otherwise reset
      await AsyncStorage.setItem(HAS_PURCHASED_KEY, JSON.stringify(isActive));
      await AsyncStorage.setItem(PURCHASE_STATUS_KEY, JSON.stringify({
        purchased: isActive,
        timestamp: Date.now()
      }));
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      
      this.lastKnownStatus = isActive;
      
      // Call the subscription callback if set
      if (this.subscriptionCallback) {
        console.log(`[SuperwallService] 📞 Calling subscription callback: ${isActive}`);
        this.subscriptionCallback(isActive);
      }
      
      console.log(`[SuperwallService] ✅ Status updated successfully: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (error) {
      console.error('[SuperwallService] ❌ Error handling subscription status change:', error);
    } finally {
      this.isSyncing = false;
    }
  };

  // Show paywall
  showPaywall = async (placementId: string = "campaign_trigger"): Promise<void> => {
    try {
      console.log(`[SuperwallService] 🎯 Showing paywall for placement: ${placementId}`);
      await Superwall.shared.register({
        placement: placementId,
        handler: {
          onDismiss: (setHandler: any) => {
            setHandler(async (_info: any, result: any) => {
              console.log('[SuperwallService] 🚪 Paywall dismissed:', result);
              // Принудительно обновляем статус подписки после закрытия Paywall
              await this.forceCheckSubscription();
            });
          },
          onPresent: (setHandler: any) => {
            setHandler(() => {
              console.log('[SuperwallService] 🎬 Paywall presented');
            });
          },
          onError: (setHandler: any) => {
            setHandler((error: any) => {
              console.error('[SuperwallService] ❌ Paywall error:', error);
            });
          },
          onSkip: () => {
            console.log('[SuperwallService] ⏭️ Paywall skipped');
          },
        },
        feature: () => {
          console.log('[SuperwallService] 🔒 Feature block executed');
        },
      });
    } catch (error) {
      console.error(`[SuperwallService] ❌ Error showing paywall:`, error);
      throw error;
    }
  };

  // Simplified purchase check with better error handling
  isPurchased = async (): Promise<boolean> => {
    try {
      // Always check Superwall status first
      const subscriptionStatus = (Superwall as any).shared.subscriptionStatus;
      console.log('[SuperwallService] 🔍 Current Superwall status:', subscriptionStatus);
      
      if (subscriptionStatus?.status === "ACTIVE" || subscriptionStatus === 'active') {
        console.log('[SuperwallService] ✅ Superwall reports ACTIVE subscription');
        return true;
      }
      
      // Fallback: use cache only if Superwall status is undefined/null
      if (subscriptionStatus === undefined || subscriptionStatus === null) {
        console.log('[SuperwallService] ⚠️ Superwall status undefined, using cache fallback');
        const purchasedStr = await AsyncStorage.getItem(HAS_PURCHASED_KEY);
        const purchased = purchasedStr === 'true' || purchasedStr === JSON.stringify(true);
        console.log(`[SuperwallService] 📦 Cache fallback result: ${purchased}`);
        return purchased;
      }
      
      console.log('[SuperwallService] ❌ Superwall reports INACTIVE subscription');
      return false;
    } catch (error) {
      console.error('[SuperwallService] ❌ Error checking purchase status:', error);
      // Fallback to cache on error
      try {
        const purchasedStr = await AsyncStorage.getItem(HAS_PURCHASED_KEY);
        const purchased = purchasedStr === 'true' || purchasedStr === JSON.stringify(true);
        console.log(`[SuperwallService] 🆘 Error fallback to cache: ${purchased}`);
        return purchased;
      } catch (cacheError) {
        console.error('[SuperwallService] ❌ Cache fallback also failed:', cacheError);
        return false;
      }
    }
  };

  // Restore purchases with better error handling
  restorePurchases = async (): Promise<boolean> => {
    try {
      console.log("[SuperwallService] 🔄 Restoring purchases...");
      await (Superwall as any).shared.restoreTransactions();
      
      // Wait a bit for Superwall to process the restore
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check status after restore
      const subscriptionStatus = (Superwall as any).shared.subscriptionStatus;
      console.log('[SuperwallService] 📊 Subscription status after restore:', subscriptionStatus);
      
      if (subscriptionStatus?.status === "ACTIVE" || subscriptionStatus === 'active') {
        console.log('[SuperwallService] ✅ Restore successful - subscription is ACTIVE');
        return true;
      }
      
      console.log('[SuperwallService] ❌ Restore completed but no active subscription found');
      return false;
    } catch (error) {
      console.error('[SuperwallService] ❌ Error during restore:', error);
      return false;
    }
  };

  // Get current subscription status
  getSubscriptionStatus = (): SubscriptionStatus | null => {
    try {
      return (Superwall as any).shared.subscriptionStatus;
    } catch (error) {
      console.error('[SuperwallService] ❌ Error getting subscription status:', error);
      return null;
    }
  };

  // Force sync premium status with guards
  syncPremiumStatus = async (): Promise<void> => {
    try {
      // Guard: prevent multiple simultaneous syncs
      if (this.isSyncing) {
        console.log('[SuperwallService] ⏳ Sync already in progress, skipping...');
        return;
      }

      this.isSyncing = true;
      console.log('[SuperwallService] 🔄 Starting premium status sync...');
      
      const isPurchased = await this.isPurchased();
      console.log('[SuperwallService] 📊 Sync result:', isPurchased);
      
      if (this.subscriptionCallback) {
        console.log('[SuperwallService] 📞 Calling subscription callback from sync');
        this.subscriptionCallback(isPurchased);
      }
    } catch (error) {
      console.error('[SuperwallService] ❌ Error syncing premium status:', error);
    } finally {
      this.isSyncing = false;
    }
  };

  // Enhanced debug method
  debugStatus = async (): Promise<void> => {
    try {
      console.log('=== 🔍 SuperwallService Debug ===');
      console.log('1. Superwall subscription status:', (Superwall as any).shared.subscriptionStatus);
      console.log('2. Local purchase status:', await AsyncStorage.getItem('has_purchased_all_lessons'));
      console.log('3. Purchase status object:', await AsyncStorage.getItem('purchase_status'));
      console.log('4. Last sync timestamp:', await AsyncStorage.getItem('last_sync_timestamp'));
      console.log('5. isPurchased() result:', await this.isPurchased());
      console.log('6. Is initialized:', this.isInitialized);
      console.log('7. Is syncing:', this.isSyncing);
      console.log('8. Last known status:', this.lastKnownStatus);
      console.log('=============================');
    } catch (error) {
      console.error('[SuperwallService] ❌ Debug error:', error);
    }
  };

  // Check purchase status on app startup
  private checkPurchaseStatus = async (): Promise<void> => {
    try {
      const subscriptionStatus = (Superwall as any).shared.subscriptionStatus;
      console.log('[SuperwallService] 🚀 Checking purchase status on startup:', subscriptionStatus);
      
      if (subscriptionStatus?.status === "ACTIVE" || subscriptionStatus === 'active') {
        await AsyncStorage.setItem(HAS_PURCHASED_KEY, JSON.stringify(true));
        await AsyncStorage.setItem(PURCHASE_STATUS_KEY, JSON.stringify({
          purchased: true,
          timestamp: Date.now()
        }));
        this.lastKnownStatus = true;
        console.log('[SuperwallService] ✅ User has active subscription on startup');
      } else {
        await AsyncStorage.setItem(HAS_PURCHASED_KEY, JSON.stringify(false));
        await AsyncStorage.setItem(PURCHASE_STATUS_KEY, JSON.stringify({
          purchased: false,
          timestamp: Date.now()
        }));
        this.lastKnownStatus = false;
        console.log('[SuperwallService] ❌ No active subscription on startup');
      }
    } catch (error) {
      console.error('[SuperwallService] ❌ Error checking purchase status on startup:', error);
    }
  };

  // Cleanup method
  cleanup = () => {
    if (this.subscriptionListener && typeof this.subscriptionListener.remove === 'function') {
      this.subscriptionListener.remove();
    }
    this.subscriptionListener = null;
    this.subscriptionCallback = null;
    this.isInitialized = false;
    console.log('[SuperwallService] 🧹 Cleanup completed');
  };

  // Force online check of subscription status
  forceCheckSubscription = async (): Promise<void> => {
    try {
      const status = (Superwall as any).shared.subscriptionStatus;
      console.log('[SuperwallService] 🔄 forceCheckSubscription, status:', status);
      
      // Используем полную логику проверки статуса (как в isPurchased)
      let isActive = false;
      
      if (status?.status === "ACTIVE" || status?.status === 'active') {
        isActive = true;
      } else if (status === undefined || status === null) {
        // НЕ используем callback если статус неопределён
        console.log('[SuperwallService] ⚠️ Status undefined in forceCheck, skipping callback');
        return;
      }
      // else status is INACTIVE or other → isActive = false
      
      if (this.subscriptionCallback) {
        console.log(`[SuperwallService] 📞 forceCheck calling callback: ${isActive}`);
        this.subscriptionCallback(isActive);
      }
    } catch (error) {
      console.error('[SuperwallService] ❌ Error in forceCheckSubscription:', error);
    }
  };
}

export default new SuperwallService(); 