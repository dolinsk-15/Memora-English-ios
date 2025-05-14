"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PresentationResultUserIsSubscribed = exports.PresentationResultPlacementNotFound = exports.PresentationResultPaywallNotAvailable = exports.PresentationResultPaywall = exports.PresentationResultNoAudienceMatch = exports.PresentationResultHoldout = exports.PresentationResult = void 0;
var _Experiment = require("./Experiment");
class PresentationResult {
  static fromJson(json) {
    let experiment;
    if (json.experiment) {
      experiment = _Experiment.Experiment.fromJson(json.experiment);
    }
    switch (json.type) {
      case 'Holdout':
        if (!experiment) throw new Error('Holdout requires an experiment');
        return new PresentationResultHoldout(experiment);
      case 'Paywall':
        if (!experiment) throw new Error('Paywall requires an experiment');
        return new PresentationResultPaywall(experiment);
      case 'NoAudienceMatch':
        return new PresentationResultNoAudienceMatch();
      case 'PlacementNotFound':
        return new PresentationResultPlacementNotFound();
      case 'UserIsSubscribed':
        return new PresentationResultUserIsSubscribed();
      case 'PaywallNotAvailable':
        return new PresentationResultPaywallNotAvailable();
      default:
        throw new Error('Unknown PresentationResult type');
    }
  }
}

// Derived classes
exports.PresentationResult = PresentationResult;
class PresentationResultPlacementNotFound extends PresentationResult {}
exports.PresentationResultPlacementNotFound = PresentationResultPlacementNotFound;
class PresentationResultNoAudienceMatch extends PresentationResult {}
exports.PresentationResultNoAudienceMatch = PresentationResultNoAudienceMatch;
class PresentationResultUserIsSubscribed extends PresentationResult {}
exports.PresentationResultUserIsSubscribed = PresentationResultUserIsSubscribed;
class PresentationResultPaywallNotAvailable extends PresentationResult {}
exports.PresentationResultPaywallNotAvailable = PresentationResultPaywallNotAvailable;
class PresentationResultHoldout extends PresentationResult {
  constructor(experiment) {
    super();
    this.experiment = experiment;
  }
}
exports.PresentationResultHoldout = PresentationResultHoldout;
class PresentationResultPaywall extends PresentationResult {
  constructor(experiment) {
    super();
    this.experiment = experiment;
  }
}
exports.PresentationResultPaywall = PresentationResultPaywall;
//# sourceMappingURL=PresentationResult.js.map