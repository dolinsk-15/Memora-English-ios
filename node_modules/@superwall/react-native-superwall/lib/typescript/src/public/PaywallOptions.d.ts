export declare enum TransactionBackgroundView {
    spinner = "spinner",
    none = "none"
}
export declare class RestoreFailed {
    title: string;
    message: string;
    closeButtonTitle: string;
    toJson(): object;
}
export declare class PaywallOptions {
    isHapticFeedbackEnabled: boolean;
    restoreFailed: RestoreFailed;
    shouldShowPurchaseFailureAlert: boolean;
    shouldPreload: boolean;
    automaticallyDismiss: boolean;
    transactionBackgroundView: TransactionBackgroundView;
    toJson(): object;
}
//# sourceMappingURL=PaywallOptions.d.ts.map