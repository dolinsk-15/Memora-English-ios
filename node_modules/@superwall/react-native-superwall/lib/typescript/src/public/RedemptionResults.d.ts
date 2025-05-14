/**
 * RedemptionResult and related types
 * Corresponds to the Swift RedemptionResult enum and its associated types
 */
import { Entitlement } from './Entitlement';
/**
 * Information about an error that occurred during code redemption
 */
export interface ErrorInfo {
    /** The error message */
    message: string;
}
/**
 * Information about an expired redemption code
 */
export interface ExpiredCodeInfo {
    /** Whether the redemption email was resent */
    resent: boolean;
    /** Optional obfuscated email address that the redemption email was sent to */
    obfuscatedEmail?: string;
}
/**
 * Represents the ownership of a redemption code
 */
export type Ownership = {
    type: 'APP_USER';
    appUserId: string;
} | {
    type: 'DEVICE';
    deviceId: string;
};
/**
 * Store identifiers for the purchase
 */
export type StoreIdentifiers = {
    store: 'STRIPE';
    stripeCustomerId: string;
    stripeSubscriptionIds: string[];
} | {
    store: string;
    [key: string]: any;
};
/**
 * Information about the purchaser
 */
export interface PurchaserInfo {
    /** The app user ID of the purchaser */
    appUserId: string;
    /** The email address of the purchaser (optional) */
    email?: string;
    /** The identifiers for the store the purchase was made from */
    storeIdentifiers: StoreIdentifiers;
}
/**
 * Information about the paywall the purchase was made from
 */
export interface PaywallInfo {
    /** The identifier of the paywall */
    identifier: string;
    /** The name of the placement */
    placementName: string;
    /** The params of the placement */
    placementParams: Record<string, any>;
    /** The ID of the paywall variant */
    variantId: string;
    /** The ID of the experiment that the paywall belongs to */
    experimentId: string;
}
/**
 * Information about a successful redemption
 */
export interface RedemptionInfo {
    /** The ownership of the code */
    ownership: Ownership;
    /** Information about the purchaser */
    purchaserInfo: PurchaserInfo;
    /** Information about the paywall the purchase was made from (optional) */
    paywallInfo?: PaywallInfo;
    /** The entitlements granted by the redemption */
    entitlements: Entitlement[];
}
/**
 * The result of redeeming a code via web checkout
 */
export type RedemptionResult = {
    status: 'SUCCESS';
    code: string;
    redemptionInfo: RedemptionInfo;
} | {
    status: 'ERROR';
    code: string;
    error: ErrorInfo;
} | {
    status: 'CODE_EXPIRED';
    code: string;
    expired: ExpiredCodeInfo;
} | {
    status: 'INVALID_CODE';
    code: string;
} | {
    status: 'EXPIRED_SUBSCRIPTION';
    code: string;
    redemptionInfo: RedemptionInfo;
};
/**
 * Static methods for working with RedemptionResult
 */
export declare class RedemptionResults {
    static fromJson(json: any): RedemptionResult;
    private static parseRedemptionInfo;
    private static parseOwnership;
    private static parsePurchaserInfo;
    private static parseStoreIdentifiers;
}
//# sourceMappingURL=RedemptionResults.d.ts.map