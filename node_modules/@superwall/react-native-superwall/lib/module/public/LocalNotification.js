export let LocalNotificationType = /*#__PURE__*/function (LocalNotificationType) {
  LocalNotificationType["TrialStarted"] = "trialStarted";
  return LocalNotificationType;
}({});
export class LocalNotificationTypeUtils {
  static fromJson(value) {
    switch (value) {
      case 'trialStarted':
        return LocalNotificationType.TrialStarted;
      default:
        throw new Error(`Invalid LocalNotificationType value: ${value}`);
    }
  }
  static toJson(type) {
    switch (type) {
      case LocalNotificationType.TrialStarted:
        return 'trialStarted';
      default:
        throw new Error(`Invalid LocalNotificationType value`);
    }
  }
}
export class LocalNotification {
  constructor({
    type,
    title,
    subtitle,
    body,
    delay
  }) {
    this.type = type;
    this.title = title;
    this.subtitle = subtitle;
    this.body = body;
    this.delay = delay;
  }
  static fromJson(json) {
    return new LocalNotification({
      type: LocalNotificationTypeUtils.fromJson(json.type),
      title: json.title,
      subtitle: json.subtitle,
      body: json.body,
      delay: json.delay
    });
  }
  toJson() {
    return {
      type: LocalNotificationTypeUtils.toJson(this.type),
      title: this.title,
      subtitle: this.subtitle,
      body: this.body,
      delay: this.delay
    };
  }
}
//# sourceMappingURL=LocalNotification.js.map