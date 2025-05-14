export class PaywallPresentationHandler {
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
//# sourceMappingURL=PaywallPresentationHandler.js.map