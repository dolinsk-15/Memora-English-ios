"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Restored = exports.RestorationResult = exports.Failed = void 0;
class RestorationResult {
  static restored() {
    return new Restored();
  }
  static failed(error) {
    return new Failed(error);
  }
}
exports.RestorationResult = RestorationResult;
class Restored extends RestorationResult {
  toJson() {
    return {
      result: 'restored'
    };
  }
}
exports.Restored = Restored;
class Failed extends RestorationResult {
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
exports.Failed = Failed;
//# sourceMappingURL=RestorationResult.js.map