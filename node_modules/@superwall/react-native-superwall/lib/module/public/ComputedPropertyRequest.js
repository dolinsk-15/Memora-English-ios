// TypeScript class for the request to compute a device property
export class ComputedPropertyRequest {
  constructor(type, placementName) {
    this.type = type;
    this.placementName = placementName;
  }

  // Static method to create an instance from a JSON object
  static fromJson(json) {
    const type = ComputedPropertyRequestType.fromJson(json.type);
    return new ComputedPropertyRequest(type, json.placementName);
  }
}

// TypeScript enum for the types of computed properties
export let ComputedPropertyRequestType = /*#__PURE__*/function (ComputedPropertyRequestType) {
  ComputedPropertyRequestType["minutesSince"] = "minutesSince";
  ComputedPropertyRequestType["hoursSince"] = "hoursSince";
  ComputedPropertyRequestType["daysSince"] = "daysSince";
  ComputedPropertyRequestType["monthsSince"] = "monthsSince";
  ComputedPropertyRequestType["yearsSince"] = "yearsSince";
  return ComputedPropertyRequestType;
}({});

// Utilizing a namespace to extend the enum with serialization and deserialization functions
(function (_ComputedPropertyRequestType) {
  function toJson(type) {
    return type;
  }
  _ComputedPropertyRequestType.toJson = toJson;
  function fromJson(json) {
    const matchingType = Object.values(ComputedPropertyRequestType).find(value => value === json);
    if (!matchingType) {
      throw new Error(`Invalid ComputedPropertyRequestType value: ${json}`);
    }
    return matchingType;
  }
  _ComputedPropertyRequestType.fromJson = fromJson;
})(ComputedPropertyRequestType || (ComputedPropertyRequestType = {}));
//# sourceMappingURL=ComputedPropertyRequest.js.map