"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaywallPresentationRequestStatusType = exports.PaywallPresentationRequestStatusReasonType = exports.PaywallPresentationRequestStatusReason = exports.PaywallPresentationRequestStatus = void 0;
var _Experiment = require("./Experiment");
let PaywallPresentationRequestStatusType = exports.PaywallPresentationRequestStatusType = /*#__PURE__*/function (PaywallPresentationRequestStatusType) {
  PaywallPresentationRequestStatusType["presentation"] = "presentation";
  PaywallPresentationRequestStatusType["noPresentation"] = "noPresentation";
  PaywallPresentationRequestStatusType["timeout"] = "timeout";
  return PaywallPresentationRequestStatusType;
}({});
class PaywallPresentationRequestStatus {
  constructor(type) {
    this.type = type;
  }
  static fromJson(json) {
    switch (json.status) {
      case 'presentation':
        return new PaywallPresentationRequestStatus(PaywallPresentationRequestStatusType.presentation);
      case 'noPresentation':
        return new PaywallPresentationRequestStatus(PaywallPresentationRequestStatusType.noPresentation);
      case 'timeout':
        return new PaywallPresentationRequestStatus(PaywallPresentationRequestStatusType.timeout);
      default:
        throw new Error('Invalid PaywallPresentationRequestStatus type');
    }
  }
}
exports.PaywallPresentationRequestStatus = PaywallPresentationRequestStatus;
let PaywallPresentationRequestStatusReasonType = exports.PaywallPresentationRequestStatusReasonType = /*#__PURE__*/function (PaywallPresentationRequestStatusReasonType) {
  PaywallPresentationRequestStatusReasonType["debuggerPresented"] = "debuggerPresented";
  PaywallPresentationRequestStatusReasonType["paywallAlreadyPresented"] = "paywallAlreadyPresented";
  PaywallPresentationRequestStatusReasonType["userIsSubscribed"] = "userIsSubscribed";
  PaywallPresentationRequestStatusReasonType["holdout"] = "holdout";
  PaywallPresentationRequestStatusReasonType["noAudienceMatch"] = "noAudienceMatch";
  PaywallPresentationRequestStatusReasonType["placementNotFound"] = "placementNotFound";
  PaywallPresentationRequestStatusReasonType["noPaywallViewController"] = "noPaywallViewController";
  PaywallPresentationRequestStatusReasonType["noPresenter"] = "noPresenter";
  PaywallPresentationRequestStatusReasonType["noConfig"] = "noConfig";
  PaywallPresentationRequestStatusReasonType["subscriptionStatusTimeout"] = "subscriptionStatusTimeout";
  return PaywallPresentationRequestStatusReasonType;
}({});
class PaywallPresentationRequestStatusReason {
  constructor(type, experiment) {
    this.type = type;
    this.experiment = experiment;
  }
  static fromJson(json) {
    switch (json.reason) {
      case 'debuggerPresented':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.debuggerPresented);
      case 'paywallAlreadyPresented':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.paywallAlreadyPresented);
      case 'userIsSubscribed':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.userIsSubscribed);
      case 'holdout':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.holdout, _Experiment.Experiment.fromJson(json.experiment));
      case 'noAudienceMatch':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.noAudienceMatch);
      case 'placementNotFound':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.placementNotFound);
      case 'noPaywallViewController':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.noPaywallViewController);
      case 'noPresenter':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.noPresenter);
      case 'noConfig':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.noConfig);
      case 'subscriptionStatusTimeout':
        return new PaywallPresentationRequestStatusReason(PaywallPresentationRequestStatusReasonType.subscriptionStatusTimeout);
      default:
        throw new Error('Invalid PaywallPresentationRequestStatusReason type');
    }
  }
}
exports.PaywallPresentationRequestStatusReason = PaywallPresentationRequestStatusReason;
//# sourceMappingURL=PaywallPresentationRequestStatus.js.map