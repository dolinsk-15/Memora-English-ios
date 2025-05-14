export declare class PurchaseResult {
    type: string;
    error?: string | undefined;
    constructor(type: string, error?: string | undefined);
    toJSON(): {
        error?: string | undefined;
        type: string;
    };
}
export declare class PurchaseResultCancelled extends PurchaseResult {
    constructor();
}
export declare class PurchaseResultPurchased extends PurchaseResult {
    constructor();
}
export declare class PurchaseResultRestored extends PurchaseResult {
    constructor();
}
export declare class PurchaseResultPending extends PurchaseResult {
    constructor();
}
export declare class PurchaseResultFailed extends PurchaseResult {
    constructor(error: string);
}
//# sourceMappingURL=PurchaseResult.d.ts.map