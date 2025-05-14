export let PaywallCloseReason = /*#__PURE__*/function (PaywallCloseReason) {
  PaywallCloseReason["SystemLogic"] = "systemLogic";
  PaywallCloseReason["ForNextPaywall"] = "forNextPaywall";
  PaywallCloseReason["WebViewFailedToLoad"] = "webViewFailedToLoad";
  PaywallCloseReason["ManualClose"] = "manualClose";
  PaywallCloseReason["None"] = "none";
  return PaywallCloseReason;
}({});
(function (_PaywallCloseReason) {
  function toJson(reason) {
    return reason;
  }
  _PaywallCloseReason.toJson = toJson;
  function fromJson(json) {
    switch (json) {
      case "systemLogic":
        return PaywallCloseReason.SystemLogic;
      case "forNextPaywall":
        return PaywallCloseReason.ForNextPaywall;
      case "webViewFailedToLoad":
        return PaywallCloseReason.WebViewFailedToLoad;
      case "manualClose":
        return PaywallCloseReason.ManualClose;
      case "none":
        return PaywallCloseReason.None;
      default:
        throw new Error(`Invalid PaywallCloseReason value: ${json}`);
    }
  }
  _PaywallCloseReason.fromJson = fromJson;
})(PaywallCloseReason || (PaywallCloseReason = {}));
//# sourceMappingURL=PaywallCloseReason.js.map