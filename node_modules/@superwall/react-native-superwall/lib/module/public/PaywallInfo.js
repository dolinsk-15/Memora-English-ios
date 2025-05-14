import { ComputedPropertyRequest } from './ComputedPropertyRequest';
import { Experiment } from './Experiment';
import { featureGatingBehaviorFromJson } from './FeatureGatingBehavior';
import { LocalNotification } from './LocalNotification';
import { PaywallCloseReason } from './PaywallCloseReason';
import { Product } from './Product';
import { Survey } from './Survey';
export class PaywallInfo {
  // Assuming FeatureGatingBehavior is an enum defined elsewhere
  // Assuming PaywallCloseReason is an enum defined elsewhere
  // Assuming LocalNotification is defined elsewhere
  // Assuming ComputedPropertyRequest is defined elsewhere
  // Assuming Survey is defined elsewhere

  constructor({
    identifier,
    name,
    url,
    experiment,
    products,
    productIds,
    presentedByEventWithName,
    presentedByEventWithId,
    presentedByEventAt,
    presentedBy,
    presentationSourceType,
    responseLoadStartTime,
    responseLoadCompleteTime,
    responseLoadFailTime,
    responseLoadDuration,
    webViewLoadStartTime,
    webViewLoadCompleteTime,
    webViewLoadFailTime,
    webViewLoadDuration,
    productsLoadStartTime,
    productsLoadCompleteTime,
    productsLoadFailTime,
    productsLoadDuration,
    paywalljsVersion,
    isFreeTrialAvailable,
    featureGatingBehavior,
    closeReason,
    localNotifications,
    computedPropertyRequests,
    surveys
  }) {
    this.identifier = identifier;
    this.name = name;
    this.url = url;
    this.experiment = experiment;
    this.products = products;
    this.productIds = productIds;
    this.presentedByEventWithName = presentedByEventWithName;
    this.presentedByEventWithId = presentedByEventWithId;
    this.presentedByEventAt = presentedByEventAt;
    this.presentedBy = presentedBy;
    this.presentationSourceType = presentationSourceType;
    this.responseLoadStartTime = responseLoadStartTime;
    this.responseLoadCompleteTime = responseLoadCompleteTime;
    this.responseLoadFailTime = responseLoadFailTime;
    this.responseLoadDuration = responseLoadDuration;
    this.webViewLoadStartTime = webViewLoadStartTime;
    this.webViewLoadCompleteTime = webViewLoadCompleteTime;
    this.webViewLoadFailTime = webViewLoadFailTime;
    this.webViewLoadDuration = webViewLoadDuration;
    this.productsLoadStartTime = productsLoadStartTime;
    this.productsLoadCompleteTime = productsLoadCompleteTime;
    this.productsLoadFailTime = productsLoadFailTime;
    this.productsLoadDuration = productsLoadDuration;
    this.paywalljsVersion = paywalljsVersion;
    this.isFreeTrialAvailable = isFreeTrialAvailable;
    this.featureGatingBehavior = featureGatingBehavior;
    this.closeReason = closeReason;
    this.localNotifications = localNotifications;
    this.computedPropertyRequests = computedPropertyRequests;
    this.surveys = surveys;
  }
  static fromJson(json) {
    return new PaywallInfo({
      identifier: json.identifier,
      name: json.name,
      url: json.url,
      experiment: json.experiment ? Experiment.fromJson(json.experiment) : undefined,
      products: json.products.map(p => Product.fromJson(p)),
      productIds: json.productIds,
      presentedByEventWithName: json.presentedByEventWithName,
      presentedByEventWithId: json.presentedByEventWithId,
      presentedByEventAt: json.presentedByEventAt,
      presentedBy: json.presentedBy,
      presentationSourceType: json.presentationSourceType,
      responseLoadStartTime: json.responseLoadStartTime,
      responseLoadCompleteTime: json.responseLoadCompleteTime,
      responseLoadFailTime: json.responseLoadFailTime,
      responseLoadDuration: json.responseLoadDuration,
      webViewLoadStartTime: json.webViewLoadStartTime,
      webViewLoadCompleteTime: json.webViewLoadCompleteTime,
      webViewLoadFailTime: json.webViewLoadFailTime,
      webViewLoadDuration: json.webViewLoadDuration,
      productsLoadStartTime: json.productsLoadStartTime,
      productsLoadCompleteTime: json.productsLoadCompleteTime,
      productsLoadFailTime: json.productsLoadFailTime,
      productsLoadDuration: json.productsLoadDuration,
      paywalljsVersion: json.paywalljsVersion,
      isFreeTrialAvailable: json.isFreeTrialAvailable,
      featureGatingBehavior: featureGatingBehaviorFromJson(json.featureGatingBehavior),
      closeReason: PaywallCloseReason.fromJson(json.closeReason),
      localNotifications: json.localNotifications.map(n => LocalNotification.fromJson(n)),
      computedPropertyRequests: json.computedPropertyRequests.map(r => ComputedPropertyRequest.fromJson(r)),
      surveys: json.surveys.map(s => Survey.fromJson(s))
    });
  }
}
//# sourceMappingURL=PaywallInfo.js.map