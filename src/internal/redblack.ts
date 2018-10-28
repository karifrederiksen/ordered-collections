import { Comp } from "../util"

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

const enum Color {
    Red,
    Black,
}

export class EmptyNode<a> {
    get size(): 0 {
        return 0
    }

    get color(): Color.Black {
        return Color.Black
    }

    isEmpty(): this is EmptyNode<a> {
        return true
    }

    find<k, v>(_config: Config<k, v, a>, _value: k): v | undefined {
        return undefined
    }

    min(): undefined {
        return undefined
    }

    max(): undefined {
        return undefined
    }

    insert(_compare: Comp<a, a>, value: a): NonEmptyNode<a> {
        return NonEmptyNode.of(value)
    }

    remove<k>(_compare: Comp<k, a>, _value: k): Node<a> {
        return this
    }
}

export const EMPTY_NODE: EmptyNode<any> = new EmptyNode()

export class NonEmptyNode<a> {
    static of<a>(value: a): NonEmptyNode<a> {
        return new NonEmptyNode(value, EMPTY_NODE, EMPTY_NODE, Color.Red)
    }

    readonly size: number

    constructor(
        readonly value: a,
        readonly left: Node<a>,
        readonly right: Node<a>,
        readonly color: Color,
    ) {
        this.size = left.size + right.size + 1
    }

    isEmpty(): this is EmptyNode<a> {
        return false
    }

    find<k, v>(config: Config<k, v, a>, value: k): v | undefined {
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
            return insert_balanceLeft(
                this.value,
                this.left.insert(compare, value),
                this.right,
                this.color,
            )

        if (c > 0)
            return insert_balanceRight(
                this.value,
                this.left,
                this.right.insert(compare, value),
                this.color,
            )

        return new NonEmptyNode(value, this.left, this.right, this.color)
    }

    remove<k>(compare: Comp<k, a>, key: k): Node<a> {
        const c = compare(key, this.value)

        if (c < 0) {
            return remove_balLeft(this.value, this.left.remove(compare, key), this
                .right as NonEmptyNode<a>)
        }

        if (c > 0) {
            return remove_balRight(
                this.value,
                this.left as NonEmptyNode<a>,
                this.right.remove(compare, key),
            )
        }

        return remove_append(this.left, this.right)
    }
}

function blacken<a>(node: NonEmptyNode<a>): NonEmptyNode<a> {
    if (node.color === Color.Red) {
        return new NonEmptyNode(node.value, node.left, node.right, Color.Black)
    }
    return node
}

function insert_balanceLeft<a>(
    z: a,
    l: NonEmptyNode<a>,
    d: Node<a>,
    color: Color,
): NonEmptyNode<a> {
    if (l.color === Color.Red && l.left.color === Color.Red) {
        const newLeft = new NonEmptyNode(l.left.value, l.left.left, l.left.right, Color.Black)
        const newRight = new NonEmptyNode(z, l.right, d, Color.Black)
        return new NonEmptyNode(l.value, newLeft, newRight, Color.Red)
    }
    if (l.color === Color.Red && l.right.color === Color.Red) {
        const newLeft = new NonEmptyNode(l.value, l.left, l.right.left, Color.Black)
        const newRight = new NonEmptyNode(z, l.right.right, d, Color.Black)
        return new NonEmptyNode(l.right.value, newLeft, newRight, Color.Red)
    }

    return new NonEmptyNode(z, l, d, color)
}

function insert_balanceRight<v>(
    x: v,
    a: Node<v>,
    r: NonEmptyNode<v>,
    color: Color,
): NonEmptyNode<v> {
    if (r.color === Color.Red && r.left.color === Color.Red) {
        const newLeft = new NonEmptyNode(x, a, r.left.left, Color.Black)
        const newRight = new NonEmptyNode(r.value, r.left.right, r.right, Color.Black)
        return new NonEmptyNode(r.left.value, newLeft, newRight, Color.Red)
    }
    if (r.color === Color.Red && r.right.color === Color.Red) {
        const newLeft = new NonEmptyNode(x, a, r.left, Color.Black)
        const newRight = new NonEmptyNode(r.right.value, r.right.left, r.right.right, Color.Black)
        return new NonEmptyNode(r.value, newLeft, newRight, Color.Red)
    }

    return new NonEmptyNode(x, a, r, color)
}

