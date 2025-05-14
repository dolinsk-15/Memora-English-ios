export declare enum VariantType {
    treatment = "treatment",
    holdout = "holdout"
}
export declare namespace VariantType {
    function toJson(type: VariantType): string;
    function fromJson(json: string): VariantType;
}
export declare class Variant {
    id: string;
    type: VariantType;
    paywallId?: string;
    constructor(id: string, type: VariantType, paywallId?: string);
    static fromJson(json: any): Variant;
    toJson(): {
        [key: string]: any;
    };
}
//# sourceMappingURL=Variant.d.ts.map