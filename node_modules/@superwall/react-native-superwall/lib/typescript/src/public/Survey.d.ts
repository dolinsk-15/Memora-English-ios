export declare enum SurveyShowCondition {
    onManualClose = "ON_MANUAL_CLOSE",
    onPurchase = "ON_PURCHASE"
}
export declare namespace SurveyShowCondition {
    function toJson(condition: SurveyShowCondition): string;
    function fromJson(json: string): SurveyShowCondition;
}
export declare class SurveyOption {
    id: string;
    title: string;
    constructor(id: string, title: string);
    static fromJson(json: any): SurveyOption;
}
export declare class Survey {
    id: string;
    assignmentKey: string;
    title: string;
    message: string;
    options: SurveyOption[];
    presentationCondition: SurveyShowCondition;
    presentationProbability: number;
    includeOtherOption: boolean;
    includeCloseOption: boolean;
    constructor(id: string, assignmentKey: string, title: string, message: string, options: SurveyOption[], presentationCondition: SurveyShowCondition, presentationProbability: number, includeOtherOption: boolean, includeCloseOption: boolean);
    static fromJson(json: any): Survey;
}
//# sourceMappingURL=Survey.d.ts.map