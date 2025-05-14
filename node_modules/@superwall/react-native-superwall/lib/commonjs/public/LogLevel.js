"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogLevel = void 0;
// Define the LogLevel enum
let LogLevel = exports.LogLevel = /*#__PURE__*/function (LogLevel) {
  LogLevel["Debug"] = "debug";
  LogLevel["Info"] = "info";
  LogLevel["Warn"] = "warn";
  LogLevel["Error"] = "error";
  LogLevel["None"] = "none";
  return LogLevel;
}({}); // Use a namespace with the same name as the enum to extend its functionality
(function (_LogLevel) {
  function fromJson(json) {
    switch (json) {
      case 'debug':
        return LogLevel.Debug;
      case 'info':
        return LogLevel.Info;
      case 'warn':
        return LogLevel.Warn;
      case 'error':
        return LogLevel.Error;
      case 'none':
        return LogLevel.None;
      default:
        throw new Error(`Invalid LogLevel: ${json}`);
    }
  }
  _LogLevel.fromJson = fromJson;
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=LogLevel.js.map