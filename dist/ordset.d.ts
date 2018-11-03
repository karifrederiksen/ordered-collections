import { Comp } from "./util";
export declare class OrdSet<a> {
    private readonly compare;
    private readonly root;
    static empty<a>(compare: Comp<a>): OrdSet<a>;
    static emptyNumber(): OrdSet<number>;
    static emptyString(): OrdSet<string>;
    static of<a>(value: a, compare: Comp<a>): OrdSet<a>;
    static ofNumber(value: number): OrdSet<number>;
    static ofString(value: string): OrdSet<string>;
    static from<a>(iterable: Iterable<a>, compare: Comp<a>): OrdSet<a>;
    static fromNumbers(iterable: Iterable<number>): OrdSet<number>;
    static fromStrings(iterable: Iterable<string>): OrdSet<string>;
    private constructor();
    readonly size: number;
    has(key: a): boolean;
    min(): a | undefined;
    max(): a | undefined;
    insert(value: a): OrdSet<a>;
    remove(key: a): OrdSet<a>;
    union(other: OrdSet<a>): OrdSet<a>;
    intersect(other: OrdSet<a>): OrdSet<a>;
    difference(other: OrdSet<a>): OrdSet<a>;
    toArray(): Array<a>;
    toJSON(): unknown;
    reverseIterator(): Iterator<a>;
    [Symbol.iterator](): Iterator<a>;
}
