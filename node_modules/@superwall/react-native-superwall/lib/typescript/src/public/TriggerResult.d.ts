import { Experiment } from './Experiment';
export declare enum TriggerResultType {
    placementNotFound = 0,
    noAudienceMatch = 1,
    paywall = 2,
    holdout = 3,
    error = 4
}
export declare class TriggerResult {
    type: TriggerResultType;
    experiment?: Experiment;
    error?: string;
    private constructor();
    static placementNotFound(): TriggerResult;
    static noAudienceMatch(): TriggerResult;
    static paywall(experiment: Experiment): TriggerResult;
    static holdout(experiment: Experiment): TriggerResult;
    static error(error: string): TriggerResult;
    static fromJson(json: any): TriggerResult;
}
//# sourceMappingURL=TriggerResult.d.ts.map