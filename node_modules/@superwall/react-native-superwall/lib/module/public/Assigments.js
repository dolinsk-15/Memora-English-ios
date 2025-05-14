import { Variant } from './Experiment';
export class Assignment {
  constructor(experimentId, variant, isSentToServer) {
    this.experimentId = experimentId;
    this.variant = variant;
    this.isSentToServer = isSentToServer;
  }
  static fromJson(json) {
    return new Assignment(json.experimentId, Variant.fromJson(json.variant), json.isSentToServer ?? false);
  }
}
//# sourceMappingURL=Assigments.js.map