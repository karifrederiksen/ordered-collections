import { LessThan } from "./util";
export declare class OrdSet<a> {
    private readonly compare;
    private readonly root;
    static empty<a>(compare: LessThan<a>): OrdSet<a>;
    static of<a>(value: a, compare: LessThan<a>): OrdSet<a>;
    static from<a>(iterable: Iterable<a>, compare: LessThan<a>): OrdSet<a>;
    static readonly number: {
        empty(): OrdSet<number>;
        of(val: number): OrdSet<number>;
        from(iterable: Iterable<number>): OrdSet<number>;
    };
    static readonly string: {
        empty(): OrdSet<string>;
        of(val: string): OrdSet<string>;
        from(iterable: Iterable<string>): OrdSet<string>;
    };
    private constructor();
    readonly size: number;
    has(key: a): boolean;
    min(): a | undefined;
    max(): a | undefined;
    insert(value: a): OrdSet<a>;
    remove(key: a): OrdSet<a>;
    foldl<b>(f: (curr: b, next: a) => b, initial: b): b;
    foldr<b>(f: (curr: b, next: a) => b, initial: b): b;
    union(other: OrdSet<a>): OrdSet<a>;
    intersect(other: OrdSet<a>): OrdSet<a>;
    difference(other: OrdSet<a>): OrdSet<a>;
    toArray(): Array<a>;
    toJSON(): unknown;
    reverseIterator(): Iterator<a>;
    [Symbol.iterator](): Iterator<a>;
}
