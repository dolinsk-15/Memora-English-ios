export declare class Experiment {
    id: string;
    groupId: string;
    variant: Variant;
    constructor(id: string, groupId: string, variant: Variant);
    static fromJson(json: any): Experiment;
    toJson(): any;
}
export declare class Variant {
    id: string;
    type: VariantType;
    paywallId: string | null;
    constructor(id: string, type: VariantType, paywallId: string | null);
    static fromJson(json: any): Variant;
    toJson(): any;
}
export declare enum VariantType {
    TREATMENT = "TREATMENT",
    HOLDOUT = "HOLDOUT"
}
//# sourceMappingURL=Experiment.d.ts.map