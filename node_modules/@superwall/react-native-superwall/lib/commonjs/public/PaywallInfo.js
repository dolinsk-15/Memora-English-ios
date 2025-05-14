"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaywallInfo = void 0;
var _ComputedPropertyRequest = require("./ComputedPropertyRequest");
var _Experiment = require("./Experiment");
var _FeatureGatingBehavior = require("./FeatureGatingBehavior");
var _LocalNotification = require("./LocalNotification");
var _PaywallCloseReason = require("./PaywallCloseReason");
var _Product = require("./Product");
var _Survey = require("./Survey");
class PaywallInfo {
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
      experiment: json.experiment ? _Experiment.Experiment.fromJson(json.experiment) : undefined,
      products: json.products.map(p => _Product.Product.fromJson(p)),
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
      featureGatingBehavior: (0, _FeatureGatingBehavior.featureGatingBehaviorFromJson)(json.featureGatingBehavior),
      closeReason: _PaywallCloseReason.PaywallCloseReason.fromJson(json.closeReason),
      localNotifications: json.localNotifications.map(n => _LocalNotification.LocalNotification.fromJson(n)),
      computedPropertyRequests: json.computedPropertyRequests.map(r => _ComputedPropertyRequest.ComputedPropertyRequest.fromJson(r)),
      surveys: json.surveys.map(s => _Survey.Survey.fromJson(s))
    });
  }
}
exports.PaywallInfo = PaywallInfo;
//# sourceMappingURL=PaywallInfo.js.map