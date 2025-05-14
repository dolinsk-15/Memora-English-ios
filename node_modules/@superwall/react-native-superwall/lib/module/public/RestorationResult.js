export class RestorationResult {
  static restored() {
    return new Restored();
  }
  static failed(error) {
    return new Failed(error);
  }
}
export class Restored extends RestorationResult {
  toJson() {
    return {
      result: 'restored'
    };
  }
}
export class Failed extends RestorationResult {
  constructor(error) {
    super();
    this.error = error;
  }
  toJson() {
    return {
      result: 'failed',
      errorMessage: this.error ? this.error.message : null
    };
  }
}
//# sourceMappingURL=RestorationResult.js.map