export declare class ComputedPropertyRequest {
    type: ComputedPropertyRequestType;
    placementName: string;
    constructor(type: ComputedPropertyRequestType, placementName: string);
    static fromJson(json: {
        type: string;
        placementName: string;
    }): ComputedPropertyRequest;
}
export declare enum ComputedPropertyRequestType {
    minutesSince = "minutesSince",
    hoursSince = "hoursSince",
    daysSince = "daysSince",
    monthsSince = "monthsSince",
    yearsSince = "yearsSince"
}
export declare namespace ComputedPropertyRequestType {
    function toJson(type: ComputedPropertyRequestType): string;
    function fromJson(json: string): ComputedPropertyRequestType;
}
//# sourceMappingURL=ComputedPropertyRequest.d.ts.map