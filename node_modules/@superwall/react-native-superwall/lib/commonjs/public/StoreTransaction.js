"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoreTransaction = void 0;
class StoreTransaction {
  constructor({
    configRequestId,
    appSessionId,
    transactionDate,
    originalTransactionIdentifier,
    storeTransactionId,
    originalTransactionDate,
    webOrderLineItemID,
    appBundleId,
    subscriptionGroupId,
    isUpgraded,
    expirationDate,
    offerId,
    revocationDate
  }) {
    this.configRequestId = configRequestId;
    this.appSessionId = appSessionId;
    this.transactionDate = transactionDate ? new Date(transactionDate) : null;
    this.originalTransactionIdentifier = originalTransactionIdentifier;
    this.storeTransactionId = storeTransactionId || null;
    this.originalTransactionDate = originalTransactionDate ? new Date(originalTransactionDate) : null;
    this.webOrderLineItemID = webOrderLineItemID || null;
    this.appBundleId = appBundleId || null;
    this.subscriptionGroupId = subscriptionGroupId || null;
    this.isUpgraded = isUpgraded ?? null;
    this.expirationDate = expirationDate ? new Date(expirationDate) : null;
    this.offerId = offerId || null;
    this.revocationDate = revocationDate ? new Date(revocationDate) : null;
  }
  static fromJson(json) {
    return new StoreTransaction({
      configRequestId: json.configRequestId,
      appSessionId: json.appSessionId,
      transactionDate: json.transactionDate,
      originalTransactionIdentifier: json.originalTransactionIdentifier,
      storeTransactionId: json.storeTransactionId,
      originalTransactionDate: json.originalTransactionDate,
      webOrderLineItemID: json.webOrderLineItemID,
      appBundleId: json.appBundleId,
      subscriptionGroupId: json.subscriptionGroupId,
      isUpgraded: json.isUpgraded,
      expirationDate: json.expirationDate,
      offerId: json.offerId,
      revocationDate: json.revocationDate
    });
  }
}
exports.StoreTransaction = StoreTransaction;
//# sourceMappingURL=StoreTransaction.js.map