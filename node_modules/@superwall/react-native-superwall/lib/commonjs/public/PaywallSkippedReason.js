"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaywallSkippedReasonUserIsSubscribed = exports.PaywallSkippedReasonPlacementNotFound = exports.PaywallSkippedReasonNoAudienceMatch = exports.PaywallSkippedReasonHoldout = exports.PaywallSkippedReason = void 0;
var _Experiment = require("./Experiment");
class PaywallSkippedReason extends Error {
  constructor(message) {
    super(message);
    this.name = new.target.name;
  }
  static fromJson(json) {
    switch (json.type) {
      case 'Holdout':
        const experiment = _Experiment.Experiment.fromJson(json.experiment);
        return new PaywallSkippedReasonHoldout(experiment);
      case 'NoAudienceMatch':
        return new PaywallSkippedReasonNoAudienceMatch();
      case 'PlacementNotFound':
        return new PaywallSkippedReasonPlacementNotFound();
      case 'UserIsSubscribed':
        return new PaywallSkippedReasonUserIsSubscribed();
      default:
        throw new Error('Unknown PaywallSkippedReason type');
    }
  }
}

// Derived classes
exports.PaywallSkippedReason = PaywallSkippedReason;
class PaywallSkippedReasonHoldout extends PaywallSkippedReason {
  constructor(experiment) {
    super('Holdout');
    this.experiment = experiment;
  }
}
exports.PaywallSkippedReasonHoldout = PaywallSkippedReasonHoldout;
class PaywallSkippedReasonNoAudienceMatch extends PaywallSkippedReason {
  constructor() {
    super('NoAudienceMatch');
  }
}
exports.PaywallSkippedReasonNoAudienceMatch = PaywallSkippedReasonNoAudienceMatch;
class PaywallSkippedReasonPlacementNotFound extends PaywallSkippedReason {
  constructor() {
    super('PlacementNotFound');
  }
}
exports.PaywallSkippedReasonPlacementNotFound = PaywallSkippedReasonPlacementNotFound;
class PaywallSkippedReasonUserIsSubscribed extends PaywallSkippedReason {
  constructor() {
    super('UserIsSubscribed');
  }
}
exports.PaywallSkippedReasonUserIsSubscribed = PaywallSkippedReasonUserIsSubscribed;
//# sourceMappingURL=PaywallSkippedReason.js.map