import { Comp } from "./util"

/*
 * This is mostly a port of the scala RBT
 * https://lampsvn.epfl.ch/trac/scala/browser/scala/tags/R_2_9_0_final/src//library/scala/collection/immutable/RedBlack.scala#L1
 */

export type GetValue<a, b> = (value: a) => b

export interface Config<k, v, n> {
    readonly compare: Comp<k, n>
    readonly getValue: GetValue<n, v>
}

export type Node<a> = EmptyNode<a> | NonEmptyNode<a>

export class EmptyNode<a> {
    get size(): 0 {
        return 0
    }

    get isRed(): false {
        return false
    }

    isEmpty(): this is EmptyNode<a> {
        return true
    }

    get<k, v>(_config: Config<k, v, a>, _value: k): v | undefined {
        return undefined
    }

    min(): undefined {
        return undefined
    }

    max(): undefined {
        return undefined
    }

    insert(_compare: Comp<a, a>, value: a): NonEmptyNode<a> {
        return new NonEmptyNode<a>(value, this, this, true)
    }

    remove<k>(_compare: Comp<k, a>, _value: k): Node<a> {
        return this
    }
}

export const EMPTY_NODE: EmptyNode<any> = new EmptyNode()

export class NonEmptyNode<a> {
    static singleton<a>(value: a, isRed: boolean): NonEmptyNode<a> {
        return new NonEmptyNode(value, EMPTY_NODE, EMPTY_NODE, isRed)
    }

    static red<a>(value: a, left: Node<a>, right: Node<a>): NonEmptyNode<a> {
        return new NonEmptyNode(value, left, right, true)
    }

    static black<a>(value: a, left: Node<a>, right: Node<a>): NonEmptyNode<a> {
        return new NonEmptyNode(value, left, right, false)
    }

    readonly size: number

    constructor(
        readonly value: a,
        readonly left: Node<a>,
        readonly right: Node<a>,
        readonly isRed: boolean,
    ) {
        this.size = left.size + right.size + 1
    }

    isEmpty(): this is EmptyNode<a> {
        return false
    }

    get<k, v>(config: Config<k, v, a>, value: k): v | undefined {
        let node: Node<a> = this
        while (!node.isEmpty()) {
            const c = config.compare(value, node.value)
            if (c < 0) node = node.left
            else if (c > 0) node = node.right
            else return config.getValue(node.value)
        }
        return undefined
    }

    min(): a {
        let node: NonEmptyNode<a> = this
        while (!node.left.isEmpty()) {
            node = node.left
        }
        return node.value
    }

    max(): a {
        let node: NonEmptyNode<a> = this
        while (!node.right.isEmpty()) {
            node = node.right
        }
        return node.value
    }

    insert(compare: Comp<a, a>, value: a): NonEmptyNode<a> {
        const c = compare(value, this.value)
        if (c < 0)
            return balanceLeft(this.value, this.left.insert(compare, value), this.right, this.isRed)

        if (c > 0)
            return balanceRight(
                this.value,
                this.left,
                this.right.insert(compare, value),
                this.isRed,
            )
        return new NonEmptyNode(value, this.left, this.right, this.isRed)
    }

    remove<k>(compare: Comp<k, a>, key: k): Node<a> {
        const c = compare(key, this.value)

        if (c < 0) {
            if (this.left.isRed) {
                return NonEmptyNode.red(this.value, this.left.remove(compare, key), this.right)
            }
            return balLeft(this.value, this.left.remove(compare, key), this.right as NonEmptyNode<
                a
            >)
        }
        if (c > 0) {
            if (this.right.isRed) {
                return NonEmptyNode.red(this.value, this.left, this.right.remove(compare, key))
            }

            return balRight(
                this.value,
                this.left as NonEmptyNode<a>,
                this.right.remove(compare, key),
            )
        }

        return append(this.left, this.right)
    }

    blacken(): NonEmptyNode<a> {
        if (!this.isRed) return this
        return new NonEmptyNode(this.value, this.left, this.right, false)
    }
}

function balanceLeft<a>(z: a, l: NonEmptyNode<a>, d: Node<a>, isRed: boolean): NonEmptyNode<a> {
    if (l.isRed) {
        if (l.left.isRed) {
            const newLeft = NonEmptyNode.black(l.left.value, l.left.left, l.left.right)
            const newRight = NonEmptyNode.black(z, l.right, d)
            return NonEmptyNode.red(l.value, newLeft, newRight)
        }
        if (l.right.isRed) {
            const newLeft = NonEmptyNode.black(l.value, l.left, l.right.left)
            const newRight = NonEmptyNode.black(z, l.right.right, d)
            return NonEmptyNode.red(l.value, newLeft, newRight)
        }
    }

    return new NonEmptyNode(z, l, d, isRed)
}

