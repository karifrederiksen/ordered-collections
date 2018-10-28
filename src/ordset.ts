import * as RBT from "./internal/redblack"
import { DefaultType, compareDefault, Comp, identity } from "./util"
import { ForwardIterator } from "./internal/iterators"

type Config<a> = RBT.Config<a, a, a>

function createConfig<a>(compare: Comp<a, a>): Config<a> {
    return { compare, getValue: identity }
}

export class OrdSet<a> {
    private static empty_<a>(config: Config<a>) {
        return new OrdSet<a>(config, RBT.EMPTY_NODE)
    }

    static empty<a>(compare: Comp<a, a>): OrdSet<a> {
        return this.empty_(createConfig(compare))
    }

    static emptyDefault<a extends DefaultType>(): OrdSet<a> {
        return this.empty(compareDefault)
    }

    static of<a>(value: a, compare: Comp<a, a>): OrdSet<a> {
        return new OrdSet(createConfig(compare), RBT.NonEmptyNode.singleton(value, false))
    }

    static ofDefault<a extends DefaultType>(value: a): OrdSet<a> {
        return this.of(value, compareDefault)
    }

    static from<a>(iterable: Iterable<a>, compare: Comp<a, a>): OrdSet<a> {
        let t = OrdSet.empty<a>(compare)
        for (const val of iterable) {
            t = t.insert(val)
        }
        return t
    }

    static fromDefault<a extends DefaultType>(iterable: Iterable<a>): OrdSet<a> {
        return this.from(iterable, compareDefault)
    }

    private constructor(private readonly config: Config<a>, private readonly root: RBT.Node<a>) {}

    get size(): number {
        return this.root.size
    }

    has(key: a): boolean {
        return this.root.isEmpty() ? false : this.root.get(this.config, key) !== undefined
    }

    min(): a | undefined {
        if (this.root.isEmpty()) return undefined
        return this.root.min()
    }

    max(): a | undefined {
        if (this.root.isEmpty()) return undefined
        return this.root.max()
    }

    insert(value: a): OrdSet<a> {
        return new OrdSet(this.config, this.root.insert(this.config.compare, value))
    }

    remove(key: a): OrdSet<a> {
        return new OrdSet(this.config, this.root.remove(this.config.compare, key))
    }

    union(other: OrdSet<a>): OrdSet<a> {
        let newSet = OrdSet.empty_<a>(this.config)

        for (const val of other) {
            newSet = newSet.insert(val)
        }

        for (const val of this) {
            newSet = newSet.insert(val)
        }

        return newSet
    }

    intersect(other: OrdSet<a>): OrdSet<a> {
        let newSet = OrdSet.empty_<a>(this.config)

        for (const val of this) {
            if (other.has(val)) {
                newSet = newSet.insert(val)
            }
        }

        return newSet
    }

    difference(other: OrdSet<a>): OrdSet<a> {
        let newSet = OrdSet.empty_<a>(this.config)

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

    reverse(): OrdSet<a> {
        const { config } = this
        const reverseConfig: Config<a> = createConfig((l, r) => config.compare(r, l))
        return new OrdSet(reverseConfig, this.root)
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

    [Symbol.iterator](): Iterator<a> {
        if (this.root.isEmpty()) return { next: () => ({ done: true } as IteratorResult<a>) }
        return new ForwardIterator(this.root)
    }
}
