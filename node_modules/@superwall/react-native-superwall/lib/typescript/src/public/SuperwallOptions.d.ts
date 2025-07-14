import { LogLevel } from './LogLevel';
import { LogScope } from './LogScope';
import { PaywallOptions } from './PaywallOptions';
export declare enum NetworkEnvironment {
    Release = "release",
    ReleaseCandidate = "releaseCandidate",
    Developer = "developer"
}
export declare class LoggingOptions {
    level: LogLevel;
    scopes: LogScope[];
    toJson(): object;
}
export declare class SuperwallOptions {
    paywalls: PaywallOptions;
    networkEnvironment: NetworkEnvironment;
    isExternalDataCollectionEnabled: boolean;
    localeIdentifier?: string;
    isGameControllerEnabled: boolean;
    logging: LoggingOptions;
    collectAdServicesAttribution: boolean;
    passIdentifiersToPlayStore: boolean;
    storeKitVersion?: "STOREKIT1" | "STOREKIT2";
    enableExperimentalDeviceVariables: boolean;
    constructor(init?: Partial<SuperwallOptions>);
    toJson(): object;
}
//# sourceMappingURL=SuperwallOptions.d.ts.map