function balanceRight<v>(x: v, a: Node<v>, r: NonEmptyNode<v>, isRed: boolean): NonEmptyNode<v> {
    if (r.isRed) {
        if (r.left.isRed) {
            const newLeft = NonEmptyNode.black(x, a, r.left.left)
            const newRight = NonEmptyNode.black(r.value, r.left.right, r.right)
            return NonEmptyNode.red(r.left.value, newLeft, newRight)
        }
        if (r.right.isRed) {
            const newLeft = NonEmptyNode.black(x, a, r.left)
            const newRight = NonEmptyNode.black(r.right.value, r.right.left, r.right.right)
            return NonEmptyNode.red(r.value, newLeft, newRight)
        }
    }

    return new NonEmptyNode(x, a, r, isRed)
}

function balance<v>(x: v, tl: Node<v>, tr: Node<v>): Node<v> {
    if (tl.isRed && tr.isRed) {
        return NonEmptyNode.red(x, tl.blacken(), tr.blacken())
    }

    if (tl.isRed && tl.left.isRed) {
        return NonEmptyNode.red(
            tl.value,
            tl.left.blacken(),
            NonEmptyNode.black(x, tl.left.right, tr),
        )
    }

    if (tl.isRed && tl.right.isRed) {
        return NonEmptyNode.red(
            tl.right.value,
            NonEmptyNode.black(tl.value, tl.left, tl.right.left),
            NonEmptyNode.black(x, tl.right.left, tl.right.right),
        )
    }

    if (tr.isRed && tr.right.isRed) {
        return NonEmptyNode.red(tr.value, NonEmptyNode.black(x, tl, tr.left), tr.right.blacken())
    }

    if (tr.isRed && tr.left.isRed) {
        return NonEmptyNode.red(
            tr.left.value,
            NonEmptyNode.black(x, tl, tr.left.left),
            NonEmptyNode.black(tr.value, tr.left.right, tr.right),
        )
    }

    return NonEmptyNode.black(x, tl, tr)
}

function subl<v>(node: NonEmptyNode<v>): NonEmptyNode<v> {
    if (!node.isRed) return NonEmptyNode.red(node.value, node.left, node.right)
    throw "Invariance violation. Expected black, got red"
}

function balLeft<v>(x: v, tl: Node<v>, tr: NonEmptyNode<v>): Node<v> {
    if (tl.isRed) {
        return NonEmptyNode.red(x, tl.blacken(), tr)
    }

    if (!tr.isRed) {
        return balance(x, tl, NonEmptyNode.red(tr.value, tr.left, tr.right))
    }

    if (tr.isRed && !tr.left.isRed) {
        const rightLeft = tr.left as NonEmptyNode<v>
        const rightRight = tr.right as NonEmptyNode<v>
        return NonEmptyNode.red(
            rightLeft.value,
            NonEmptyNode.black(x, tl, rightLeft.left),
            balance(tr.value, rightLeft.right as NonEmptyNode<v>, subl(rightRight)),
        )
    }

    throw "Invariance violation."
}

function balRight<v>(x: v, tl: NonEmptyNode<v>, tr: Node<v>): Node<v> {
    if (tr.isRed) {
        return NonEmptyNode.red(x, tl, tr.blacken())
    }

    if (!tl.isRed) {
        return balance(x, tl, tr)
    }

    if (tl.isRed && !tl.right.isRed) {
        const leftLeft = tl.left as NonEmptyNode<v>
        const leftRight = tl.right as NonEmptyNode<v>

        return NonEmptyNode.red(
            leftRight.value,
            balance(tl.value, subl(leftLeft), leftRight.left as NonEmptyNode<v>),
            NonEmptyNode.black(x, leftRight.right, tr),
        )
    }

    throw "Invariance violation."
}

function append<v>(tl: Node<v>, tr: Node<v>): Node<v> {
    if (tl.isEmpty()) return tr
    if (tr.isEmpty()) return tl

    if (tl.isRed && tr.isRed) {
        const res = append(tl.right, tr.left)

        if (res.isRed) {
            return NonEmptyNode.red(
                res.value,
                NonEmptyNode.red(tl.value, tl.left, res.left),
                NonEmptyNode.red(tr.value, res.right, tr.right),
            )
        }

        return NonEmptyNode.red(tl.value, tl.left, NonEmptyNode.red(tr.value, res, tr.right))
    }

    if (!tl.isRed && !tr.isRed) {
        const res = append(tl.right, tr.left)

        if (res.isRed) {
            return NonEmptyNode.red(
                res.value,
                NonEmptyNode.black(tl.value, tl.left, res.left),
                NonEmptyNode.black(tr.value, res.right, tr.right),
            )
        }
        return balLeft(
            tl.value,
            tl.left as NonEmptyNode<v>,
            NonEmptyNode.black(tr.value, res, tr.right),
        )
    }

    if (tr.isRed) {
        return NonEmptyNode.red(tr.value, append(tl, tr.left), tr.right)
    }

    return NonEmptyNode.red(tl.value, tl.left, append(tl.right, tr))
}
