"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SurveyShowCondition = exports.SurveyOption = exports.Survey = void 0;
let SurveyShowCondition = exports.SurveyShowCondition = /*#__PURE__*/function (SurveyShowCondition) {
  SurveyShowCondition["onManualClose"] = "ON_MANUAL_CLOSE";
  SurveyShowCondition["onPurchase"] = "ON_PURCHASE";
  return SurveyShowCondition;
}({}); // Extending the enum functionality using a namespace
(function (_SurveyShowCondition) {
  function toJson(condition) {
    return condition;
  }
  _SurveyShowCondition.toJson = toJson;
  function fromJson(json) {
    if (!Object.values(SurveyShowCondition).includes(json)) {
      throw new Error(`Invalid SurveyShowCondition value: ${json}`);
    }
    return json;
  }
  _SurveyShowCondition.fromJson = fromJson;
})(SurveyShowCondition || (exports.SurveyShowCondition = SurveyShowCondition = {}));
class SurveyOption {
  constructor(id, title) {
    this.id = id;
    this.title = title;
  }
  static fromJson(json) {
    return new SurveyOption(json.id, json.title);
  }
}
exports.SurveyOption = SurveyOption;
class Survey {
  constructor(id, assignmentKey, title, message, options, presentationCondition, presentationProbability, includeOtherOption, includeCloseOption) {
    this.id = id;
    this.assignmentKey = assignmentKey;
    this.title = title;
    this.message = message;
    this.options = options;
    this.presentationCondition = presentationCondition;
    this.presentationProbability = presentationProbability;
    this.includeOtherOption = includeOtherOption;
    this.includeCloseOption = includeCloseOption;
  }
  static fromJson(json) {
    return new Survey(json.id, json.assignmentKey, json.title, json.message, json.options.map(SurveyOption.fromJson), SurveyShowCondition.fromJson(json.presentationCondition), Number(json.presentationProbability), json.includeOtherOption, json.includeCloseOption);
  }
}
exports.Survey = Survey;
//# sourceMappingURL=Survey.js.map