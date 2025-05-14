"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Assignment = void 0;
var _Experiment = require("./Experiment");
class Assignment {
  constructor(experimentId, variant, isSentToServer) {
    this.experimentId = experimentId;
    this.variant = variant;
    this.isSentToServer = isSentToServer;
  }
  static fromJson(json) {
    return new Assignment(json.experimentId, _Experiment.Variant.fromJson(json.variant), json.isSentToServer ?? false);
  }
}
exports.Assignment = Assignment;
//# sourceMappingURL=Assigments.js.map