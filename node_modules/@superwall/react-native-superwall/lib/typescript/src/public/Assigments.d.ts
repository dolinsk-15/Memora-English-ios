import { Variant } from './Experiment';
export declare class Assignment {
    experimentId: String;
    variant: Variant;
    isSentToServer: Boolean;
    constructor(experimentId: String, variant: Variant, isSentToServer: Boolean);
    static fromJson(json: any): Assignment;
}
export type ConfirmedAssignment = Assignment;
//# sourceMappingURL=Assigments.d.ts.map