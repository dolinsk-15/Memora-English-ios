"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TriggerResultType = exports.TriggerResult = void 0;
var _Experiment = require("./Experiment");
let TriggerResultType = exports.TriggerResultType = /*#__PURE__*/function (TriggerResultType) {
  TriggerResultType[TriggerResultType["placementNotFound"] = 0] = "placementNotFound";
  TriggerResultType[TriggerResultType["noAudienceMatch"] = 1] = "noAudienceMatch";
  TriggerResultType[TriggerResultType["paywall"] = 2] = "paywall";
  TriggerResultType[TriggerResultType["holdout"] = 3] = "holdout";
  TriggerResultType[TriggerResultType["error"] = 4] = "error";
  return TriggerResultType;
}({}); // TypeScript class for TriggerResult
class TriggerResult {
  constructor(type, experiment, error) {
    this.type = type;
    this.experiment = experiment;
    this.error = error;
  }
  static placementNotFound() {
    return new TriggerResult(TriggerResultType.placementNotFound);
  }
  static noAudienceMatch() {
    return new TriggerResult(TriggerResultType.noAudienceMatch);
  }
  static paywall(experiment) {
    return new TriggerResult(TriggerResultType.paywall, experiment);
  }
  static holdout(experiment) {
    return new TriggerResult(TriggerResultType.holdout, experiment);
  }
  static error(error) {
    return new TriggerResult(TriggerResultType.error, undefined, error);
  }
  static fromJson(json) {
    switch (json.result) {
      case 'placementNotFound':
        return TriggerResult.placementNotFound();
      case 'noAudienceMatch':
        return TriggerResult.noAudienceMatch();
      case 'paywall':
        return TriggerResult.paywall(_Experiment.Experiment.fromJson(json.experiment));
      case 'holdout':
        return TriggerResult.holdout(_Experiment.Experiment.fromJson(json.experiment));
      case 'error':
        return TriggerResult.error(json.error);
      default:
        throw new Error('Invalid TriggerResult type');
    }
  }
}
exports.TriggerResult = TriggerResult;
//# sourceMappingURL=TriggerResult.js.map