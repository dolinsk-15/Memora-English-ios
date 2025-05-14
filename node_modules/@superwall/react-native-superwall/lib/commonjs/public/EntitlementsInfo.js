"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntitlementsInfo = void 0;
var _SubscriptionStatus = require("./SubscriptionStatus");
// Utility functions for EntitlementsInfo
let EntitlementsInfo = exports.EntitlementsInfo = void 0;
(function (_EntitlementsInfo) {
  function fromObject(obj) {
    return {
      status: _SubscriptionStatus.SubscriptionStatus.fromString(obj.status, obj.active),
      active: obj.active,
      all: obj.all,
      inactive: obj.inactive
    };
  }
  _EntitlementsInfo.fromObject = fromObject;
})(EntitlementsInfo || (exports.EntitlementsInfo = EntitlementsInfo = {}));
//# sourceMappingURL=EntitlementsInfo.js.map