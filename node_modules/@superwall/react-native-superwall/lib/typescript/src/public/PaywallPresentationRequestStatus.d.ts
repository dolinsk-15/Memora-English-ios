import { Experiment } from './Experiment';
export declare enum PaywallPresentationRequestStatusType {
    presentation = "presentation",
    noPresentation = "noPresentation",
    timeout = "timeout"
}
export declare class PaywallPresentationRequestStatus {
    type: PaywallPresentationRequestStatusType;
    private constructor();
    static fromJson(json: {
        [key: string]: any;
    }): PaywallPresentationRequestStatus;
}
export declare enum PaywallPresentationRequestStatusReasonType {
    debuggerPresented = "debuggerPresented",
    paywallAlreadyPresented = "paywallAlreadyPresented",
    userIsSubscribed = "userIsSubscribed",
    holdout = "holdout",
    noAudienceMatch = "noAudienceMatch",
    placementNotFound = "placementNotFound",
    noPaywallViewController = "noPaywallViewController",
    noPresenter = "noPresenter",
    noConfig = "noConfig",
    subscriptionStatusTimeout = "subscriptionStatusTimeout"
}
export declare class PaywallPresentationRequestStatusReason {
    type: PaywallPresentationRequestStatusReasonType;
    experiment?: Experiment;
    private constructor();
    static fromJson(json: {
        [key: string]: any;
    }): PaywallPresentationRequestStatusReason;
}
//# sourceMappingURL=PaywallPresentationRequestStatus.d.ts.map