"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaywallPresentationHandler = void 0;
class PaywallPresentationHandler {
  // Handlers for various events

  // Setters for the handlers
  onPresent(handler) {
    this.onPresentHandler = handler;
  }
  onDismiss(handler) {
    this.onDismissHandler = handler;
  }
  onError(handler) {
    this.onErrorHandler = handler;
  }
  onSkip(handler) {
    this.onSkipHandler = handler;
  }
}
exports.PaywallPresentationHandler = PaywallPresentationHandler;
//# sourceMappingURL=PaywallPresentationHandler.js.map