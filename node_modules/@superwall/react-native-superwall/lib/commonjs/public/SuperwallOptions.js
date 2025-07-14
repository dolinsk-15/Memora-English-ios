"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SuperwallOptions = exports.NetworkEnvironment = exports.LoggingOptions = void 0;
var _LogLevel = require("./LogLevel");
var _LogScope = require("./LogScope");
var _PaywallOptions = require("./PaywallOptions");
let NetworkEnvironment = exports.NetworkEnvironment = /*#__PURE__*/function (NetworkEnvironment) {
  NetworkEnvironment["Release"] = "release";
  NetworkEnvironment["ReleaseCandidate"] = "releaseCandidate";
  NetworkEnvironment["Developer"] = "developer";
  return NetworkEnvironment;
}({});
class LoggingOptions {
  level = _LogLevel.LogLevel.Info;
  scopes = [_LogScope.LogScope.All];
  toJson() {
    return {
      level: this.level,
      scopes: this.scopes
    };
  }
}
exports.LoggingOptions = LoggingOptions;
class SuperwallOptions {
  paywalls = new _PaywallOptions.PaywallOptions();
  networkEnvironment = NetworkEnvironment.Release;
  isExternalDataCollectionEnabled = true;
  isGameControllerEnabled = false;
  logging = new LoggingOptions();
  collectAdServicesAttribution = false;
  passIdentifiersToPlayStore = false;
  enableExperimentalDeviceVariables = false;
  constructor(init) {
    if (init) {
      if (init.paywalls) {
        this.paywalls = new _PaywallOptions.PaywallOptions();
        Object.assign(this.paywalls, init.paywalls);
      }
      Object.assign(this, {
        ...init,
        paywalls: this.paywalls
      });
    }
  }

  // You can add methods to this class if needed
  toJson() {
    // Method to serialize class instance to a plain object, useful when passing to native code
    return {
      paywalls: this.paywalls.toJson(),
      networkEnvironment: this.networkEnvironment,
      isExternalDataCollectionEnabled: this.isExternalDataCollectionEnabled,
      localeIdentifier: this.localeIdentifier,
      isGameControllerEnabled: this.isGameControllerEnabled,
      logging: this.logging.toJson(),
      collectAdServicesAttribution: this.collectAdServicesAttribution,
      passIdentifiersToPlayStore: this.passIdentifiersToPlayStore,
      storeKitVersion: this.storeKitVersion,
      enableExperimentalDeviceVariables: this.enableExperimentalDeviceVariables
    };
  }
}
exports.SuperwallOptions = SuperwallOptions;
//# sourceMappingURL=SuperwallOptions.js.map