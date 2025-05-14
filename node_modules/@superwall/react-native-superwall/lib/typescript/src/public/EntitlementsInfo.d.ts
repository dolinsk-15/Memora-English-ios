import type { Entitlement } from './Entitlement';
import { SubscriptionStatus } from './SubscriptionStatus';
export interface EntitlementsInfo {
    status: SubscriptionStatus;
    active: Entitlement[];
    all: Entitlement[];
    inactive: Entitlement[];
}
export declare namespace EntitlementsInfo {
    function fromObject(obj: any): EntitlementsInfo;
}
//# sourceMappingURL=EntitlementsInfo.d.ts.map