export let VariantType = /*#__PURE__*/function (VariantType) {
  VariantType["treatment"] = "treatment";
  VariantType["holdout"] = "holdout";
  return VariantType;
}({});

// Utilize a namespace to add static methods for JSON conversion
(function (_VariantType) {
  function toJson(type) {
    return type;
  }
  _VariantType.toJson = toJson;
  function fromJson(json) {
    if (!Object.values(VariantType).includes(json)) {
      throw new Error(`Invalid VariantType value: ${json}`);
    }
    return json;
  }
  _VariantType.fromJson = fromJson;
})(VariantType || (VariantType = {}));
export class Variant {
  constructor(id, type, paywallId) {
    this.id = id;
    this.type = type;
    this.paywallId = paywallId;
  }
  static fromJson(json) {
    return new Variant(json.id, VariantType.fromJson(json.type), json.paywallId);
  }
  toJson() {
    return {
      id: this.id,
      type: VariantType.toJson(this.type),
      paywallId: this.paywallId
    };
  }
}
//# sourceMappingURL=Variant.js.map