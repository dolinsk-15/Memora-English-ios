export function fromJson(json) {
  var _json$product;
  switch (json.type) {
    case 'purchased':
      return {
        type: 'purchased',
        productId: json.productId || ((_json$product = json.product) === null || _json$product === void 0 ? void 0 : _json$product.id) || ''
      };
    case 'declined':
      return {
        type: 'declined'
      };
    case 'restored':
      return {
        type: 'restored'
      };
    default:
      throw new Error(`Unknown PaywallResult type: ${json.type}`);
  }
}
//# sourceMappingURL=PaywallResult.js.map