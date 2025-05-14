import { Experiment } from './Experiment';
export class PresentationResult {
  static fromJson(json) {
    let experiment;
    if (json.experiment) {
      experiment = Experiment.fromJson(json.experiment);
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
export class PresentationResultPlacementNotFound extends PresentationResult {}
export class PresentationResultNoAudienceMatch extends PresentationResult {}
export class PresentationResultUserIsSubscribed extends PresentationResult {}
export class PresentationResultPaywallNotAvailable extends PresentationResult {}
export class PresentationResultHoldout extends PresentationResult {
  constructor(experiment) {
    super();
    this.experiment = experiment;
  }
}
export class PresentationResultPaywall extends PresentationResult {
  constructor(experiment) {
    super();
    this.experiment = experiment;
  }
}
//# sourceMappingURL=PresentationResult.js.map