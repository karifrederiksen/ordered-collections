import { Comp } from "./util";
export declare class OrdMap<k, v> {
    private readonly compare;
    private readonly root;
    static empty<k, v>(compare: Comp<k>): OrdMap<k, v>;
    static emptyNumberKeyed<v>(): OrdMap<number, v>;
    static emptyStringKeyed<v>(): OrdMap<string, v>;
    static of<k, v>(key: k, value: v, compare: Comp<k>): OrdMap<k, v>;
    static ofNumberKeyed<v>(key: number, value: v): OrdMap<number, v>;
    static ofStringKeyed<v>(key: string, value: v): OrdMap<string, v>;
    static from<k, v>(iterable: Iterable<[k, v]>, compare: Comp<k>): OrdMap<k, v>;
    static fromNumberKeyed<v>(iterable: Iterable<[number, v]>): OrdMap<number, v>;
    static fromStringKeyed<v>(iterable: Iterable<[string, v]>): OrdMap<string, v>;
    private constructor();
    readonly size: number;
    find(key: k): v | undefined;
    min(): [k, v] | undefined;
    max(): [k, v] | undefined;
    insert(key: k, value: v): OrdMap<k, v>;
    remove(key: k): OrdMap<k, v>;
    keys(): Array<k>;
    values(): Array<v>;
    difference(other: OrdMap<k, v>): OrdMap<k, v>;
    toArray(): Array<[k, v]>;
    toJSON(): unknown;
    reverseIterator(): Iterator<[k, v]>;
    [Symbol.iterator](): Iterator<[k, v]>;
}
