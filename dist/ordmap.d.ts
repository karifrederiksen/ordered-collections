import { LessThan } from "./util";
export declare class OrdMap<k, v> {
    private readonly compare;
    private readonly root;
    static empty<k, v>(compare: LessThan<k>): OrdMap<k, v>;
    static of<k, v>(key: k, value: v, compare: LessThan<k>): OrdMap<k, v>;
    static from<k, v>(iterable: Iterable<[k, v]>, compare: LessThan<k>): OrdMap<k, v>;
    static readonly number: {
        empty<v>(): OrdMap<number, v>;
        of<v>(key: number, value: v): OrdMap<number, v>;
        from<v>(iterable: Iterable<[number, v]>): OrdMap<number, v>;
    };
    static readonly string: {
        empty<v>(): OrdMap<string, v>;
        of<v>(key: string, value: v): OrdMap<string, v>;
        from<v>(iterable: Iterable<[string, v]>): OrdMap<string, v>;
    };
    private constructor();
    readonly size: number;
    find(key: k): v | undefined;
    min(): [k, v] | undefined;
    max(): [k, v] | undefined;
    insert(key: k, value: v): OrdMap<k, v>;
    remove(key: k): OrdMap<k, v>;
    foldl<b>(f: (curr: b, next: [k, v]) => b, initial: b): b;
    foldr<b>(f: (curr: b, next: [k, v]) => b, initial: b): b;
    unsafeRemove(key: k): OrdMap<k, v>;
    keys(): Array<k>;
    values(): Array<v>;
    difference(other: OrdMap<k, v>): OrdMap<k, v>;
    toArray(): Array<[k, v]>;
    toJSON(): unknown;
    reverseIterator(): Iterator<[k, v]>;
    [Symbol.iterator](): Iterator<[k, v]>;
}
