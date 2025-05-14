import { StoreTransaction } from "./StoreTransaction";
export declare enum RestoreTypeCase {
    viaPurchase = 0,
    viaRestore = 1
}
export declare class RestoreType {
    type: RestoreTypeCase;
    storeTransaction?: StoreTransaction | undefined;
    private constructor();
    static viaPurchase(storeTransaction?: StoreTransaction): RestoreType;
    static viaRestore: RestoreType;
    static fromJson(json: any): RestoreType;
}
//# sourceMappingURL=RestoreType.d.ts.map