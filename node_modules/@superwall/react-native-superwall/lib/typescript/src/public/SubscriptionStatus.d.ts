import { Entitlement } from './Entitlement';
export type SubscriptionStatus = SubscriptionStatus.Active | SubscriptionStatus.Inactive | SubscriptionStatus.Unknown;
export declare namespace SubscriptionStatus {
    type Active = {
        status: `ACTIVE`;
        entitlements: Entitlement[];
    };
    type Inactive = {
        status: `INACTIVE`;
    };
    type Unknown = {
        status: `UNKNOWN`;
    };
    function Active(input: Entitlement[] | string[]): Active;
    function Inactive(): Inactive;
    function Unknown(): Unknown;
    function fromString(value: string, entitlements: Entitlement[]): SubscriptionStatus;
    function fromJson(json: any): SubscriptionStatus;
}
//# sourceMappingURL=SubscriptionStatus.d.ts.map