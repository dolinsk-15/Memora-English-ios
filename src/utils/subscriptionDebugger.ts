import AsyncStorage from '@react-native-async-storage/async-storage';
import SuperwallService from '../services/SuperwallService';
import Superwall from '@superwall/react-native-superwall';

export class SubscriptionDebugger {
  static async debugFullStatus() {
    console.log('🔍 === SUBSCRIPTION DEBUG REPORT ===');
    
    try {
      // 1. Superwall Service Status
      console.log('📊 1. SuperwallService Status:');
      await SuperwallService.debugStatus();
      
      // 2. AsyncStorage Values
      console.log('📦 2. AsyncStorage Values:');
      const keys = ['isPro', 'has_purchased_all_lessons', 'purchase_status', 'last_sync_timestamp'];
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`   ${key}: ${value}`);
      }
      
      // 3. All AsyncStorage Keys
      console.log('🔑 3. All AsyncStorage Keys:');
      const allKeys = await AsyncStorage.getAllKeys();
      const subscriptionKeys = allKeys.filter(key => 
        key.includes('purchase') || 
        key.includes('pro') || 
        key.includes('subscription') ||
        key.includes('sync')
      );
      console.log('   Subscription-related keys:', subscriptionKeys);
      
      // 4. Superwall Raw Status
      console.log('🎯 4. Superwall Raw Status:');
      const rawStatus = (Superwall as any).shared.subscriptionStatus;
      console.log('   Raw subscription status:', rawStatus);
      console.log('   Type:', typeof rawStatus);
      console.log('   Status property:', rawStatus?.status);
      
      // 5. Test isPurchased
      console.log('✅ 5. isPurchased() Test:');
      const isPurchased = await SuperwallService.isPurchased();
      console.log('   Result:', isPurchased);
      
    } catch (error) {
      console.error('❌ Debug error:', error);
    }
    
    console.log('🔍 === END DEBUG REPORT ===');
  }
  
  static async clearAllSubscriptionData() {
    console.log('🧹 Clearing all subscription data...');
    
    try {
      const keys = [
        'isPro', 
        'has_purchased_all_lessons', 
        'purchase_status', 
        'last_sync_timestamp'
      ];
      
      for (const key of keys) {
        await AsyncStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
      }
      
      console.log('✅ All subscription data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  }
  
  static async simulateSubscriptionChange() {
    console.log('🎭 Simulating subscription change...');
    
    try {
      // Force sync to trigger any pending updates
      await SuperwallService.syncPremiumStatus();
      console.log('✅ Sync completed');
    } catch (error) {
      console.error('❌ Error during sync:', error);
    }
  }
}

export default SubscriptionDebugger; 