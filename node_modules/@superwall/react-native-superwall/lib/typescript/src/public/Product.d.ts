import { Entitlement } from './Entitlement';
export declare class Product {
    name?: string;
    id: string;
    entitlements: Set<Entitlement>;
    constructor({ id, name, entitlements, }: {
        id: string;
        name?: string;
        entitlements: Set<Entitlement>;
    });
    static fromJson(json: {
        [key: string]: any;
    }): Product;
}
//# sourceMappingURL=Product.d.ts.map