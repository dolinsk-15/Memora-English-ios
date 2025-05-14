"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FeatureGatingBehavior = void 0;
exports.featureGatingBehaviorFromJson = featureGatingBehaviorFromJson;
exports.featureGatingBehaviorToJson = featureGatingBehaviorToJson;
let FeatureGatingBehavior = exports.FeatureGatingBehavior = /*#__PURE__*/function (FeatureGatingBehavior) {
  FeatureGatingBehavior["gated"] = "gated";
  FeatureGatingBehavior["nonGated"] = "nonGated";
  return FeatureGatingBehavior;
}({}); // Standalone functions for conversion
function featureGatingBehaviorToJson(behavior) {
  return behavior;
}
function featureGatingBehaviorFromJson(json) {
  const behavior = Object.values(FeatureGatingBehavior).find(b => b === json);
  if (!behavior) {
    throw new Error(`Invalid FeatureGatingBehavior value: ${json}`);
  }
  return behavior;
}
//# sourceMappingURL=FeatureGatingBehavior.js.map