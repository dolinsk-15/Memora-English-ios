"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoreProduct = void 0;
/// A wrapper around a store product.
class StoreProduct {
  // The product identifier

  // The localized price.

  // The localized subscription period.

  // The subscription period unit, e.g., week.

  // The number of weeks in the product's subscription period.

  // The string value of the number of weeks in the product's subscription period.

  // The number of months in the product's subscription period.

  // The string value of the number of months in the product's subscription period.

  // The number of years in the product's subscription period.

  // The string value of the number of years in the product's subscription period.

  // The number of days in the product's subscription period.

  // The string value of the number of days in the product's subscription period.

  // The product's localized daily price.

  // The product's localized weekly price.

  // The product's localized monthly price.

  // The product's localized yearly price.

  // A boolean indicating whether the product has an introductory price.

  // The product's trial period end date.

  // The product's trial period end date formatted using `DateFormatter.Style.medium`

  // The product's introductory price duration in days.

  // The product's introductory price duration in days.

  // The product's introductory price duration in days.

  // The product's string value of the introductory price duration in days.

  // The product's introductory price duration in weeks.

  // The product's string value of the introductory price duration in weeks.

  // The product's introductory price duration in months.

  // The product's string value of the introductory price duration in months.

  // The product's introductory price duration in years.

  // The product's string value of the introductory price duration in years.

  // The product's introductory price duration in days, e.g., 7-day.

  // The product's locale.

  // The language code of the product's locale.

  // The currency code of the product's locale.

  // The currency symbol of the product's locale.

  // A boolean that indicates whether the product is family shareable.

  // The region code of the product's price locale.

  // The price of the product in the local currency.

  constructor({
    productIdentifier,
    localizedPrice,
    localizedSubscriptionPeriod,
    period,
    periodWeeks,
    periodWeeksString,
    periodMonths,
    periodMonthsString,
    periodYears,
    periodYearsString,
    periodDays,
    periodDaysString,
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    yearlyPrice,
    hasFreeTrial,
    trialPeriodEndDate,
    trialPeriodEndDateString,
    localizedTrialPeriodPrice,
    trialPeriodPrice,
    trialPeriodDays,
    trialPeriodDaysString,
    trialPeriodWeeks,
    trialPeriodWeeksString,
    trialPeriodMonths,
    trialPeriodMonthsString,
    trialPeriodYears,
    trialPeriodYearsString,
    trialPeriodText,
    locale,
    languageCode,
    currencyCode,
    currencySymbol,
    isFamilyShareable,
    regionCode,
    price
  }) {
    this.productIdentifier = productIdentifier;
    this.localizedPrice = localizedPrice;
    this.localizedSubscriptionPeriod = localizedSubscriptionPeriod;
    this.period = period;
    this.periodWeeks = periodWeeks;
    this.periodWeeksString = periodWeeksString;
    this.periodMonths = periodMonths;
    this.periodMonthsString = periodMonthsString;
    this.periodYears = periodYears;
    this.periodYearsString = periodYearsString;
    this.periodDays = periodDays;
    this.periodDaysString = periodDaysString;
    this.dailyPrice = dailyPrice;
    this.weeklyPrice = weeklyPrice;
    this.monthlyPrice = monthlyPrice;
    this.yearlyPrice = yearlyPrice;
    this.hasFreeTrial = hasFreeTrial;
    this.trialPeriodEndDate = trialPeriodEndDate;
    this.trialPeriodEndDateString = trialPeriodEndDateString;
    this.localizedTrialPeriodPrice = localizedTrialPeriodPrice;
    this.trialPeriodPrice = trialPeriodPrice;
    this.trialPeriodDays = trialPeriodDays;
    this.trialPeriodDaysString = trialPeriodDaysString;
    this.trialPeriodWeeks = trialPeriodWeeks;
    this.trialPeriodWeeksString = trialPeriodWeeksString;
    this.trialPeriodMonths = trialPeriodMonths;
    this.trialPeriodMonthsString = trialPeriodMonthsString;
    this.trialPeriodYears = trialPeriodYears;
    this.trialPeriodYearsString = trialPeriodYearsString;
    this.trialPeriodText = trialPeriodText;
    this.locale = locale;
    this.languageCode = languageCode;
    this.currencyCode = currencyCode;
    this.currencySymbol = currencySymbol;
    this.isFamilyShareable = isFamilyShareable;
    this.regionCode = regionCode;
    this.price = price;
  }
  static fromJson(json) {
    return new StoreProduct({
      productIdentifier: json.productIdentifier,
      localizedPrice: json.localizedPrice,
      localizedSubscriptionPeriod: json.localizedSubscriptionPeriod,
      period: json.period,
      periodWeeks: json.periodWeeks,
      periodWeeksString: json.periodWeeksString,
      periodMonths: json.periodMonths,
      periodMonthsString: json.periodMonthsString,
      periodYears: json.periodYears,
      periodYearsString: json.periodYearsString,
      periodDays: json.periodDays,
      periodDaysString: json.periodDaysString,
      dailyPrice: json.dailyPrice,
      weeklyPrice: json.weeklyPrice,
      monthlyPrice: json.monthlyPrice,
      yearlyPrice: json.yearlyPrice,
      hasFreeTrial: json.hasFreeTrial,
      trialPeriodEndDate: json.trialPeriodEndDate ? new Date(json.trialPeriodEndDate) : null,
      trialPeriodEndDateString: json.trialPeriodEndDateString,
      localizedTrialPeriodPrice: json.localizedTrialPeriodPrice,
      trialPeriodPrice: json.trialPeriodPrice,
      trialPeriodDays: json.trialPeriodDays,
      trialPeriodDaysString: json.trialPeriodDaysString,
      trialPeriodWeeks: json.trialPeriodWeeks,
      trialPeriodWeeksString: json.trialPeriodWeeksString,
      trialPeriodMonths: json.trialPeriodMonths,
      trialPeriodMonthsString: json.trialPeriodMonthsString,
      trialPeriodYears: json.trialPeriodYears,
      trialPeriodYearsString: json.trialPeriodYearsString,
      trialPeriodText: json.trialPeriodText,
      locale: json.locale,
      languageCode: json.languageCode || null,
      currencyCode: json.currencyCode || null,
      currencySymbol: json.currencySymbol || null,
      isFamilyShareable: json.isFamilyShareable ?? false,
      regionCode: json.regionCode || null,
      price: json.price
    });
  }
}
exports.StoreProduct = StoreProduct;
//# sourceMappingURL=StoreProduct.js.map