import { PaywallInfo } from "./PaywallInfo";
import { PaywallPresentationRequestStatus, PaywallPresentationRequestStatusReason } from './PaywallPresentationRequestStatus';
import { RestoreType } from "./RestoreType";
import { StoreProduct } from "./StoreProduct";
import { StoreTransaction } from "./StoreTransaction";
import { Survey, SurveyOption } from "./Survey";
import { TriggerResult } from "./TriggerResult";
export declare class SuperwallEventInfo {
    event: SuperwallEvent;
    params?: Record<string, any>;
    constructor(event: SuperwallEvent, params?: Record<string, any>);
    static fromJson(json: any): SuperwallEventInfo;
}
export declare enum EventType {
    firstSeen = "firstSeen",
    configRefresh = "configRefresh",
    appOpen = "appOpen",
    appLaunch = "appLaunch",
    identityAlias = "identityAlias",
    appInstall = "appInstall",
    sessionStart = "sessionStart",
    deviceAttributes = "deviceAttributes",
    subscriptionStatusDidChange = "subscriptionStatusDidChange",
    appClose = "appClose",
    deepLink = "deepLink",
    triggerFire = "triggerFire",
    paywallOpen = "paywallOpen",
    paywallClose = "paywallClose",
    paywallDecline = "paywallDecline",
    transactionStart = "transactionStart",
    transactionFail = "transactionFail",
    transactionAbandon = "transactionAbandon",
    transactionComplete = "transactionComplete",
    subscriptionStart = "subscriptionStart",
    freeTrialStart = "freeTrialStart",
    transactionRestore = "transactionRestore",
    transactionTimeout = "transactionTimeout",
    userAttributes = "userAttributes",
    nonRecurringProductPurchase = "nonRecurringProductPurchase",
    paywallResponseLoadStart = "paywallResponseLoadStart",
    paywallResponseLoadNotFound = "paywallResponseLoadNotFound",
    paywallResponseLoadFail = "paywallResponseLoadFail",
    paywallResponseLoadComplete = "paywallResponseLoadComplete",
    paywallWebviewLoadStart = "paywallWebviewLoadStart",
    paywallWebviewLoadFail = "paywallWebviewLoadFail",
    paywallWebviewLoadComplete = "paywallWebviewLoadComplete",
    paywallWebviewLoadTimeout = "paywallWebviewLoadTimeout",
    paywallWebviewLoadFallback = "paywallWebviewLoadFallback",
    paywallProductsLoadStart = "paywallProductsLoadStart",
    paywallProductsLoadFail = "paywallProductsLoadFail",
    paywallProductsLoadComplete = "paywallProductsLoadComplete",
    paywallProductsLoadRetry = "paywallProductsLoadRetry",
    surveyResponse = "surveyResponse",
    paywallPresentationRequest = "paywallPresentationRequest",
    touchesBegan = "touchesBegan",
    surveyClose = "surveyClose",
    reset = "reset",
    restoreStart = "restoreStart",
    restoreComplete = "restoreComplete",
    restoreFail = "restoreFail",
    configAttributes = "configAttributes",
    customPlacement = "customPlacement",
    errorThrown = "errorThrown",
    confirmAllAssignments = "confirmAllAssignments",
    configFail = "configFail",
    adServicesTokenRequestStart = "adServicesTokenRequestStart",
    adServicesTokenRequestFail = "adServicesTokenRequestFail",
    adServicesTokenRequestComplete = "adServicesTokenRequestComplete",
    shimmerViewStart = "shimmerViewStart",
    shimmerViewComplete = "shimmerViewComplete",
    redemptionStart = "redemptionStart",
    redemptionComplete = "redemptionComplete",
    redemptionFail = "redemptionFail",
    enrichmentStart = "enrichmentStart",
    enrichmentComplete = "enrichmentComplete",
    enrichmentFail = "enrichmentFail",
    networkDecodingFail = "networkDecodingFail"
}
export declare class SuperwallEvent {
    type: EventType | undefined;
    placementName?: string;
    deviceAttributes?: Record<string, any>;
    deepLinkUrl?: string;
    result?: TriggerResult;
    paywallInfo?: PaywallInfo;
    transaction?: StoreTransaction;
    product?: StoreProduct;
    error?: string;
    message?: string;
    triggeredEventName?: string;
    survey?: Survey;
    selectedOption?: SurveyOption;
    customResponse?: string;
    status?: PaywallPresentationRequestStatus;
    reason?: PaywallPresentationRequestStatusReason;
    restoreType?: RestoreType;
    userAttributes?: Record<string, any>;
    private constructor();
    static fromJson(json: any): SuperwallEvent;
}
export type SuperwallPlacementInfo = SuperwallEventInfo;
export type SuperwallPlacement = SuperwallEvent;
//# sourceMappingURL=SuperwallEventInfo.d.ts.map