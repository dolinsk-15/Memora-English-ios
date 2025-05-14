import { SubscriptionStatus } from './SubscriptionStatus';
// Utility functions for EntitlementsInfo
export let EntitlementsInfo;
(function (_EntitlementsInfo) {
  function fromObject(obj) {
    return {
      status: SubscriptionStatus.fromString(obj.status, obj.active),
      active: obj.active,
      all: obj.all,
      inactive: obj.inactive
    };
  }
  _EntitlementsInfo.fromObject = fromObject;
})(EntitlementsInfo || (EntitlementsInfo = {}));
//# sourceMappingURL=EntitlementsInfo.js.map