function remove_balance<v>(x: v, tl: Node<v>, tr: Node<v>): Node<v> {
    if (tl.color === Color.Red && tr.color === Color.Red) {
        return new NonEmptyNode(x, blacken(tl), blacken(tr), Color.Red)
    }

    if (tl.color === Color.Red && tl.left.color === Color.Red) {
        return new NonEmptyNode(
            tl.value,
            blacken(tl.left),
            new NonEmptyNode(x, tl.left.right, tr, Color.Black),
            Color.Red,
        )
    }

    if (tl.color === Color.Red && tl.right.color === Color.Red) {
        return new NonEmptyNode(
            tl.right.value,
            new NonEmptyNode(tl.value, tl.left, tl.right.left, Color.Black),
            new NonEmptyNode(x, tl.right.left, tl.right.right, Color.Black),
            Color.Red,
        )
    }

    if (tr.color === Color.Red && tr.right.color === Color.Red) {
        return new NonEmptyNode(
            tr.value,
            new NonEmptyNode(x, tl, tr.left, Color.Black),
            blacken(tr.right),
            Color.Red,
        )
    }

    if (tr.color === Color.Red && tr.left.color === Color.Red) {
        return new NonEmptyNode(
            tr.left.value,
            new NonEmptyNode(x, tl, tr.left.left, Color.Black),
            new NonEmptyNode(tr.value, tr.left.right, tr.right, Color.Black),
            Color.Red,
        )
    }

    return new NonEmptyNode(x, tl, tr, Color.Black)
}

function remove_subl<v>(node: NonEmptyNode<v>): NonEmptyNode<v> {
    if (node.color === Color.Black) {
        return new NonEmptyNode(node.value, node.left, node.right, Color.Red)
    }
    throw "Invariance violation. Expected black, got red"
}

function remove_balLeft<v>(x: v, tl: Node<v>, tr: NonEmptyNode<v>): Node<v> {
    if (tl.color === Color.Red) {
        return new NonEmptyNode(x, blacken(tl), tr, Color.Red)
    }

    if (tr.color === Color.Black) {
        return remove_balance(x, tl, new NonEmptyNode(tr.value, tr.left, tr.right, Color.Red))
    }

    if (tr.color && !tr.left.color) {
        const rightLeft = tr.left as NonEmptyNode<v>
        const rightRight = tr.right as NonEmptyNode<v>

        return new NonEmptyNode(
            rightLeft.value,
            new NonEmptyNode(x, tl, rightLeft.left, Color.Black),
            remove_balance(tr.value, rightLeft.right as NonEmptyNode<v>, remove_subl(rightRight)),
            Color.Red,
        )
    }

    throw "Invariance violation."
}

function remove_balRight<v>(x: v, tl: NonEmptyNode<v>, tr: Node<v>): Node<v> {
    if (tr.color === Color.Red) {
        return new NonEmptyNode(x, tl, blacken(tr), Color.Red)
    }

    if (tl.color === Color.Black) {
        return remove_balance(x, tl, tr)
    }

    if (tl.color === Color.Red && tl.right.color === Color.Black) {
        const leftLeft = tl.left as NonEmptyNode<v>
        const leftRight = tl.right as NonEmptyNode<v>

        return new NonEmptyNode(
            leftRight.value,
            remove_balance(tl.value, remove_subl(leftLeft), leftRight.left as NonEmptyNode<v>),
            new NonEmptyNode(x, leftRight.right, tr, Color.Black),
            Color.Red,
        )
    }

    throw "Invariance violation."
}

function remove_append<v>(tl: Node<v>, tr: Node<v>): Node<v> {
    if (tl.isEmpty()) return tr
    if (tr.isEmpty()) return tl

    if (tl.color === Color.Red && tr.color === Color.Red) {
        const res = remove_append(tl.right, tr.left)

        if (res.color === Color.Red) {
            return new NonEmptyNode(
                res.value,
                new NonEmptyNode(tl.value, tl.left, res.left, Color.Red),
                new NonEmptyNode(tr.value, res.right, tr.right, Color.Red),
                Color.Red,
            )
        }

        return new NonEmptyNode(
            tl.value,
            tl.left,
            new NonEmptyNode(tr.value, res, tr.right, Color.Red),
            Color.Red,
        )
    }

    if (tl.color === Color.Black && tr.color === Color.Black) {
        const res = remove_append(tl.right, tr.left)

        if (res.color === Color.Red) {
            return new NonEmptyNode(
                res.value,
                new NonEmptyNode(tl.value, tl.left, res.left, Color.Black),
                new NonEmptyNode(tr.value, res.right, tr.right, Color.Black),
                Color.Red,
            )
        }

        return remove_balLeft(
            tl.value,
            tl.left as NonEmptyNode<v>,
            new NonEmptyNode(tr.value, res, tr.right, Color.Black),
        )
    }

    if (tr.color === Color.Red) {
        return new NonEmptyNode(tr.value, remove_append(tl, tr.left), tr.right, Color.Red)
    }

    return new NonEmptyNode(tl.value, tl.left, remove_append(tl.right, tr), Color.Red)
}
