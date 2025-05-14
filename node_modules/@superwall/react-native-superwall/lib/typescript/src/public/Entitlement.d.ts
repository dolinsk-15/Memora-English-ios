export declare class Entitlement {
    id: string;
    type: string;
    /**
     * Creates an instance of Entitlement.
     * @param id - The entitlement's identifier.
     */
    constructor(id: string);
    static fromJson(json: any): Entitlement;
    /**
     * Creates an Entitlement instance from id and type strings.
     * @param id - The entitlement's identifier.
     * @param type - The entitlement's type.
     * @returns A new Entitlement instance.
     */
    static create(id: string, type: string): Entitlement;
}
//# sourceMappingURL=Entitlement.d.ts.map