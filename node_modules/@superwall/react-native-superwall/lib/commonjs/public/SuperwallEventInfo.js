"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SuperwallEventInfo = exports.SuperwallEvent = exports.EventType = void 0;
var _PaywallInfo = require("./PaywallInfo");
var _PaywallPresentationRequestStatus = require("./PaywallPresentationRequestStatus");
var _RestoreType = require("./RestoreType");
var _StoreProduct = require("./StoreProduct");
var _StoreTransaction = require("./StoreTransaction");
var _Survey = require("./Survey");
var _TriggerResult = require("./TriggerResult");
class SuperwallEventInfo {
  constructor(event, params) {
    this.event = event;
    this.params = params;
  }
  static fromJson(json) {
    return new SuperwallEventInfo(SuperwallEvent.fromJson(json.event), json.params);
  }
}
exports.SuperwallEventInfo = SuperwallEventInfo;
let EventType = exports.EventType = /*#__PURE__*/function (EventType) {
  EventType["firstSeen"] = "firstSeen";
  EventType["configRefresh"] = "configRefresh";
  EventType["appOpen"] = "appOpen";
  EventType["appLaunch"] = "appLaunch";
  EventType["identityAlias"] = "identityAlias";
  EventType["appInstall"] = "appInstall";
  EventType["sessionStart"] = "sessionStart";
  EventType["deviceAttributes"] = "deviceAttributes";
  EventType["subscriptionStatusDidChange"] = "subscriptionStatusDidChange";
  EventType["appClose"] = "appClose";
  EventType["deepLink"] = "deepLink";
  EventType["triggerFire"] = "triggerFire";
  EventType["paywallOpen"] = "paywallOpen";
  EventType["paywallClose"] = "paywallClose";
  EventType["paywallDecline"] = "paywallDecline";
  EventType["transactionStart"] = "transactionStart";
  EventType["transactionFail"] = "transactionFail";
  EventType["transactionAbandon"] = "transactionAbandon";
  EventType["transactionComplete"] = "transactionComplete";
  EventType["subscriptionStart"] = "subscriptionStart";
  EventType["freeTrialStart"] = "freeTrialStart";
  EventType["transactionRestore"] = "transactionRestore";
  EventType["transactionTimeout"] = "transactionTimeout";
  EventType["userAttributes"] = "userAttributes";
  EventType["nonRecurringProductPurchase"] = "nonRecurringProductPurchase";
  EventType["paywallResponseLoadStart"] = "paywallResponseLoadStart";
  EventType["paywallResponseLoadNotFound"] = "paywallResponseLoadNotFound";
  EventType["paywallResponseLoadFail"] = "paywallResponseLoadFail";
  EventType["paywallResponseLoadComplete"] = "paywallResponseLoadComplete";
  EventType["paywallWebviewLoadStart"] = "paywallWebviewLoadStart";
  EventType["paywallWebviewLoadFail"] = "paywallWebviewLoadFail";
  EventType["paywallWebviewLoadComplete"] = "paywallWebviewLoadComplete";
  EventType["paywallWebviewLoadTimeout"] = "paywallWebviewLoadTimeout";
  EventType["paywallWebviewLoadFallback"] = "paywallWebviewLoadFallback";
  EventType["paywallProductsLoadStart"] = "paywallProductsLoadStart";
  EventType["paywallProductsLoadFail"] = "paywallProductsLoadFail";
  EventType["paywallProductsLoadComplete"] = "paywallProductsLoadComplete";
  EventType["paywallProductsLoadRetry"] = "paywallProductsLoadRetry";
  EventType["surveyResponse"] = "surveyResponse";
  EventType["paywallPresentationRequest"] = "paywallPresentationRequest";
  EventType["touchesBegan"] = "touchesBegan";
  EventType["surveyClose"] = "surveyClose";
  EventType["reset"] = "reset";
  EventType["restoreStart"] = "restoreStart";
  EventType["restoreComplete"] = "restoreComplete";
  EventType["restoreFail"] = "restoreFail";
  EventType["configAttributes"] = "configAttributes";
  EventType["customPlacement"] = "customPlacement";
  EventType["errorThrown"] = "errorThrown";
  EventType["confirmAllAssignments"] = "confirmAllAssignments";
  EventType["configFail"] = "configFail";
  EventType["adServicesTokenRequestStart"] = "adServicesTokenRequestStart";
  EventType["adServicesTokenRequestFail"] = "adServicesTokenRequestFail";
  EventType["adServicesTokenRequestComplete"] = "adServicesTokenRequestComplete";
  EventType["shimmerViewStart"] = "shimmerViewStart";
  EventType["shimmerViewComplete"] = "shimmerViewComplete";
  EventType["redemptionStart"] = "redemptionStart";
  EventType["redemptionComplete"] = "redemptionComplete";
  EventType["redemptionFail"] = "redemptionFail";
  EventType["enrichmentStart"] = "enrichmentStart";
  EventType["enrichmentComplete"] = "enrichmentComplete";
  EventType["enrichmentFail"] = "enrichmentFail";
  EventType["networkDecodingFail"] = "networkDecodingFail";
  return EventType;
}({});
class SuperwallEvent {
  constructor(options) {
    Object.assign(this, options);
  }
  static fromJson(json) {
    let eventType = EventType[json.event];

    // Example for one case, replicate logic for other cases as needed
    switch (eventType) {
      case EventType.configRefresh:
      case EventType.firstSeen:
      case EventType.appOpen:
      case EventType.appLaunch:
      case EventType.identityAlias:
      case EventType.appInstall:
      case EventType.sessionStart:
      case EventType.appClose:
      case EventType.touchesBegan:
      case EventType.surveyClose:
      case EventType.reset:
      case EventType.restoreStart:
      case EventType.restoreComplete:
      case EventType.configAttributes:
      case EventType.configFail:
      case EventType.adServicesTokenRequestStart:
      case EventType.errorThrown:
      case EventType.confirmAllAssignments:
      case EventType.shimmerViewStart:
      case EventType.shimmerViewComplete:
      case EventType.subscriptionStatusDidChange:
      case EventType.enrichmentFail:
      case EventType.networkDecodingFail:
        return new SuperwallEvent({
          type: eventType
        });
      case EventType.restoreFail:
        return new SuperwallEvent({
          type: eventType,
          message: json.message
        });
      case EventType.deviceAttributes:
        return new SuperwallEvent({
          type: eventType,
          deviceAttributes: json.attributes
        });
      case EventType.deepLink:
        return new SuperwallEvent({
          type: eventType,
          deepLinkUrl: json.url
        });
      case EventType.triggerFire:
        return new SuperwallEvent({
          type: eventType,
          placementName: eventType,
          result: _TriggerResult.TriggerResult.fromJson(json.result)
        });
      case EventType.paywallOpen:
      case EventType.paywallClose:
      case EventType.paywallDecline:
      case EventType.transactionRestore:
      case EventType.paywallWebviewLoadStart:
      case EventType.paywallWebviewLoadFail:
      case EventType.paywallWebviewLoadComplete:
      case EventType.paywallWebviewLoadTimeout:
      case EventType.paywallWebviewLoadFallback:
        return new SuperwallEvent({
          type: eventType,
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.transactionStart:
      case EventType.transactionAbandon:
      case EventType.subscriptionStart:
      case EventType.freeTrialStart:
      case EventType.nonRecurringProductPurchase:
        return new SuperwallEvent({
          type: eventType,
          product: _StoreProduct.StoreProduct.fromJson(json.product),
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.transactionFail:
        return new SuperwallEvent({
          type: eventType,
          error: json.error,
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.transactionComplete:
        return new SuperwallEvent({
          type: eventType,
          transaction: json.transaction ? _StoreTransaction.StoreTransaction.fromJson(json.transaction) : undefined,
          product: _StoreProduct.StoreProduct.fromJson(json.product),
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.transactionRestore:
        return new SuperwallEvent({
          type: eventType,
          restoreType: _RestoreType.RestoreType.fromJson(json.restoreType),
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.userAttributes:
        return new SuperwallEvent({
          type: eventType,
          userAttributes: json.attributes
        });
      case EventType.paywallResponseLoadStart:
      case EventType.paywallResponseLoadNotFound:
      case EventType.paywallResponseLoadFail:
        return new SuperwallEvent({
          type: eventType,
          triggeredEventName: json.triggeredEventName
        });
      case EventType.paywallResponseLoadComplete:
      case EventType.paywallProductsLoadStart:
      case EventType.paywallProductsLoadFail:
      case EventType.paywallProductsLoadComplete:
        return new SuperwallEvent({
          type: eventType,
          triggeredEventName: json.triggeredEventName
        });
      case EventType.paywallProductsLoadRetry:
        return new SuperwallEvent({
          type: eventType,
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo),
          triggeredEventName: json.triggeredEventName,
          attempt: json.attempt
        });
      case EventType.surveyResponse:
        return new SuperwallEvent({
          type: eventType,
          survey: _Survey.Survey.fromJson(json.survey),
          selectedOption: _Survey.SurveyOption.fromJson(json.selectedOption),
          customResponse: json.customResponse,
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.paywallPresentationRequest:
        return new SuperwallEvent({
          type: eventType,
          status: _PaywallPresentationRequestStatus.PaywallPresentationRequestStatus.fromJson(json.status),
          reason: json.reason ? _PaywallPresentationRequestStatus.PaywallPresentationRequestStatusReason.fromJson(json.reason) : undefined
        });
      case EventType.customPlacement:
        return new SuperwallEvent({
          type: eventType,
          name: json.name,
          params: json.params,
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.adServicesTokenRequestFail:
        return new SuperwallEvent({
          type: eventType,
          error: json.error
        });
      case EventType.adServicesTokenRequestComplete:
        return new SuperwallEvent({
          type: eventType,
          token: json.token
        });
      case EventType.transactionTimeout:
        return new SuperwallEvent({
          type: eventType,
          paywallInfo: _PaywallInfo.PaywallInfo.fromJson(json.paywallInfo)
        });
      case EventType.shimmerViewComplete:
        return new SuperwallEvent({
          type: eventType
        });
      case EventType.redemptionStart:
        return new SuperwallEvent({
          type: eventType
        });
      case EventType.redemptionComplete:
        return new SuperwallEvent({
          type: eventType
        });
      case EventType.redemptionFail:
        return new SuperwallEvent({
          type: eventType
        });
      case EventType.enrichmentStart:
        return new SuperwallEvent({
          type: eventType
        });
      case EventType.enrichmentComplete:
        return new SuperwallEvent({
          type: eventType,
          userAttributes: json.userEnrichment,
          deviceAttributes: json.deviceEnrichment
        });
      // Further cases would follow a similar pattern, handling additional properties as needed
      // For complex nested objects like 'result', 'paywallInfo', etc., you would use the corresponding fromJson methods
      default:
        throw new Error('Invalid event type');
    }
  }
}
exports.SuperwallEvent = SuperwallEvent;
//# sourceMappingURL=SuperwallEventInfo.js.map