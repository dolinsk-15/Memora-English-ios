import { Experiment } from './Experiment';
export declare abstract class PaywallSkippedReason extends Error {
    constructor(message?: string);
    static fromJson(json: any): PaywallSkippedReason;
}
export declare class PaywallSkippedReasonHoldout extends PaywallSkippedReason {
    experiment: Experiment;
    constructor(experiment: Experiment);
}
export declare class PaywallSkippedReasonNoAudienceMatch extends PaywallSkippedReason {
    constructor();
}
export declare class PaywallSkippedReasonPlacementNotFound extends PaywallSkippedReason {
    constructor();
}
export declare class PaywallSkippedReasonUserIsSubscribed extends PaywallSkippedReason {
    constructor();
}
//# sourceMappingURL=PaywallSkippedReason.d.ts.map