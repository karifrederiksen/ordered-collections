import * as RBT from "./internal/redblack"
import { DefaultType, compareDefault, Comp } from "./util"
import { ForwardIterator } from "./internal/iterators"

type Config<k, v> = RBT.Config<k, v, [k, v]> & {
    readonly kvpCompare: (a: [k, v], b: [k, v]) => number
    readonly baseCompare: Comp<k, k>
}

function getValue<k, v>(wrapper: [k, v]): v {
    return wrapper[1]
}

function wrapCompare<k, b = any>(compare: Comp<k, k>): (key: k, other: [k, b]) => number {
    return (key, other) => compare(key, other[0])
}

function wrapKvpCompare<a, b = any>(compare: Comp<a, a>): (node: [a, b], other: [a, b]) => number {
    return (node, other) => compare(node[0], other[0])
}

function createConfig<k, v>(compare: Comp<k, k>): Config<k, v> {
    return {
        compare: wrapCompare(compare),
        kvpCompare: wrapKvpCompare(compare),
        getValue,
        baseCompare: compare,
    }
}

export class OrdMap<k, v> {
    private static empty_<k, v>(config: Config<k, v>) {
        return new OrdMap<k, v>(config, RBT.EMPTY_NODE)
    }

    static empty<k, v>(compare: Comp<k, k>): OrdMap<k, v> {
        return this.empty_(createConfig(compare))
    }

    static emptyDefault<k extends DefaultType, v>(): OrdMap<k, v> {
        return this.empty(compareDefault)
    }

    static of<k, v>(key: k, value: v, compare: Comp<k, k>): OrdMap<k, v> {
        return new OrdMap(
            createConfig(compare),
            RBT.NonEmptyNode.singleton([key, value] as [k, v], false),
        )
    }

    static ofDefault<k extends DefaultType, v>(key: k, value: v): OrdMap<k, v> {
        return this.of(key, value, compareDefault)
    }

    static from<k, v>(iterable: Iterable<[k, v]>, compare: Comp<k, k>): OrdMap<k, v> {
        let t = OrdMap.empty<k, v>(compare)
        for (const val of iterable) {
            t = t.insert(val[0], val[1])
        }
        return t
    }

    static fromDefault<k extends DefaultType, v>(iterable: Iterable<[k, v]>): OrdMap<k, v> {
        return this.from(iterable, compareDefault)
    }

    private constructor(
        private readonly config: Config<k, v>,
        private readonly root: RBT.Node<[k, v]>,
    ) {}

    get size(): number {
        return this.root.size
    }

    find(key: k): v | undefined {
        return this.root.isEmpty() ? undefined : this.root.get(this.config, key)
    }

    min(): [k, v] | undefined {
        if (this.root.isEmpty()) return undefined
        return this.root.min()
    }

    max(): [k, v] | undefined {
        if (this.root.isEmpty()) return undefined
        return this.root.max()
    }

    insert(key: k, value: v): OrdMap<k, v> {
        return new OrdMap(this.config, this.root.insert(this.config.kvpCompare, [key, value]))
    }

    remove(key: k): OrdMap<k, v> {
        return new OrdMap(this.config, this.root.remove(this.config.compare, key))
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

    union(other: OrdMap<k, v>): OrdMap<k, v> {
        let newMap = OrdMap.empty_<k, v>(this.config)

        for (const val of other) {
            newMap = newMap.insert(val[0], val[1])
        }

        for (const val of this) {
            newMap = newMap.insert(val[0], val[1])
        }

        return newMap
    }

    intersect(other: OrdMap<k, v>): OrdMap<k, v> {
        let newMap = OrdMap.empty_<k, v>(this.config)

        for (const val of this) {
            if (other.find(val[0]) !== undefined) {
                newMap = newMap.insert(val[0], val[1])
            }
        }

        return newMap
    }

    difference(other: OrdMap<k, v>): OrdMap<k, v> {
        let newMap = OrdMap.empty_<k, v>(this.config)

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

    reverse(): OrdMap<k, v> {
        const { config } = this
        const reverseConfig: Config<k, v> = createConfig((l, r) => config.baseCompare(r, l))
        return new OrdMap(reverseConfig, this.root)
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

    [Symbol.iterator](): Iterator<[k, v]> {
        if (this.root.isEmpty()) return { next: () => ({ done: true } as IteratorResult<[k, v]>) }
        return new ForwardIterator(this.root)
    }
}
