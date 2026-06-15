import Constants from 'expo-constants';

/**
 * Centralized IAP configuration reader.
 * Reads values from Expo extra or env and provides sane fallbacks.
 */

type IapProducts = {
  WEEKLY: string;
  YEARLY: string;
};

const extra: any = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra || {};

export const IAP_SHARED_SECRET: string =
  extra.IAP_SHARED_SECRET || process.env.IAP_SHARED_SECRET || '';

export const IAP_PRODUCTS: IapProducts = {
  WEEKLY: (extra.IAP_PRODUCTS && extra.IAP_PRODUCTS.WEEKLY) || 'YOUR_WEEKLY_SUBSCRIPTION_ID',
  YEARLY: (extra.IAP_PRODUCTS && extra.IAP_PRODUCTS.YEARLY) || 'YOUR_YEARLY_SUBSCRIPTION_ID',
};

export const isIapConfigured = (): boolean => {
  return Boolean(IAP_SHARED_SECRET) && Boolean(IAP_PRODUCTS.WEEKLY) && Boolean(IAP_PRODUCTS.YEARLY);
};


