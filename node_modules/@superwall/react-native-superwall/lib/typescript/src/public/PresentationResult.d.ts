import { Experiment } from './Experiment';
export declare abstract class PresentationResult {
    static fromJson(json: any): PresentationResult;
}
export declare class PresentationResultPlacementNotFound extends PresentationResult {
}
export declare class PresentationResultNoAudienceMatch extends PresentationResult {
}
export declare class PresentationResultUserIsSubscribed extends PresentationResult {
}
export declare class PresentationResultPaywallNotAvailable extends PresentationResult {
}
export declare class PresentationResultHoldout extends PresentationResult {
    experiment: Experiment;
    constructor(experiment: Experiment);
}
export declare class PresentationResultPaywall extends PresentationResult {
    experiment: Experiment;
    constructor(experiment: Experiment);
}
//# sourceMappingURL=PresentationResult.d.ts.map