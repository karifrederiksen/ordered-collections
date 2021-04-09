export declare function numberLT(l: number, r: number): boolean;
export declare function stringLT(l: string, r: string): boolean;
export declare type LessThan<a> = (key: a, otherKey: a) => boolean;
export declare function compareNumber(l: number, r: number): number;
export declare function compareString(l: string, r: string): number;
export declare function mutablePush<a>(arr: a[], val: a): a[];
