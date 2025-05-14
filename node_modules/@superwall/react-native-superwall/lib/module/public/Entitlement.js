export class Entitlement {
  // The entitlement's identifier.

  // The entitlement's type.

  /**
   * Creates an instance of Entitlement.
   * @param id - The entitlement's identifier.
   */
  constructor(id) {
    this.id = id;
    this.type = 'SERVICE_LEVEL';
  }
  static fromJson(json) {
    return Entitlement.create(json.id, json.type);
  }

  /**
   * Creates an Entitlement instance from id and type strings.
   * @param id - The entitlement's identifier.
   * @param type - The entitlement's type.
   * @returns A new Entitlement instance.
   */
  static create(id, type) {
    let e = new Entitlement(id);
    e.type = type;
    return e;
  }
}
//# sourceMappingURL=Entitlement.js.map