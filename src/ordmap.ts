import * as RBT from "./internal/redblack"
import { LessThan, numberLT, stringLT } from "./util"
import { ForwardIterator, ReverseIterator } from "./internal/iterators"

export class OrdMap<k, v> {
    static empty<k, v>(compare: LessThan<k>): OrdMap<k, v> {
        return new OrdMap(compare, RBT.EMPTY_NODE)
    }

    static of<k, v>(key: k, value: v, compare: LessThan<k>): OrdMap<k, v> {
        return new OrdMap(compare, RBT.NonEmptyNode.of(key, value))
    }

    static from<k, v>(iterable: Iterable<readonly [k, v]>, compare: LessThan<k>): OrdMap<k, v> {
        let t = OrdMap.empty<k, v>(compare)
        for (const val of iterable) {
            t = t.insert(val[0], val[1])
        }
        return t
    }

    static readonly number: {
        empty<v>(): OrdMap<number, v>
        of<v>(key: number, value: v): OrdMap<number, v>
        from<v>(iterable: Iterable<readonly [number, v]>): OrdMap<number, v>
    } = {
        empty() {
            return OrdMap.empty(numberLT)
        },
        of<v>(key: number, value: v) {
            return OrdMap.of(key, value, numberLT)
        },
        from<v>(iterable: Iterable<[number, v]>) {
            return OrdMap.from(iterable, numberLT)
        },
    }

    static readonly string: {
        empty<v>(): OrdMap<string, v>
        of<v>(key: string, value: v): OrdMap<string, v>
        from<v>(iterable: Iterable<readonly [string, v]>): OrdMap<string, v>
    } = {
        empty() {
            return OrdMap.empty(stringLT)
        },
        of<v>(key: string, value: v) {
            return OrdMap.of(key, value, stringLT)
        },
        from<v>(iterable: Iterable<[string, v]>) {
            return OrdMap.from(iterable, stringLT)
        },
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
        if (this.root.find(this.compare, key) === undefined) {
            return this
        }
        return this.unsafeRemove(key)
    }

    foldl<b>(f: (curr: b, nextKey: k, _nextVal: v) => b, initial: b): b {
        return RBT.foldl(this.root, f, initial)
    }

    foldr<b>(f: (curr: b, nextKey: k, _nextVal: v) => b, initial: b): b {
        return RBT.foldr(this.root, f, initial)
    }

    unsafeRemove(key: k): OrdMap<k, v> {
        return new OrdMap(this.compare, this.root.remove(this.compare, key))
    }

    keys(): k[] {
        return this.foldl(mutablePushKey, [] as k[])
    }

    values(): v[] {
        return this.foldl(mutablePushValue, [] as v[])
    }

    difference(other: OrdMap<k, v>): OrdMap<k, v> {
        checkComparisonFuncEquality(this.compare, other.compare)
        let newMap = OrdMap.empty<k, v>(this.compare)

        newMap = this.foldl(
            (map, key, val) => (other.find(key) === undefined ? map.insert(key, val) : map),
            newMap,
        )

        newMap = other.foldl(
            (map, key, val) => (this.find(key) === undefined ? map.insert(key, val) : map),
            newMap,
        )

        return newMap
    }

    toArray(): [k, v][] {
        return this.foldl(mutablePushKvp, [] as [k, v][])
    }

    toJSON(): unknown {
        return this.toArray()
    }

    reverseIterator(): Iterator<[k, v]> {
        return new ReverseIterator(this.root, getKvp)
    }

    [Symbol.iterator](): Iterator<[k, v]> {
        return new ForwardIterator(this.root, getKvp)
    }
}

function mutablePushKey<k, v>(arr: k[], nextKey: k, _nextVal: v): k[] {
    arr.push(nextKey)
    return arr
}
function mutablePushValue<k, v>(arr: v[], _nextKey: k, nextVal: v): v[] {
    arr.push(nextVal)
    return arr
}

function mutablePushKvp<k, v>(arr: [k, v][], key: k, val: v): [k, v][] {
    arr.push([key, val])
    return arr
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
