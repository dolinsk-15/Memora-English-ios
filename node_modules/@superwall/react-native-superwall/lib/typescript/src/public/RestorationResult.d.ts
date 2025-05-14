export declare abstract class RestorationResult {
    abstract toJson(): Object;
    static restored(): Restored;
    static failed(error?: Error): Failed;
}
export declare class Restored extends RestorationResult {
    toJson(): {
        result: string;
    };
}
export declare class Failed extends RestorationResult {
    error?: Error | undefined;
    constructor(error?: Error | undefined);
    toJson(): {
        result: string;
        errorMessage: string | null;
    };
}
//# sourceMappingURL=RestorationResult.d.ts.map