export let ConfigurationStatus = /*#__PURE__*/function (ConfigurationStatus) {
  ConfigurationStatus["CONFIGURED"] = "CONFIGURED";
  ConfigurationStatus["FAILED"] = "FAILED";
  ConfigurationStatus["PENDING"] = "PENDING";
  return ConfigurationStatus;
}({});
(function (_ConfigurationStatus) {
  function fromString(value) {
    switch (value) {
      case 'FAILED':
        return ConfigurationStatus.FAILED;
      case 'PENDING':
        return ConfigurationStatus.PENDING;
      case 'CONFIGURED':
        return ConfigurationStatus.CONFIGURED;
      default:
        return ConfigurationStatus.PENDING;
    }
  }
  _ConfigurationStatus.fromString = fromString;
  function toString(value) {
    switch (value) {
      case ConfigurationStatus.FAILED:
        return 'FAILED';
      case ConfigurationStatus.PENDING:
        return 'PENDING';
      case ConfigurationStatus.CONFIGURED:
        return 'CONFIGURED';
    }
  }
  _ConfigurationStatus.toString = toString;
})(ConfigurationStatus || (ConfigurationStatus = {}));
//# sourceMappingURL=ConfigurationStatus.js.map