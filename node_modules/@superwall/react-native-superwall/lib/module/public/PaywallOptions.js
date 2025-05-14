// Defines the different types of views that can appear behind Apple's payment sheet during a transaction.
export let TransactionBackgroundView = /*#__PURE__*/function (TransactionBackgroundView) {
  TransactionBackgroundView["spinner"] = "spinner";
  TransactionBackgroundView["none"] = "none";
  return TransactionBackgroundView;
}({});

// Defines the messaging of the alert presented to the user when restoring a transaction fails.
export class RestoreFailed {
  title = 'No Subscription Found';
  message = "We couldn't find an active subscription for your account.";
  closeButtonTitle = 'Okay';
  toJson() {
    return {
      title: this.title,
      message: this.message,
      closeButtonTitle: this.closeButtonTitle
    };
  }
}

// Options for configuring the appearance and behavior of paywalls.
export class PaywallOptions {
  isHapticFeedbackEnabled = true;
  restoreFailed = new RestoreFailed();
  shouldShowPurchaseFailureAlert = true;
  shouldPreload = false;
  automaticallyDismiss = true;
  transactionBackgroundView = TransactionBackgroundView.spinner;
  toJson() {
    return {
      isHapticFeedbackEnabled: this.isHapticFeedbackEnabled,
      restoreFailed: this.restoreFailed.toJson(),
      shouldShowPurchaseFailureAlert: this.shouldShowPurchaseFailureAlert,
      shouldPreload: this.shouldPreload,
      automaticallyDismiss: this.automaticallyDismiss,
      transactionBackgroundView: this.transactionBackgroundView
    };
  }
}
//# sourceMappingURL=PaywallOptions.js.map