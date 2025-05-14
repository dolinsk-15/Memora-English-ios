import { PaywallInfo } from './PaywallInfo';
import { PaywallSkippedReason } from './PaywallSkippedReason';
import type { PaywallResult } from './PaywallResult';
export declare class PaywallPresentationHandler {
    onPresentHandler?: (info: PaywallInfo) => void;
    onDismissHandler?: (info: PaywallInfo, result: PaywallResult) => void;
    onErrorHandler?: (error: string) => void;
    onSkipHandler?: (reason: PaywallSkippedReason) => void;
    onPresent(handler: (info: PaywallInfo) => void): void;
    onDismiss(handler: (info: PaywallInfo, result: PaywallResult) => void): void;
    onError(handler: (error: string) => void): void;
    onSkip(handler: (reason: PaywallSkippedReason) => void): void;
}
//# sourceMappingURL=PaywallPresentationHandler.d.ts.map