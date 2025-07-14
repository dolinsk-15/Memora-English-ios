import { LogLevel } from './LogLevel';
import { LogScope } from './LogScope';
import { PaywallOptions } from './PaywallOptions';
export let NetworkEnvironment = /*#__PURE__*/function (NetworkEnvironment) {
  NetworkEnvironment["Release"] = "release";
  NetworkEnvironment["ReleaseCandidate"] = "releaseCandidate";
  NetworkEnvironment["Developer"] = "developer";
  return NetworkEnvironment;
}({});
export class LoggingOptions {
  level = LogLevel.Info;
  scopes = [LogScope.All];
  toJson() {
    return {
      level: this.level,
      scopes: this.scopes
    };
  }
}
export class SuperwallOptions {
  paywalls = new PaywallOptions();
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
        this.paywalls = new PaywallOptions();
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
//# sourceMappingURL=SuperwallOptions.js.map