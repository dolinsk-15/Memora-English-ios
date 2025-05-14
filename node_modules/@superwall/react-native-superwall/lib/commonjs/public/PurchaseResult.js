"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PurchaseResultRestored = exports.PurchaseResultPurchased = exports.PurchaseResultPending = exports.PurchaseResultFailed = exports.PurchaseResultCancelled = exports.PurchaseResult = void 0;
// Base class
class PurchaseResult {
  constructor(type, error) {
    this.type = type;
    this.error = error;
  }
  toJSON() {
    return {
      type: this.type,
      ...(this.error && {
        error: this.error
      }) // Conditionally add error field if present
    };
  }
}

// Derived classes for specific purchase results
exports.PurchaseResult = PurchaseResult;
class PurchaseResultCancelled extends PurchaseResult {
  constructor() {
    super('cancelled');
  }
}
exports.PurchaseResultCancelled = PurchaseResultCancelled;
class PurchaseResultPurchased extends PurchaseResult {
  constructor() {
    super('purchased');
  }
}
exports.PurchaseResultPurchased = PurchaseResultPurchased;
class PurchaseResultRestored extends PurchaseResult {
  constructor() {
    super('restored');
  }
}
exports.PurchaseResultRestored = PurchaseResultRestored;
class PurchaseResultPending extends PurchaseResult {
  constructor() {
    super('pending');
  }
}
exports.PurchaseResultPending = PurchaseResultPending;
class PurchaseResultFailed extends PurchaseResult {
  constructor(error) {
    super('failed', error);
  }
}
exports.PurchaseResultFailed = PurchaseResultFailed;
//# sourceMappingURL=PurchaseResult.js.map