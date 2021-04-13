import * as RBT from "./internal/redblack"
import { LessThan, numberLT, stringLT } from "./util"
import { ForwardIterator, ReverseIterator } from "./internal/iterators"

export class OrdSet<a> {
    static empty<a>(compare: LessThan<a>): OrdSet<a> {
        return new OrdSet<a>(compare, RBT.EMPTY_NODE)
    }

    static of<a>(value: a, compare: LessThan<a>): OrdSet<a> {
        return new OrdSet(compare, RBT.NonEmptyNode.of(value, undefined))
    }

    static from<a>(iterable: Iterable<a>, compare: LessThan<a>): OrdSet<a> {
        let t = OrdSet.empty<a>(compare)
        for (const val of iterable) {
            t = t.insert(val)
        }
        return t
    }

    static readonly number: {
        empty(): OrdSet<number>
        of(val: number): OrdSet<number>
        from(iterable: Iterable<number>): OrdSet<number>
    } = {
        empty() {
            return OrdSet.empty(numberLT)
        },
        of(value: number) {
            return OrdSet.of(value, numberLT)
        },
        from(iterable: Iterable<number>) {
            return OrdSet.from(iterable, numberLT)
        },
    }

    static readonly string: {
        empty(): OrdSet<string>
        of(val: string): OrdSet<string>
        from(iterable: Iterable<string>): OrdSet<string>
    } = {
        empty() {
            return OrdSet.empty(stringLT)
        },
        of(value: string) {
            return OrdSet.of(value, stringLT)
        },
        from(iterable: Iterable<string>) {
            return OrdSet.from(iterable, stringLT)
        },
    }

    private constructor(
        private readonly compare: LessThan<a>,
        private readonly root: RBT.Node<a, void>,
    ) {}

    get size(): number {
        return this.root.size
    }

    has(key: a): boolean {
        return this.root.isNonEmpty() ? this.root.find(this.compare, key) !== undefined : false
    }

    min(): a | undefined {
        const node = this.root.min()
        if (node === undefined) {
            return undefined
        }
        return node.key
    }

    max(): a | undefined {
        const node = this.root.max()
        if (node === undefined) {
            return undefined
        }
        return node.key
    }

    insert(value: a): OrdSet<a> {
        return new OrdSet(this.compare, this.root.insert(this.compare, value, undefined))
    }

    remove(key: a): OrdSet<a> {
        if (this.root.find(this.compare, key) === undefined) {
            return this
        }
        return new OrdSet(this.compare, this.root.remove(this.compare, key))
    }

    foldl<b>(f: (curr: b, next: a) => b, initial: b): b {
        return RBT.foldl(this.root, f, initial)
    }

    foldr<b>(f: (curr: b, next: a) => b, initial: b): b {
        return RBT.foldr(this.root, f, initial)
    }

    union(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        return other.foldl((set, val) => set.insert(val), this as OrdSet<a>)
    }

    intersect(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        return other.foldl(
            (set, val) => (this.has(val) ? set.insert(val) : set),
            OrdSet.empty(this.compare)
        )
    }

    difference(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        return other.foldl(
            (set, val) => set.has(val) ? set.remove(val) : set.insert(val),
            this as OrdSet<a>
        )
    }

    except(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        return other.foldl(
            (set, val) => set.has(val) ? set.remove(val) : set,
            this as OrdSet<a>
        )
    }

    toArray(): a[] {
        return this.foldl(mutablePush, [] as a[])
    }

    toJSON(): unknown {
        return this.toArray()
    }

    reverseIterator(): Iterator<a> {
        return new ReverseIterator(this.root, getKey)
    }

    [Symbol.iterator](): Iterator<a> {
        return new ForwardIterator(this.root, getKey)
    }
}

function getKey<a>(node: RBT.NonEmptyNode<a>): a {
    return node.key
}

function checkComparisonFuncEquality<a>(f1: LessThan<a>, f2: LessThan<a>): void {
    if (process.env.NODE_ENV !== "production") {
        if (f1 !== f2) {
            console.warn(
                "You're merging two sets with different compare functions. This can lead to inconsistent results.\n\nConsider using the same comparison function for both sets.",
            )
        }
    }
}

function mutablePush<a>(arr: a[], val: a): a[] {
    arr.push(val)
    return arr
}