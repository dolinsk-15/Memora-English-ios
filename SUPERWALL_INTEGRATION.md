# Superwall Integration Guide

## Overview
This app uses Superwall SDK for subscription management and paywall presentation. The integration is designed to work with StoreKit 2 and handles subscription status changes automatically.

## Key Components

### 1. SuperwallService (`src/services/SuperwallService.ts`)
The main service that handles all Superwall-related operations:

- **Initialization**: Sets up subscription status listeners
- **Paywall Presentation**: Shows paywalls with proper handlers
- **Subscription Status Management**: Tracks active/inactive subscriptions
- **Purchase Restoration**: Handles restore purchases functionality
- **Local Storage**: Caches purchase status for offline access

### 2. PremiumContext (`src/contexts/PremiumContext.tsx`)
Manages the premium state across the app:

- Listens to subscription status changes
- Updates UI when subscription status changes
- Provides `isPro` boolean for easy access throughout the app

### 3. LocalizationContext (`src/contexts/LocalizationContext.tsx`)
Handles Superwall configuration:

- Configures Superwall with proper API keys
- Sets locale based on user's language preference
- Initializes SuperwallService after configuration

## How It Works

### Subscription Status Flow
1. **App Launch**: Superwall is configured in LocalizationContext
2. **Service Initialization**: SuperwallService sets up subscription listeners
3. **Status Check**: Checks current subscription status from Superwall
4. **Local Cache**: Stores status in AsyncStorage for offline access
5. **UI Updates**: PremiumContext updates `isPro` state
6. **Lesson Unlocking**: LessonListScreen unlocks lessons based on `isPro` status

### Paywall Flow
1. **User Taps Locked Lesson**: LessonListScreen detects locked lesson
2. **Paywall Trigger**: Calls `SuperwallService.showPaywall()`
3. **Purchase Handling**: Superwall handles the purchase flow
4. **Status Update**: Subscription status listener detects change
5. **UI Refresh**: PremiumContext updates and lessons unlock

### Purchase Restoration
1. **User Taps Restore**: Settings screen calls `SuperwallService.restorePurchases()`
2. **StoreKit Check**: Superwall checks with App Store/Google Play
3. **Status Update**: If valid subscription found, status updates
4. **UI Refresh**: Lessons unlock automatically

## API Keys
- **iOS**: `pk_7bada5a2e111237e170524320d8090d8a8d3d03a19c4e5d4`
- **Android**: `pk_eadb79180723f2d5c819c5a58fb1192d22e3035d414a8a6c`

## Configuration
Superwall is configured in `LocalizationContext.tsx` with:
- Platform-specific API keys
- Locale identifier based on user's language
- Automatic service initialization

## Usage Examples

### Check if user has premium
```typescript
import { usePremium } from '../contexts/PremiumContext';

const { isPro } = usePremium();
if (isPro) {
  // User has active subscription
}
```

### Show paywall
```typescript
import SuperwallService from '../services/SuperwallService';

await SuperwallService.showPaywall('campaign_trigger');
```

### Restore purchases
```typescript
import SuperwallService from '../services/SuperwallService';

const restored = await SuperwallService.restorePurchases();
if (restored) {
  // Purchases restored successfully
}
```

## Troubleshooting

### Common Issues
1. **Lessons not unlocking after purchase**: Check if SuperwallService is properly initialized
2. **Paywall not showing**: Verify API keys and Superwall configuration
3. **Subscription status not updating**: Check subscription status listeners

### Debug Logs
The integration includes extensive logging. Look for:
- `[SuperwallService]` - Service operations
- `[Premium]` - Premium context updates
- `[LocalizationContext]` - Configuration logs

### Testing
1. Use sandbox accounts for testing
2. Test purchase flow in development
3. Verify restore purchases functionality
4. Check subscription status persistence

## Files Modified
- `src/services/SuperwallService.ts` - Main service implementation
- `src/contexts/PremiumContext.tsx` - Premium state management
- `src/contexts/LocalizationContext.tsx` - Superwall configuration
- `src/screens/Main/LessonListScreen.tsx` - Lesson unlocking logic
- `src/screens/Settings/SettingsScreen.tsx` - Restore purchases UI 