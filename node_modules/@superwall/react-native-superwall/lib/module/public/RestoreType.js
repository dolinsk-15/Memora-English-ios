import { StoreTransaction } from "./StoreTransaction";

// Enum for RestoreType cases
export let RestoreTypeCase = /*#__PURE__*/function (RestoreTypeCase) {
  RestoreTypeCase[RestoreTypeCase["viaPurchase"] = 0] = "viaPurchase";
  RestoreTypeCase[RestoreTypeCase["viaRestore"] = 1] = "viaRestore";
  return RestoreTypeCase;
}({});
export class RestoreType {
  constructor(type, storeTransaction) {
    this.type = type;
    this.storeTransaction = storeTransaction;
  }

  // Static methods to create instances of RestoreType
  static viaPurchase(storeTransaction) {
    return new RestoreType(RestoreTypeCase.viaPurchase, storeTransaction);
  }
  static viaRestore = new RestoreType(RestoreTypeCase.viaRestore);

  // Static factory method to deserialize from JSON
  static fromJson(json) {
    switch (json.type) {
      case 'viaPurchase':
        return RestoreType.viaPurchase(json.storeTransaction ? StoreTransaction.fromJson(json.storeTransaction) : undefined);
      case 'viaRestore':
        return RestoreType.viaRestore;
      default:
        throw new Error('Invalid RestoreType type');
    }
  }
}
//# sourceMappingURL=RestoreType.js.map