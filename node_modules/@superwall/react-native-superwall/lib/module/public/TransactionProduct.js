export class TransactionProduct {
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
//# sourceMappingURL=TransactionProduct.js.map