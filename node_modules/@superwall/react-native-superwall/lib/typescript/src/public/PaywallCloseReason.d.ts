export declare enum PaywallCloseReason {
    SystemLogic = "systemLogic",
    ForNextPaywall = "forNextPaywall",
    WebViewFailedToLoad = "webViewFailedToLoad",
    ManualClose = "manualClose",
    None = "none"
}
export declare namespace PaywallCloseReason {
    function toJson(reason: PaywallCloseReason): string;
    function fromJson(json: string): PaywallCloseReason;
}
//# sourceMappingURL=PaywallCloseReason.d.ts.map