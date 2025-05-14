export type PaywallResult = {
    type: 'purchased';
    productId: string;
} | {
    type: 'declined';
} | {
    type: 'restored';
};
export declare function fromJson(json: any): PaywallResult;
//# sourceMappingURL=PaywallResult.d.ts.map