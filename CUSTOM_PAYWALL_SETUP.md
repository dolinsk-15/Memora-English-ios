# Custom Paywall Setup Guide

## 🎯 Overview

This guide explains how to complete the setup of your custom paywall with StoreKit integration for iOS.

## 📱 Required Information from App Store Connect

To complete the integration, you need to provide the following:

### 1. Subscription Product IDs
Replace the placeholder values in `src/services/inAppPurchaseService.ts`:

```typescript
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: 'YOUR_MONTHLY_SUBSCRIPTION_ID', // e.g., com.yourapp.premium.monthly
  YEARLY: 'YOUR_YEARLY_SUBSCRIPTION_ID',    // e.g., com.yourapp.premium.yearly
};
```

### 2. Shared Secret (for receipt validation)
Replace the placeholder in `src/services/inAppPurchaseService.ts`:

```typescript
password: 'YOUR_SHARED_SECRET', // Get this from App Store Connect
```

### 3. Terms of Use & Privacy Policy URLs
Update the handlers in `src/screens/Paywall/CustomPaywallScreen.tsx`:

```typescript
const handleTermsPress = () => {
  // Add your Terms of Use URL
  Linking.openURL('https://yourapp.com/terms');
};

const handlePrivacyPress = () => {
  // Add your Privacy Policy URL
  Linking.openURL('https://yourapp.com/privacy');
};
```

## 🔧 iOS Setup

### 1. Configure iOS Capabilities
In Xcode:
1. Select your project
2. Go to "Signing & Capabilities"
3. Add "In-App Purchase" capability

### 2. Link react-native-iap
For iOS, run:
```bash
cd ios && pod install
```

### 3. Configure Products in App Store Connect
1. Log in to App Store Connect
2. Go to your app
3. Navigate to "Subscriptions" under "Monetization"
4. Create two auto-renewable subscriptions:
   - Monthly subscription
   - Yearly subscription
5. For each subscription:
   - Set the Reference Name
   - Set the Product ID (use these in your code)
   - Configure pricing
   - Add localized display names and descriptions

## 🔑 Getting Your Subscription IDs

1. In App Store Connect, go to your app
2. Navigate to "Subscriptions"
3. Copy the Product IDs for each subscription
4. Replace the placeholders in the code

Example Product IDs:
- Monthly: `com.memoraenglish.premium.monthly`
- Yearly: `com.memoraenglish.premium.yearly`

## 🔐 Getting the Shared Secret

1. In App Store Connect, go to your app
2. Navigate to "Subscriptions"
3. Click "App-Specific Shared Secret"
4. Generate or view your shared secret
5. Copy and replace in the code

## ✅ Testing Checklist

Before going live, test the following:

- [ ] Purchase flow works correctly
- [ ] Subscription status updates after purchase
- [ ] Restore purchases functionality works
- [ ] Paywall displays correct prices from App Store
- [ ] Premium content unlocks after purchase
- [ ] Terms and Privacy links work

## 🧪 Testing with Sandbox

1. Create sandbox tester accounts in App Store Connect
2. Sign out of your real App Store account on device
3. Use sandbox account when prompted during purchase
4. Test all subscription scenarios

## 🚀 Final Steps

Once you provide the required IDs, the paywall will:
1. Load real prices from the App Store
2. Handle purchases through StoreKit
3. Validate receipts
4. Update premium status in the app
5. Persist subscription status

## 📝 Notes

- The current implementation includes local receipt validation
- For production, implement server-side receipt validation
- The UI is fully customizable in `CustomPaywallScreen.tsx`
- Subscription status is managed through `InAppPurchaseService`

## 🆘 Troubleshooting

If products don't load:
1. Ensure products are in "Ready to Submit" state in App Store Connect
2. Check that capabilities are properly configured
3. Verify bundle ID matches App Store Connect
4. Make sure you're testing on a real device (not simulator for purchases) 