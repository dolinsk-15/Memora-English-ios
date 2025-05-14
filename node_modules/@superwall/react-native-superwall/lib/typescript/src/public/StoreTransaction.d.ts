export declare class StoreTransaction {
    configRequestId: string;
    appSessionId: string;
    transactionDate?: Date | null;
    originalTransactionIdentifier: string;
    storeTransactionId?: string | null;
    originalTransactionDate?: Date | null;
    webOrderLineItemID?: string | null;
    appBundleId?: string | null;
    subscriptionGroupId?: string | null;
    isUpgraded?: boolean | null;
    expirationDate?: Date | null;
    offerId?: string | null;
    revocationDate?: Date | null;
    constructor({ configRequestId, appSessionId, transactionDate, originalTransactionIdentifier, storeTransactionId, originalTransactionDate, webOrderLineItemID, appBundleId, subscriptionGroupId, isUpgraded, expirationDate, offerId, revocationDate, }: {
        configRequestId: string;
        appSessionId: string;
        transactionDate?: string | null;
        originalTransactionIdentifier: string;
        storeTransactionId?: string | null;
        originalTransactionDate?: string | null;
        webOrderLineItemID?: string | null;
        appBundleId?: string | null;
        subscriptionGroupId?: string | null;
        isUpgraded?: boolean | null;
        expirationDate?: string | null;
        offerId?: string | null;
        revocationDate?: string | null;
    });
    static fromJson(json: any): StoreTransaction;
}
//# sourceMappingURL=StoreTransaction.d.ts.map