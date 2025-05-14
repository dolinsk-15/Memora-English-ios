import { Entitlement } from './Entitlement';
export class Product {
  constructor({
    id,
    name,
    entitlements
  }) {
    this.id = id;
    this.name = name;
    this.entitlements = entitlements;
  }

  // Factory method to create a Product instance from a JSON object
  static fromJson(json) {
    return new Product({
      id: json.id,
      name: json.name,
      entitlements: new Set(Array.isArray(json.entitlements) ? json.entitlements.map(item => Entitlement.fromJson(item)) : [])
    });
  }
}
//# sourceMappingURL=Product.js.map