export declare enum LocalNotificationType {
    TrialStarted = "trialStarted"
}
export declare class LocalNotificationTypeUtils {
    static fromJson(value: string): LocalNotificationType;
    static toJson(type: LocalNotificationType): string;
}
export declare class LocalNotification {
    type: LocalNotificationType;
    title: string;
    subtitle?: string;
    body: string;
    delay: number;
    constructor({ type, title, subtitle, body, delay, }: {
        type: LocalNotificationType;
        title: string;
        subtitle?: string;
        body: string;
        delay: number;
    });
    static fromJson(json: {
        [key: string]: any;
    }): LocalNotification;
    toJson(): {
        [key: string]: any;
    };
}
//# sourceMappingURL=LocalNotification.d.ts.map