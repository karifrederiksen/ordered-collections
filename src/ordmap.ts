import * as RBT from "./internal/redblack"
import { LessThan, numberLT, stringLT } from "./util"
import { ForwardIterator, EMPTY_ITER, ReverseIterator } from "./internal/iterators"

export class OrdMap<k, v> {
    static empty<k, v>(compare: LessThan<k>): OrdMap<k, v> {
        return new OrdMap(compare, RBT.EMPTY_NODE)
    }

    static emptyNumberKeyed<v>(): OrdMap<number, v> {
        return OrdMap.empty(numberLT)
    }

    static emptyStringKeyed<v>(): OrdMap<string, v> {
        return OrdMap.empty(stringLT)
    }

    static of<k, v>(key: k, value: v, compare: LessThan<k>): OrdMap<k, v> {
        return new OrdMap(compare, RBT.NonEmptyNode.of(key, value))
    }

    static ofNumberKeyed<v>(key: number, value: v): OrdMap<number, v> {
        return OrdMap.of(key, value, numberLT)
    }

    static ofStringKeyed<v>(key: string, value: v): OrdMap<string, v> {
        return OrdMap.of(key, value, stringLT)
    }

    static from<k, v>(iterable: Iterable<[k, v]>, compare: LessThan<k>): OrdMap<k, v> {
        let t = OrdMap.empty<k, v>(compare)
        for (const val of iterable) {
            t = t.insert(val[0], val[1])
        }
        return t
    }

    static fromNumberKeyed<v>(iterable: Iterable<[number, v]>): OrdMap<number, v> {
        return OrdMap.from(iterable, numberLT)
    }

    static fromStringKeyed<v>(iterable: Iterable<[string, v]>): OrdMap<string, v> {
        return OrdMap.from(iterable, stringLT)
    }

    private constructor(
        private readonly compare: LessThan<k>,
        private readonly root: RBT.Node<k, v>,
    ) {}

    get size(): number {
        return this.root.size
    }

    find(key: k): v | undefined {
        const node = this.root.find(this.compare, key)
        return node !== undefined ? node.value : undefined
    }

    min(): [k, v] | undefined {
        const node = this.root.min()
        if (node === undefined) {
            return undefined
        }
        return [node.key, node.value]
    }

    max(): [k, v] | undefined {
        if (this.root.isNonEmpty()) return undefined
        const node = this.root.max()
        if (node === undefined) {
            return undefined
        }
        return [node.key, node.value]
    }

    insert(key: k, value: v): OrdMap<k, v> {
        return new OrdMap(this.compare, this.root.insert(this.compare, key, value))
    }

    remove(key: k): OrdMap<k, v> {
        return new OrdMap(this.compare, this.root.remove(this.compare, key))
    }

    keys(): Array<k> {
        const arr: Array<k> = []
        for (const val of this) {
            arr.push(val[0])
        }
        return arr
    }

    values(): Array<v> {
        const arr: Array<v> = []
        for (const val of this) {
            arr.push(val[1])
        }
        return arr
    }

    difference(other: OrdMap<k, v>): OrdMap<k, v> {
        checkComparisonFuncEquality(this.compare, other.compare)
        let newMap = OrdMap.empty<k, v>(this.compare)

        for (const val of this) {
            if (other.find(val[0]) === undefined) {
                newMap = newMap.insert(val[0], val[1])
            }
        }

        for (const val of other) {
            if (this.find(val[0]) === undefined) {
                newMap = newMap.insert(val[0], val[1])
            }
        }

        return newMap
    }

    toArray(): Array<[k, v]> {
        const arr: Array<[k, v]> = []
        for (const val of this) {
            arr.push(val as [k, v])
        }
        return arr
    }

    toJSON(): unknown {
        return this.toArray()
    }

    reverseIterator(): Iterator<[k, v]> {
        if (!this.root.isNonEmpty()) return EMPTY_ITER
        return new ReverseIterator(this.root, getKvp)
    }

    [Symbol.iterator](): Iterator<[k, v]> {
        if (!this.root.isNonEmpty()) return EMPTY_ITER
        return new ForwardIterator(this.root, getKvp)
    }
}

function getKvp<k, v>(node: RBT.NonEmptyNode<k, v>): [k, v] {
    return [node.key, node.value]
}

function checkComparisonFuncEquality<a>(f1: LessThan<a>, f2: LessThan<a>): void {
    if (process.env.NODE_ENV !== "production") {
        if (f1 !== f2) {
            console.warn(
                "You're merging two maps with different compare functions. This can lead to inconsistent results.\n\nConsider using the same comparison function for both maps.",
            )
        }
    }
}
