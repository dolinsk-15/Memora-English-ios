"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransactionProduct = void 0;
class TransactionProduct {
  constructor(id) {
    this.id = id;
  }
  static fromJson(json) {
    return new TransactionProduct(json.id);
  }
  toJson() {
    return {
      id: this.id
    };
  }
}
exports.TransactionProduct = TransactionProduct;
//# sourceMappingURL=TransactionProduct.js.map