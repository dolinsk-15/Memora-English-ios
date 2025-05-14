"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RedemptionResults = void 0;
var _Entitlement = require("./Entitlement");
/**
 * RedemptionResult and related types
 * Corresponds to the Swift RedemptionResult enum and its associated types
 */

/**
 * Information about an error that occurred during code redemption
 */

/**
 * Information about an expired redemption code
 */

/**
 * Represents the ownership of a redemption code
 */

/**
 * Store identifiers for the purchase
 */

// For unknown store types

/**
 * Information about the purchaser
 */

/**
 * Information about the paywall the purchase was made from
 */

/**
 * Information about a successful redemption
 */

/**
 * The result of redeeming a code via web checkout
 */

/**
 * Static methods for working with RedemptionResult
 */
class RedemptionResults {
  static fromJson(json) {
    const {
      status,
      code
    } = json;
    switch (status) {
      case 'SUCCESS':
        return {
          status,
          code,
          redemptionInfo: this.parseRedemptionInfo(json.redemptionInfo)
        };
      case 'ERROR':
        return {
          status,
          code,
          error: {
            message: json.error.message
          }
        };
      case 'CODE_EXPIRED':
        return {
          status,
          code,
          expired: {
            resent: json.expired.resent,
            obfuscatedEmail: json.expired.obfuscatedEmail
          }
        };
      case 'INVALID_CODE':
        return {
          status,
          code
        };
      case 'EXPIRED_SUBSCRIPTION':
        return {
          status,
          code,
          redemptionInfo: this.parseRedemptionInfo(json.redemptionInfo)
        };
      default:
        throw new Error(`Unknown RedemptionResult status: ${status}`);
    }
  }
  static parseRedemptionInfo(json) {
    const result = {
      ownership: this.parseOwnership(json.ownership),
      purchaserInfo: this.parsePurchaserInfo(json.purchaserInfo),
      entitlements: Array.isArray(json.entitlements) ? json.entitlements.map(e => _Entitlement.Entitlement.fromJson(e)) : []
    };
    if (json.paywallInfo) {
      result.paywallInfo = {
        identifier: json.paywallInfo.identifier,
        placementName: json.paywallInfo.placementName,
        placementParams: json.paywallInfo.placementParams || {},
        variantId: json.paywallInfo.variantId,
        experimentId: json.paywallInfo.experimentId
      };
    }
    return result;
  }
  static parseOwnership(json) {
    switch (json.type) {
      case 'APP_USER':
        return {
          type: 'APP_USER',
          appUserId: json.appUserId
        };
      case 'DEVICE':
        return {
          type: 'DEVICE',
          deviceId: json.deviceId
        };
      default:
        throw new Error(`Unknown ownership type: ${json.type}`);
    }
  }
  static parsePurchaserInfo(json) {
    const result = {
      appUserId: json.appUserId,
      storeIdentifiers: this.parseStoreIdentifiers(json.storeIdentifiers)
    };
    if (json.email) {
      result.email = json.email;
    }
    return result;
  }
  static parseStoreIdentifiers(json) {
    if (json.store === 'STRIPE') {
      return {
        store: 'STRIPE',
        stripeCustomerId: json.stripeCustomerId,
        stripeSubscriptionIds: json.stripeSubscriptionIds || []
      };
    }
    return {
      ...json
    };
  }
}
exports.RedemptionResults = RedemptionResults;
//# sourceMappingURL=RedemptionResults.js.map