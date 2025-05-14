export let FeatureGatingBehavior = /*#__PURE__*/function (FeatureGatingBehavior) {
  FeatureGatingBehavior["gated"] = "gated";
  FeatureGatingBehavior["nonGated"] = "nonGated";
  return FeatureGatingBehavior;
}({});

// Standalone functions for conversion
export function featureGatingBehaviorToJson(behavior) {
  return behavior;
}
export function featureGatingBehaviorFromJson(json) {
  const behavior = Object.values(FeatureGatingBehavior).find(b => b === json);
  if (!behavior) {
    throw new Error(`Invalid FeatureGatingBehavior value: ${json}`);
  }
  return behavior;
}
//# sourceMappingURL=FeatureGatingBehavior.js.map