import * as RBT from "./internal/redblack"
import { LessThan, numberLT, stringLT } from "./util"
import { ForwardIterator, EMPTY_ITER, ReverseIterator } from "./internal/iterators"

export class OrdSet<a> {
    static empty<a>(compare: LessThan<a>): OrdSet<a> {
        return new OrdSet<a>(compare, RBT.EMPTY_NODE)
    }

    static emptyNumber(): OrdSet<number> {
        return OrdSet.empty(numberLT)
    }

    static emptyString(): OrdSet<string> {
        return OrdSet.empty(stringLT)
    }

    static of<a>(value: a, compare: LessThan<a>): OrdSet<a> {
        return new OrdSet(compare, RBT.NonEmptyNode.of(value, undefined))
    }

    static ofNumber(value: number): OrdSet<number> {
        return OrdSet.of(value, numberLT)
    }

    static ofString(value: string): OrdSet<string> {
        return OrdSet.of(value, stringLT)
    }

    static from<a>(iterable: Iterable<a>, compare: LessThan<a>): OrdSet<a> {
        let t = OrdSet.empty<a>(compare)
        for (const val of iterable) {
            t = t.insert(val)
        }
        return t
    }

    static fromNumbers(iterable: Iterable<number>): OrdSet<number> {
        return OrdSet.from(iterable, numberLT)
    }

    static fromStrings(iterable: Iterable<string>): OrdSet<string> {
        return OrdSet.from(iterable, stringLT)
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
        return new OrdSet(this.compare, this.root.remove(this.compare, key))
    }

    union(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        let newSet = OrdSet.empty(this.compare)

        for (const val of this) {
            newSet = newSet.insert(val)
        }

        for (const val of other) {
            newSet = newSet.insert(val)
        }

        return newSet
    }

    intersect(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        let newSet = OrdSet.empty(this.compare)

        for (const val of other) {
            if (this.has(val)) {
                newSet = newSet.insert(val)
            }
        }

        return newSet
    }

    difference(other: OrdSet<a>): OrdSet<a> {
        checkComparisonFuncEquality(this.compare, other.compare)
        let newSet = OrdSet.empty(this.compare)

        for (const val of this) {
            if (!other.has(val)) {
                newSet = newSet.insert(val)
            }
        }

        for (const val of other) {
            if (!this.has(val)) {
                newSet = newSet.insert(val)
            }
        }

        return newSet
    }

    toArray(): Array<a> {
        const arr: Array<a> = []
        for (const val of this) {
            arr.push(val)
        }
        return arr
    }

    toJSON(): unknown {
        return this.toArray()
    }

    reverseIterator(): Iterator<a> {
        if (!this.root.isNonEmpty()) return EMPTY_ITER
        return new ReverseIterator(this.root, getKey)
    }

    [Symbol.iterator](): Iterator<a> {
        if (!this.root.isNonEmpty()) return EMPTY_ITER
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
