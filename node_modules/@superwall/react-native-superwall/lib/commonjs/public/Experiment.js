"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VariantType = exports.Variant = exports.Experiment = void 0;
class Experiment {
  constructor(id, groupId, variant) {
    this.id = id;
    this.groupId = groupId;
    this.variant = variant;
  }
  static fromJson(json) {
    return new Experiment(json.id, json.groupId, Variant.fromJson(json.variant));
  }
  toJson() {
    return {
      id: this.id,
      groupId: this.groupId,
      variant: this.variant.toJson()
    };
  }
}
exports.Experiment = Experiment;
class Variant {
  constructor(id, type, paywallId) {
    this.id = id;
    this.type = type;
    this.paywallId = paywallId;
  }
  static fromJson(json) {
    return new Variant(json.id, VariantType[json.type], json.paywallId ?? null);
  }
  toJson() {
    return {
      id: this.id,
      type: this.type,
      paywallId: this.paywallId
    };
  }
}
exports.Variant = Variant;
let VariantType = exports.VariantType = /*#__PURE__*/function (VariantType) {
  VariantType["TREATMENT"] = "TREATMENT";
  VariantType["HOLDOUT"] = "HOLDOUT";
  return VariantType;
}({});
//# sourceMappingURL=Experiment.js.map