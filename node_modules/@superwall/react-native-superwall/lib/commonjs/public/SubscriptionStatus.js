"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubscriptionStatus = void 0;
var _Entitlement = require("./Entitlement");
let SubscriptionStatus = exports.SubscriptionStatus = void 0;
(function (_SubscriptionStatus) {
  function Active(input) {
    return {
      status: `ACTIVE`,
      entitlements: input.length === 0 ? [] : typeof input[0] === 'string' ? input.map(id => new _Entitlement.Entitlement(id)) : input
    };
  }
  _SubscriptionStatus.Active = Active;
  function Inactive() {
    return {
      status: 'INACTIVE'
    };
  }
  _SubscriptionStatus.Inactive = Inactive;
  function Unknown() {
    return {
      status: 'UNKNOWN'
    };
  }
  _SubscriptionStatus.Unknown = Unknown;
  function fromString(value, entitlements) {
    switch (value) {
      case 'ACTIVE':
        return Active(entitlements);
      case 'INACTIVE':
        return Inactive();
      case 'UNKNOWN':
      default:
        return Unknown();
    }
  }
  _SubscriptionStatus.fromString = fromString;
  function fromJson(json) {
    switch (json.status) {
      case 'ACTIVE':
        return {
          status: 'ACTIVE',
          entitlements: json.entitlements.map(entitlement => _Entitlement.Entitlement.fromJson(entitlement))
        };
      case 'INACTIVE':
        return {
          status: 'INACTIVE'
        };
      case 'UNKNOWN':
      default:
        return {
          status: 'UNKNOWN'
        };
    }
  }
  _SubscriptionStatus.fromJson = fromJson;
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
//# sourceMappingURL=SubscriptionStatus.js.map