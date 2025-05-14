export let InterfaceStyle = /*#__PURE__*/function (InterfaceStyle) {
  InterfaceStyle["LIGHT"] = "LIGHT";
  InterfaceStyle["DARK"] = "DARK";
  return InterfaceStyle;
}({});
(function (_InterfaceStyle) {
  function fromString(value) {
    switch (value) {
      case 'LIGHT':
        return InterfaceStyle.LIGHT;
      case 'DARK':
        return InterfaceStyle.DARK;
      default:
        return InterfaceStyle.LIGHT;
    }
  }
  _InterfaceStyle.fromString = fromString;
})(InterfaceStyle || (InterfaceStyle = {}));
//# sourceMappingURL=InterfaceStyle.js.map