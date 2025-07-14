"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ComputedPropertyRequest", {
  enumerable: true,
  get: function () {
    return _ComputedPropertyRequest.ComputedPropertyRequest;
  }
});
Object.defineProperty(exports, "ConfigurationStatus", {
  enumerable: true,
  get: function () {
    return _ConfigurationStatus.ConfigurationStatus;
  }
});
Object.defineProperty(exports, "EventType", {
  enumerable: true,
  get: function () {
    return _SuperwallEventInfo.EventType;
  }
});
Object.defineProperty(exports, "Experiment", {
  enumerable: true,
  get: function () {
    return _Experiment.Experiment;
  }
});
Object.defineProperty(exports, "FeatureGatingBehavior", {
  enumerable: true,
  get: function () {
    return _FeatureGatingBehavior.FeatureGatingBehavior;
  }
});
Object.defineProperty(exports, "IdentityOptions", {
  enumerable: true,
  get: function () {
    return _IdentityOptions.IdentityOptions;
  }
});
Object.defineProperty(exports, "InterfaceStyle", {
  enumerable: true,
  get: function () {
    return _InterfaceStyle.InterfaceStyle;
  }
});
Object.defineProperty(exports, "LocalNotification", {
  enumerable: true,
  get: function () {
    return _LocalNotification.LocalNotification;
  }
});
Object.defineProperty(exports, "LogLevel", {
  enumerable: true,
  get: function () {
    return _LogLevel.LogLevel;
  }
});
Object.defineProperty(exports, "LogScope", {
  enumerable: true,
  get: function () {
    return _LogScope.LogScope;
  }
});
Object.defineProperty(exports, "PaywallCloseReason", {
  enumerable: true,
  get: function () {
    return _PaywallCloseReason.PaywallCloseReason;
  }
});
Object.defineProperty(exports, "PaywallInfo", {
  enumerable: true,
  get: function () {
    return _PaywallInfo.PaywallInfo;
  }
});
Object.defineProperty(exports, "PaywallOptions", {
  enumerable: true,
  get: function () {
    return _PaywallOptions.PaywallOptions;
  }
});
Object.defineProperty(exports, "PaywallPresentationHandler", {
  enumerable: true,
  get: function () {
    return _PaywallPresentationHandler.PaywallPresentationHandler;
  }
});
Object.defineProperty(exports, "PaywallPresentationRequestStatus", {
  enumerable: true,
  get: function () {
    return _PaywallPresentationRequestStatus.PaywallPresentationRequestStatus;
  }
});
Object.defineProperty(exports, "PaywallSkippedReason", {
  enumerable: true,
  get: function () {
    return _PaywallSkippedReason.PaywallSkippedReason;
  }
});
Object.defineProperty(exports, "PaywallSkippedReasonHoldout", {
  enumerable: true,
  get: function () {
    return _PaywallSkippedReason.PaywallSkippedReasonHoldout;
  }
});
Object.defineProperty(exports, "PaywallSkippedReasonNoAudienceMatch", {
  enumerable: true,
  get: function () {
    return _PaywallSkippedReason.PaywallSkippedReasonNoAudienceMatch;
  }
});
Object.defineProperty(exports, "PaywallSkippedReasonPlacementNotFound", {
  enumerable: true,
  get: function () {
    return _PaywallSkippedReason.PaywallSkippedReasonPlacementNotFound;
  }
});
Object.defineProperty(exports, "PaywallSkippedReasonUserIsSubscribed", {
  enumerable: true,
  get: function () {
    return _PaywallSkippedReason.PaywallSkippedReasonUserIsSubscribed;
  }
});
Object.defineProperty(exports, "Product", {
  enumerable: true,
  get: function () {
    return _Product.Product;
  }
});
Object.defineProperty(exports, "PurchaseController", {
  enumerable: true,
  get: function () {
    return _PurchaseController.PurchaseController;
  }
});
Object.defineProperty(exports, "PurchaseResult", {
  enumerable: true,
  get: function () {
    return _PurchaseResult.PurchaseResult;
  }
});
Object.defineProperty(exports, "PurchaseResultCancelled", {
  enumerable: true,
  get: function () {
    return _PurchaseResult.PurchaseResultCancelled;
  }
});
Object.defineProperty(exports, "PurchaseResultFailed", {
  enumerable: true,
  get: function () {
    return _PurchaseResult.PurchaseResultFailed;
  }
});
Object.defineProperty(exports, "PurchaseResultPending", {
  enumerable: true,
  get: function () {
    return _PurchaseResult.PurchaseResultPending;
  }
});
Object.defineProperty(exports, "PurchaseResultPurchased", {
  enumerable: true,
  get: function () {
    return _PurchaseResult.PurchaseResultPurchased;
  }
});
Object.defineProperty(exports, "PurchaseResultRestored", {
  enumerable: true,
  get: function () {
    return _PurchaseResult.PurchaseResultRestored;
  }
});
Object.defineProperty(exports, "RestorationResult", {
  enumerable: true,
  get: function () {
    return _RestorationResult.RestorationResult;
  }
});
Object.defineProperty(exports, "RestoreType", {
  enumerable: true,
  get: function () {
    return _RestoreType.RestoreType;
  }
});
Object.defineProperty(exports, "SubscriptionStatus", {
  enumerable: true,
  get: function () {
    return _SubscriptionStatus.SubscriptionStatus;
  }
});
Object.defineProperty(exports, "SuperwallDelegate", {
  enumerable: true,
  get: function () {
    return _SuperwallDelegate.SuperwallDelegate;
  }
});
Object.defineProperty(exports, "SuperwallEventInfo", {
  enumerable: true,
  get: function () {
    return _SuperwallEventInfo.SuperwallEventInfo;
  }
});
Object.defineProperty(exports, "SuperwallOptions", {
  enumerable: true,
  get: function () {
    return _SuperwallOptions.SuperwallOptions;
  }
});
Object.defineProperty(exports, "Survey", {
  enumerable: true,
  get: function () {
    return _Survey.Survey;
  }
});
Object.defineProperty(exports, "TransactionBackgroundView", {
  enumerable: true,
  get: function () {
    return _PaywallOptions.TransactionBackgroundView;
  }
});
Object.defineProperty(exports, "TriggerResult", {
  enumerable: true,
  get: function () {
    return _TriggerResult.TriggerResult;
  }
});
exports.default = void 0;
var _reactNative = require("react-native");
var _PaywallInfo = require("./public/PaywallInfo");
var _PaywallSkippedReason = require("./public/PaywallSkippedReason");
var _SubscriptionStatus = require("./public/SubscriptionStatus");
var _SuperwallEventInfo = require("./public/SuperwallEventInfo");
var _events = require("events");
var _ConfigurationStatus = require("./public/ConfigurationStatus");
var _Assigments = require("./public/Assigments");
var _PaywallResult = require("./public/PaywallResult");
var _EntitlementsInfo = require("./public/EntitlementsInfo");
var _RedemptionResults = require("./public/RedemptionResults");
var _ComputedPropertyRequest = require("./public/ComputedPropertyRequest");
var _Experiment = require("./public/Experiment");
var _FeatureGatingBehavior = require("./public/FeatureGatingBehavior");
var _IdentityOptions = require("./public/IdentityOptions");
var _LocalNotification = require("./public/LocalNotification");
var _LogLevel = require("./public/LogLevel");
var _LogScope = require("./public/LogScope");
var _PaywallCloseReason = require("./public/PaywallCloseReason");
var _Product = require("./public/Product");
var _PurchaseController = require("./public/PurchaseController");
var _PurchaseResult = require("./public/PurchaseResult");
var _RestorationResult = require("./public/RestorationResult");
var _InterfaceStyle = require("./public/InterfaceStyle");
var _SuperwallDelegate = require("./public/SuperwallDelegate");
var _SuperwallOptions = require("./public/SuperwallOptions");
var _Survey = require("./public/Survey");
var _TriggerResult = require("./public/TriggerResult");
var _PaywallOptions = require("./public/PaywallOptions");
var _PaywallPresentationHandler = require("./public/PaywallPresentationHandler");
var _PaywallPresentationRequestStatus = require("./public/PaywallPresentationRequestStatus");
var _RestoreType = require("./public/RestoreType");
const {
  version
} = require('../package.json');
const LINKING_ERROR = `The package 'superwall-react-native' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const SuperwallReactNative = _reactNative.NativeModules.SuperwallReactNative ? _reactNative.NativeModules.SuperwallReactNative : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});

//export { Superwall } from './Superwall';

class Superwall {
  static _superwall = new Superwall();
  eventEmitter = new _reactNative.NativeEventEmitter(SuperwallReactNative);
  static configEmitter = new _events.EventEmitter();
  static didConfigure = false;
  presentationHandlers = new Map();
  subscriptionStatusEmitter = new _events.EventEmitter();
  static setDidConfigure(didConfigure) {
    this.didConfigure = didConfigure;
    // Emit an event when the bridged state is true
    if (didConfigure) {
      this.configEmitter.emit('configured', didConfigure);
    }
  }
  async awaitConfig() {
    if (Superwall.didConfigure) {
      return;
    }
    await new Promise(resolve => {
      Superwall.configEmitter.once('configured', () => {
        resolve();
      });
    });
  }
  constructor() {
    this.eventEmitter.addListener('purchaseFromAppStore', async data => {
      var _Superwall$purchaseCo;
      var purchaseResult = await ((_Superwall$purchaseCo = Superwall.purchaseController) === null || _Superwall$purchaseCo === void 0 ? void 0 : _Superwall$purchaseCo.purchaseFromAppStore(data.productId));
      if (purchaseResult == null) {
        return;
      }
      await SuperwallReactNative.didPurchase(purchaseResult.toJSON());
    });
    this.eventEmitter.addListener('purchaseFromGooglePlay', async productData => {
      var _Superwall$purchaseCo2;
      var purchaseResult = await ((_Superwall$purchaseCo2 = Superwall.purchaseController) === null || _Superwall$purchaseCo2 === void 0 ? void 0 : _Superwall$purchaseCo2.purchaseFromGooglePlay(productData.productId, productData.basePlanId, productData.offerId));
      if (purchaseResult == null) {
        return;
      }
      await SuperwallReactNative.didPurchase(purchaseResult.toJSON());
    });
    this.eventEmitter.addListener('restore', async () => {
      var _Superwall$purchaseCo3;
      var restorationResult = await ((_Superwall$purchaseCo3 = Superwall.purchaseController) === null || _Superwall$purchaseCo3 === void 0 ? void 0 : _Superwall$purchaseCo3.restorePurchases());
      if (restorationResult == null) {
        return;
      }
      await SuperwallReactNative.didRestore(restorationResult.toJson());
    });
    this.eventEmitter.addListener('paywallPresentationHandler', data => {
      var handler = this.presentationHandlers.get(data.handlerId);
      if (!handler) {
        return;
      }
      switch (data.method) {
        case 'onPresent':
          if (handler.onPresentHandler) {
            const paywallInfo = _PaywallInfo.PaywallInfo.fromJson(data.paywallInfoJson);
            handler.onPresentHandler(paywallInfo);
          }
          break;
        case 'onDismiss':
          if (handler.onDismissHandler) {
            const paywallInfo = _PaywallInfo.PaywallInfo.fromJson(data.paywallInfoJson);
            const result = (0, _PaywallResult.fromJson)(data.result);
            handler.onDismissHandler(paywallInfo, result);
          }
          break;
        case 'onError':
          if (handler.onErrorHandler) {
            handler.onErrorHandler(data.errorString);
          }
          break;
        case 'onSkip':
          if (handler.onSkipHandler) {
            const skippedReason = _PaywallSkippedReason.PaywallSkippedReason.fromJson(data.skippedReason);
            handler.onSkipHandler(skippedReason);
          }
          break;
      }
    });

    // MARK: - SuperwallDelegate Listeners
    this.eventEmitter.addListener('subscriptionStatusDidChange', async data => {
      var _Superwall$delegate;
      const from = _SubscriptionStatus.SubscriptionStatus.fromString(data.from, data.entitlements);
      const to = _SubscriptionStatus.SubscriptionStatus.fromString(data.to, data.entitlements);
      (_Superwall$delegate = Superwall.delegate) === null || _Superwall$delegate === void 0 || _Superwall$delegate.subscriptionStatusDidChange(from, to);
    });
    this.eventEmitter.addListener('handleSuperwallEvent', async data => {
      var _Superwall$delegate2;
      const eventInfo = _SuperwallEventInfo.SuperwallEventInfo.fromJson(data.eventInfo);
      (_Superwall$delegate2 = Superwall.delegate) === null || _Superwall$delegate2 === void 0 || _Superwall$delegate2.handleSuperwallEvent(eventInfo);
    });
    this.eventEmitter.addListener('handleCustomPaywallAction', async data => {
      var _Superwall$delegate3;
      const name = data.name;
      (_Superwall$delegate3 = Superwall.delegate) === null || _Superwall$delegate3 === void 0 || _Superwall$delegate3.handleCustomPaywallAction(name);
    });
    this.eventEmitter.addListener('willDismissPaywall', async data => {
      var _Superwall$delegate4;
      const info = _PaywallInfo.PaywallInfo.fromJson(data.info);
      (_Superwall$delegate4 = Superwall.delegate) === null || _Superwall$delegate4 === void 0 || _Superwall$delegate4.willDismissPaywall(info);
    });
    this.eventEmitter.addListener('willPresentPaywall', async data => {
      var _Superwall$delegate5;
      const info = _PaywallInfo.PaywallInfo.fromJson(data.info);
      (_Superwall$delegate5 = Superwall.delegate) === null || _Superwall$delegate5 === void 0 || _Superwall$delegate5.willPresentPaywall(info);
    });
    this.eventEmitter.addListener('didDismissPaywall', async data => {
      var _Superwall$delegate6;
      const info = _PaywallInfo.PaywallInfo.fromJson(data.info);
      (_Superwall$delegate6 = Superwall.delegate) === null || _Superwall$delegate6 === void 0 || _Superwall$delegate6.didDismissPaywall(info);
    });
    this.eventEmitter.addListener('didPresentPaywall', async data => {
      var _Superwall$delegate7;
      const info = _PaywallInfo.PaywallInfo.fromJson(data.info);
      (_Superwall$delegate7 = Superwall.delegate) === null || _Superwall$delegate7 === void 0 || _Superwall$delegate7.didPresentPaywall(info);
    });
    this.eventEmitter.addListener('handleLog', async data => {
      var _Superwall$delegate8;
      (_Superwall$delegate8 = Superwall.delegate) === null || _Superwall$delegate8 === void 0 || _Superwall$delegate8.handleLog(data.level, data.scope, data.message, data.info, data.error);
    });
    this.eventEmitter.addListener('paywallWillOpenDeepLink', async data => {
      var _Superwall$delegate9;
      const url = new URL(data.url);
      (_Superwall$delegate9 = Superwall.delegate) === null || _Superwall$delegate9 === void 0 || _Superwall$delegate9.paywallWillOpenDeepLink(url);
    });
    this.eventEmitter.addListener('paywallWillOpenURL', async data => {
      var _Superwall$delegate0;
      const url = new URL(data.url);
      (_Superwall$delegate0 = Superwall.delegate) === null || _Superwall$delegate0 === void 0 || _Superwall$delegate0.paywallWillOpenURL(url);
    });
    this.eventEmitter.addListener('willRedeemLink', async () => {
      var _Superwall$delegate1;
      (_Superwall$delegate1 = Superwall.delegate) === null || _Superwall$delegate1 === void 0 || _Superwall$delegate1.willRedeemLink();
    });
    this.eventEmitter.addListener('didRedeemLink', async data => {
      var _Superwall$delegate10;
      const result = _RedemptionResults.RedemptionResults.fromJson(data);
      (_Superwall$delegate10 = Superwall.delegate) === null || _Superwall$delegate10 === void 0 || _Superwall$delegate10.didRedeemLink(result);
    });
  }
  async observeSubscriptionStatus() {
    await SuperwallReactNative.observeSubscriptionStatus();
    this.eventEmitter.addListener('observeSubscriptionStatus', async data => {
      const status = _SubscriptionStatus.SubscriptionStatus.fromJson(data);
      this.subscriptionStatusEmitter.emit('change', status);
    });
  }
  /**
   * Returns the configured shared instance of `Superwall`.
   *
   * **Warning:** You must call {@link Superwall.configure} to initialize `Superwall`
   * before accessing this shared instance.
   *
   * @returns {Superwall} The shared `Superwall` instance.
   */
  static get shared() {
    return this._superwall;
  }

  /**
   * Configures a shared instance of `Superwall` for use throughout your app.
   *
   * Call this as soon as your app starts to initialize the Superwall SDK.
   * Check out [Configuring the SDK](https://docs.superwall.com/docs/configuring-the-sdk) for information about how to configure the SDK.
   *
   * @param {object} config - Configuration object.
   * @param {string} config.apiKey - Your Public API Key that you can get from the Superwall dashboard settings.
   *   If you don't have an account, you can [sign up for free](https://superwall.com/sign-up).
   * @param {SuperwallOptions} [config.options] - An optional object which allows you to customize the appearance and behavior
   *   of the paywall.
   * @param {PurchaseController} [config.purchaseController] - An optional object that conforms to `PurchaseController`.
   *   Implement this if you'd like to handle all subscription-related logic yourself. You'll need to also set the `subscriptionStatus`
   *   every time the user's entitlements change. You can read more about that in [Purchases and Subscription Status](https://docs.superwall.com/docs/advanced-configuration).
   *   If omitted, Superwall will handle all subscription-related logic itself.
   * @param {() => void} [config.completion] - An optional completion handler that lets you know when Superwall has finished configuring.
   *
   * @returns {Promise<Superwall>} The configured `Superwall` instance.
   */
  static async configure({
    apiKey,
    options,
    purchaseController,
    completion
  }) {
    this.purchaseController = purchaseController;
    Superwall.purchaseController = purchaseController;
    await SuperwallReactNative.configure(apiKey, options === null || options === void 0 ? void 0 : options.toJson(), !!purchaseController, version).then(() => {
      if (completion) completion();
      Superwall.shared.observeSubscriptionStatus();
    });
    this.setDidConfigure(true);
    return this._superwall;
  }

  /**
   * Creates an account with Superwall by linking the provided `userId` to Superwall's automatically generated alias.
   *
   * Call this function as soon as you have a valid `userId`.
   *
   * @param {Object} config - The identification configuration object.
   * @param {string} config.userId - Your user's unique identifier as defined by your backend system.
   * @param {IdentityOptions} [config.options] - An optional {@link IdentityOptions} object. You can set the
   *   {@link IdentityOptions.restorePaywallAssignments} property to `true` to instruct the SDK to wait to restore paywall assignments
   *   from the server before presenting any paywalls. This option should be used only in advanced cases
   *   (e.g., when users frequently switch accounts or reinstall the app).
   *
   * @returns {Promise<void>} A promise that resolves once the identification process is complete.
   */
  async identify({
    userId,
    options
  }) {
    await this.awaitConfig();
    const serializedOptions = options ? options.toJson() : null;
    await SuperwallReactNative.identify(userId, serializedOptions);
  }

  /**
   * Resets the `userId`, on-device paywall assignments, and data stored by Superwall.
   *
   * @returns {Promise<void>} A promise that resolves once reset is complete.
   */
  async reset() {
    await this.awaitConfig();
    await SuperwallReactNative.reset();
  }

  /**
   * Handles a deep link.
   *
   * @param {string} url - The deep link to handle.
   * @returns {Promise<Boolean>} A promise that resolves to a boolean indicating whether the deep link was handled.
   */
  async handleDeepLink(url) {
    await this.awaitConfig();
    return await SuperwallReactNative.handleDeepLink(url);
  }

  /**
   * Registers a placement to access a feature.
   *
   * When the placement is added to a campaign on the [Superwall Dashboard](https://superwall.com/dashboard),
   * it can trigger a paywall if the following conditions are met:
   * - The provided placement is included in a campaign on the Superwall Dashboard.
   * - The user matches an audience filter defined in the campaign.
   * - The user does not have an active subscription.
   *
   * Before using this method, ensure you have created a campaign and added the placement on the
   * [Superwall Dashboard](https://superwall.com/dashboard).
   *
   * The displayed paywall is determined by the audience filters set in the campaign.
   * Once a user is assigned a paywall within an audience, that paywall will continue to be shown unless
   * you remove it from the audience or reset the paywall assignments.
   *
   * @param {string} [params.placement] - The name of the placement to register.
   * @param {Map<string, any> | Record<string, any>} [params.params] - Optional parameters to pass with your placement.
   *   These parameters can be referenced within the audience filters of your campaign. Keys beginning with `$`
   *   are reserved for Superwall and will be omitted. Values can be any JSON-encodable value, URL, or Date.
   *   Arrays and dictionaries are not supported and will be dropped.
   * @param {PaywallPresentationHandler} [params.handler] - An optional handler that receives status updates
   *   about the paywall presentation.
   * @param {() => void} [params.feature] - An optional callback that will be executed after registration completes.
   *   If provided, this callback will be executed after the registration process completes successfully.
   *   If not provided, you can chain a `.then()` block to the returned promise to execute your feature logic.
   *
   * @returns {Promise<void>} if [feature] is provided this promise resolves when register is executed, otherwise a promise that resolves when register completes successfully after which you can chain a `.then()` block to execute your feature logic.
   *
   * @remarks
   * This behavior is remotely configurable via the [Superwall Dashboard](https://superwall.com/dashboard):
   *
   * - For _Non Gated_ paywalls, the feature block is executed when the paywall is dismissed or if the user is already paying.
   * - For _Gated_ paywalls, the feature block is executed only if the user is already paying or if they begin paying.
   * - If no paywall is configured, the feature block is executed immediately.
   * - If no feature block is provided, the returned promise will resolve when registration completes.
   * - If a feature block is provided, the returned promise will always resolve after the feature block is executed.
   * Note: The feature block will not be executed if an error occurs during registration. Such errors can be detected via the
   * `handler`.
   *
   * @example
   * // Using the feature callback:
   * Superwall.register({
   *   placement: "somePlacement",
   *   feature: () => {
   *     console.log("Feature logic executed after registration");
   *   }
   * });
   *
   * // Alternatively, chaining feature logic after registration:
   * Superwall.register({ placement: "somePlacement" })
   *   .then(() => {
   *     // Execute your feature logic here after registration.
   *     console.log("Placement registered, now executing feature logic.");
   *   })
   */
  async register(params) {
    await this.awaitConfig();
    let handlerId = null;
    if (params.handler) {
      const uuid = (+new Date() * Math.random()).toString(36);
      this.presentationHandlers.set(uuid, params.handler);
      handlerId = uuid;
    }
    let paramsObject = {};
    if (params.params) {
      paramsObject = params.params instanceof Map ? Object.fromEntries(params.params) : params.params;
    }
    if (params.feature) {
      return await SuperwallReactNative.register(params.placement, paramsObject, handlerId).then(() => {
        params.feature();
      });
    } else {
      return SuperwallReactNative.register(params.placement, paramsObject, handlerId);
    }
  }

  /**
   * Confirms all experiment assignments and returns them in an array.
   *
   * Note that the assignments may differ when a placement is registered due to changes
   * in user, placement, or device parameters used in audience filters.
   *
   * @returns {Promise<Assignment[]>} A promise that resolves to an array of {@link Assignment} objects.
   */
  async confirmAllAssignments() {
    await this.awaitConfig();
    const assignments = await SuperwallReactNative.confirmAllAssignments();
    return assignments.map(assignment => _Assigments.Assignment.fromJson(assignment));
  }

  /**
   * Gets all the experiment assignments and returns them in an array.
   *
   * This method tracks the {@link SuperwallEvent.getAssignments} event in the delegate.
   *
   * Note that the assignments may differ when a placement is registered due to changes
   * in user, placement, or device parameters used in audience filters.
   *
   * @returns {Promise<Assignment[]>} A promise that resolves to an array of {@link Assignment} objects.
   */
  async getAssignments() {
    await this.awaitConfig();
    const assignments = await SuperwallReactNative.getAssignments();
    return assignments.map(assignment => _Assigments.Assignment.fromJson(assignment));
  }

  /**
   * Preemptively gets the result of registering a placement.
   *
   * This helps you determine whether a particular placement will present a paywall in the future.
   * Note that this method does not present a paywall. To present a paywall, use the `register` function.
   *
   * @param {Object} options - Options for obtaining the presentation result.
   * @param {string} options.placement - The name of the placement you want to register.
   * @param {Map<string, any>} [options.params] - Optional parameters to pass with your placement.
   *
   * @returns {Promise<PresentationResult>} A promise that resolves to a {@link PresentationResult} indicating the result of registering the placement.
   */
  async getPresentationResult({
    placement,
    params
  }) {
    await this.awaitConfig();
    let paramsObject = {};
    if (params) {
      paramsObject = Object.fromEntries(params);
    }
    return await SuperwallReactNative.getPresentationResult(placement, paramsObject);
  }

  /**
   * Retrieves the current configuration status of the Superwall SDK.
   *
   * This function returns a promise that resolves to the current configuration status,
   * indicating whether the SDK has finished configuring. Initially, the status is
   * {@link ConfigurationStatus.PENDING}. Once the configuration completes successfully, it
   * changes to {@link ConfigurationStatus.CONFIGURED}. If the configuration fails, the status
   * will be {@link ConfigurationStatus.FAILED}.
   *
   * @returns {Promise<ConfigurationStatus>} A promise that resolves with the current configuration status.
   */
  async getConfigurationStatus() {
    const configurationStatusString = await SuperwallReactNative.getConfigurationStatus();
    return _ConfigurationStatus.ConfigurationStatus.fromString(configurationStatusString);
  }

  /**
   * Retrieves the entitlements tied to the device.
   *
   * @returns {Promise<EntitlementsInfo>} A promise that resolves to an {@link EntitlementsInfo} object.
   */
  async getEntitlements() {
    await this.awaitConfig();
    const entitlementsJson = await SuperwallReactNative.getEntitlements();
    return _EntitlementsInfo.EntitlementsInfo.fromObject(entitlementsJson);
  }

  /**
   * Sets the subscription status of the user.
   *
   * When using a PurchaseController, you must call this method to update the user's subscription status.
   * Alternatively, you can implement the {@link SuperwallDelegate.subscriptionStatusDidChange} delegate callback to receive notifications
   * whenever the subscription status changes.
   *
   * @param {SubscriptionStatus} status - The new subscription status.
   *
   * @returns {Promise<void>} A promise that resolves once the subscription status has been updated.
   */
  async setSubscriptionStatus(status) {
    await this.awaitConfig();
    await SuperwallReactNative.setSubscriptionStatus(status);
  }
  async getSubscriptionStatus() {
    await this.awaitConfig();
    const subscriptionStatusData = await SuperwallReactNative.getSubscriptionStatus();
    return _SubscriptionStatus.SubscriptionStatus.fromJson(subscriptionStatusData.subscriptionStatus);
  }
  /**
   * Sets the user interface style, which overrides the system setting.
   *
   * Provide a value of type {@link InterfaceStyle} to explicitly set the interface style.
   * Pass `null` to revert back to the system's default interface style.
   *
   * @param {InterfaceStyle | null} style - The desired interface style, or `null` to use the system setting.
   *
   * @returns {Promise<void>} A promise that resolves once the interface style has been updated.
   */
  async setInterfaceStyle(style) {
    await SuperwallReactNative.setInterfaceStyle(style === null || style === void 0 ? void 0 : style.toString());
  }

  /**
   * Sets the delegate that handles Superwall lifecycle events.
   *
   * @param {SuperwallDelegate | undefined} delegate - An object implementing the {@link SuperwallDelegate} interface,
   * or `undefined` to remove the current delegate.
   *
   * @returns {Promise<void>} A promise that resolves once the delegate has been updated.
   */
  async setDelegate(delegate) {
    await this.awaitConfig();
    Superwall.delegate = delegate;
    await SuperwallReactNative.setDelegate(delegate === undefined);
  }

  /**
   * Retrieves the user attributes, set using {@link setUserAttributes}.
   *
   * @returns {Promise<UserAttributes>} A promise that resolves with an object representing the user's attributes.
   */
  async getUserAttributes() {
    await this.awaitConfig();
    const userAttributes = await SuperwallReactNative.getUserAttributes();
    return userAttributes;
  }

  /**
   * Preloads all paywalls that the user may see based on campaigns and placements in your Superwall dashboard.
   *
   * To use this, first set `PaywallOptions.shouldPreload` to `false` when configuring the SDK.
   * Then call this function when you want preloading to begin.
   *
   * Note: This method will not reload any paywalls that have already been preloaded via {@link preloadPaywalls}.
   *
   * @returns {Promise<void>} A promise that resolves once the preloading process has been initiated.
   */
  async preloadAllPaywalls() {
    await this.awaitConfig();
    await SuperwallReactNative.preloadAllPaywalls();
  }

  /**
   * Preloads paywalls for specific placements.
   *
   * To use this method, first ensure that {@link PaywallOptions.shouldPreload} is set to `false` when configuring the SDK.
   * Then call this function when you want to initiate preloading for selected placements.
   *
   * Note: This will not reload any paywalls you've already preloaded.
   *
   * @param {Set<string>} placementNames - A set of placement names whose paywalls you want to preload.
   *
   * @returns {Promise<void>} A promise that resolves once the preloading process has been initiated.
   */
  async preloadPaywalls(placementNames) {
    await this.awaitConfig();
    await SuperwallReactNative.preloadPaywalls(Array.from(placementNames));
  }

  /**
   * Sets user attributes for use in paywalls and on the Superwall dashboard.
   *
   * If an attribute already exists, its value will be overwritten while other attributes remain unchanged.
   * This is useful for analytics and campaign audience filters you may define in the Superwall Dashboard.
   *
   * **Note:** These attributes should not be used as a source of truth for sensitive information.
   *
   * For example, after retrieving your user's data:
   *
   * ```ts
   * const attributes: UserAttributes = {
   *   name: user.name,
   *   apnsToken: user.apnsTokenString,
   *   email: user.email,
   *   username: user.username,
   *   profilePic: user.profilePicUrl,
   * }
   * await Superwall.setUserAttributes(attributes)
   * ```
   *
   * See [Setting User Attributes](https://docs.superwall.com/docs/setting-user-properties) for more information.
   *
   * @param {UserAttributes} userAttributes - An object containing custom attributes to store for the user.
   *   Values can be any JSON-encodable value, URLs, or Dates. Keys beginning with `$` are reserved for Superwall and will be dropped.
   *   Arrays and dictionaries as values are not supported and will be omitted.
   *
   * @returns {Promise<void>} A promise that resolves once the user attributes have been updated.
   */
  async setUserAttributes(userAttributes) {
    await this.awaitConfig();
    await SuperwallReactNative.setUserAttributes(userAttributes);
  }

  /**
   * Dismisses the presented paywall, if one exists.
   *
   * @returns {Promise<void>} A promise that resolves once the paywall has been dismissed,
   * or immediately if no paywall was active.
   */
  async dismiss() {
    await SuperwallReactNative.dismiss();
  }
  async setLogLevel(level) {
    await SuperwallReactNative.setLogLevel(level.toString());
  }
}
exports.default = Superwall;
//# sourceMappingURL=index.js.map