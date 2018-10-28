import { Comp } from "../util"

/*
 * This is mostly a port of the scala RBT
 * https://lampsvn.epfl.ch/trac/scala/browser/scala/tags/R_2_9_0_final/src//library/scala/collection/immutable/RedBlack.scala#L1
 */

export interface Node<k, v = void> {
    size: number
    color: Color
    isNonEmpty(): this is NonEmptyNode<k, v>
    find(compare: Comp<k, k>, key: k): NonEmptyNode<k, v> | undefined
    min(): NonEmptyNode<k, v> | undefined
    max(): NonEmptyNode<k, v> | undefined
    insert(compare: Comp<k, k>, key: k, value: v): NonEmptyNode<k, v>
    remove(compare: Comp<k, k>, key: k): Node<k, v>
}

type NodeUnion<k, v> = EmptyNode<k, v> | NonEmptyNode<k, v>

const enum Color {
    Red,
    Black,
}

export class EmptyNode<k, v = void> implements Node<k, v> {
    get size(): 0 {
        return 0
    }

    get color(): Color.Black {
        return Color.Black
    }

    isNonEmpty(): this is NonEmptyNode<k, v> {
        return false
    }

    find<k, v>(_compare: Comp<k, k>, _key: k): NonEmptyNode<k, v> | undefined {
        return undefined
    }

    min(): undefined {
        return undefined
    }

    max(): undefined {
        return undefined
    }

    insert(_compare: Comp<k, k>, key: k, value: v): NonEmptyNode<k, v> {
        return NonEmptyNode.of(key, value)
    }

    remove(_compare: Comp<k, k>, _key: k): NodeUnion<k, v> {
        return this
    }
}

export const EMPTY_NODE: EmptyNode<any, any> = new EmptyNode()

export class NonEmptyNode<k, v = void> implements Node<k, v> {
    static of<k, v>(key: k, value: v): NonEmptyNode<k, v> {
        return new NonEmptyNode(key, value, EMPTY_NODE, EMPTY_NODE, Color.Red)
    }

    readonly size: number

    constructor(
        readonly key: k,
        readonly value: v,
        readonly left: NodeUnion<k, v>,
        readonly right: NodeUnion<k, v>,
        readonly color: Color,
    ) {
        this.size = left.size + right.size + 1
    }

    isNonEmpty(): this is NonEmptyNode<k, v> {
        return true
    }

    find(compare: Comp<k, k>, key: k): NonEmptyNode<k, v> | undefined {
        let node: NodeUnion<k, v> = this
        while (node.isNonEmpty()) {
            const c = compare(key, node.key)
            if (c < 0) node = node.left
            else if (c > 0) node = node.right
            else return node
        }
        return undefined
    }

    min(): NonEmptyNode<k, v> {
        let node: NonEmptyNode<k, v> = this
        while (node.left.isNonEmpty()) {
            node = node.left
        }
        return node
    }

    max(): NonEmptyNode<k, v> {
        let node: NonEmptyNode<k, v> = this
        while (node.right.isNonEmpty()) {
            node = node.right
        }
        return node
    }

    insert(compare: Comp<k, k>, key: k, value: v): NonEmptyNode<k, v> {
        const c = compare(key, this.key)

        if (c < 0)
            return insert_balanceLeft(
                this.key,
                this.value,
                this.left.insert(compare, key, value),
                this.right,
                this.color,
            )

        if (c > 0)
            return insert_balanceRight(
                this.key,
                this.value,
                this.left,
                this.right.insert(compare, key, value),
                this.color,
            )

        return new NonEmptyNode(key, value, this.left, this.right, this.color)
    }

    remove(compare: Comp<k, k>, key: k): NodeUnion<k, v> {
        const c = compare(key, this.key)

        if (c < 0) {
            return remove_balLeft(this.key, this.value, this.left.remove(compare, key), this
                .right as NonEmptyNode<k, v>)
        }

        if (c > 0) {
            return remove_balRight(
                this.key,
                this.value,
                this.left as NonEmptyNode<k, v>,
                this.right.remove(compare, key),
            )
        }

        return remove_append(this.left, this.right)
    }
}

function blacken<k, v>(node: NonEmptyNode<k, v>): NonEmptyNode<k, v> {
    if (node.color === Color.Red) {
        return new NonEmptyNode(node.key, node.value, node.left, node.right, Color.Black)
    }
    return node
}

function insert_balanceLeft<k, v>(
    z: k,
    zv: v,
    l: NonEmptyNode<k, v>,
    d: NodeUnion<k, v>,
    color: Color,
): NonEmptyNode<k, v> {
    if (l.color === Color.Red && l.left.color === Color.Red) {
        const newLeft = new NonEmptyNode(
            l.left.key,
            l.left.value,
            l.left.left,
            l.left.right,
            Color.Black,
        )
        const newRight = new NonEmptyNode(z, zv, l.right, d, Color.Black)
        return new NonEmptyNode(l.key, l.value, newLeft, newRight, Color.Red)
    }
    if (l.color === Color.Red && l.right.color === Color.Red) {
        const newLeft = new NonEmptyNode(l.key, l.value, l.left, l.right.left, Color.Black)
        const newRight = new NonEmptyNode(z, zv, l.right.right, d, Color.Black)
        return new NonEmptyNode(l.right.key, l.right.value, newLeft, newRight, Color.Red)
    }

    return new NonEmptyNode(z, zv, l, d, color)
}

function insert_balanceRight<k, v>(
    x: k,
    xv: v,
    a: NodeUnion<k, v>,
    r: NonEmptyNode<k, v>,
    color: Color,
): NonEmptyNode<k, v> {
    if (r.color === Color.Red && r.left.color === Color.Red) {
        const newLeft = new NonEmptyNode(x, xv, a, r.left.left, Color.Black)
        const newRight = new NonEmptyNode(r.key, r.value, r.left.right, r.right, Color.Black)
        return new NonEmptyNode(r.left.key, r.left.value, newLeft, newRight, Color.Red)
    }
    if (r.color === Color.Red && r.right.color === Color.Red) {
        const newLeft = new NonEmptyNode(x, xv, a, r.left, Color.Black)
        const newRight = new NonEmptyNode(
            r.right.key,
            r.right.value,
            r.right.left,
            r.right.right,
            Color.Black,
        )
        return new NonEmptyNode(r.key, r.value, newLeft, newRight, Color.Red)
    }

    return new NonEmptyNode(x, xv, a, r, color)
}

function remove_balance<k, v>(
    x: k,
    xv: v,
    tl: NodeUnion<k, v>,
    tr: NodeUnion<k, v>,
): NodeUnion<k, v> {
    if (tl.color === Color.Red && tr.color === Color.Red) {
        return new NonEmptyNode(x, xv, blacken(tl), blacken(tr), Color.Red)
    }

    if (tl.color === Color.Red && tl.left.color === Color.Red) {
        return new NonEmptyNode(
            tl.key,
            tl.value,
            blacken(tl.left),
            new NonEmptyNode(x, xv, tl.left.right, tr, Color.Black),
            Color.Red,
        )
    }

    if (tl.color === Color.Red && tl.right.color === Color.Red) {
        return new NonEmptyNode(
            tl.right.key,
            tl.right.value,
            new NonEmptyNode(tl.key, tl.value, tl.left, tl.right.left, Color.Black),
            new NonEmptyNode(x, xv, tl.right.left, tl.right.right, Color.Black),
            Color.Red,
        )
    }

    if (tr.color === Color.Red && tr.right.color === Color.Red) {
        return new NonEmptyNode(
            tr.key,
            tr.value,
            new NonEmptyNode(x, xv, tl, tr.left, Color.Black),
            blacken(tr.right),
            Color.Red,
        )
    }

    if (tr.color === Color.Red && tr.left.color === Color.Red) {
        return new NonEmptyNode(
            tr.left.key,
            tr.left.value,
            new NonEmptyNode(x, xv, tl, tr.left.left, Color.Black),
            new NonEmptyNode(tr.key, tr.value, tr.left.right, tr.right, Color.Black),
            Color.Red,
        )
    }

    return new NonEmptyNode(x, xv, tl, tr, Color.Black)
}

function remove_subl<k, v>(node: NonEmptyNode<k, v>): NonEmptyNode<k, v> {
    if (node.color === Color.Black) {
        return new NonEmptyNode(node.key, node.value, node.left, node.right, Color.Red)
    }
    throw "Invariance violation. Expected black, got red"
}

function remove_balLeft<k, v>(
    x: k,
    xv: v,
    tl: NodeUnion<k, v>,
    tr: NonEmptyNode<k, v>,
): NodeUnion<k, v> {
    if (tl.color === Color.Red) {
        return new NonEmptyNode(x, xv, blacken(tl), tr, Color.Red)
    }

    if (tr.color === Color.Black) {
        return remove_balance(
            x,
            xv,
            tl,
            new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, Color.Red),
        )
    }

    if (tr.color && !tr.left.color) {
        const rightLeft = tr.left as NonEmptyNode<k, v>
        const rightRight = tr.right as NonEmptyNode<k, v>

        return new NonEmptyNode(
            rightLeft.key,
            rightLeft.value,
            new NonEmptyNode(x, xv, tl, rightLeft.left, Color.Black),
            remove_balance(
                tr.key,
                tr.value,
                rightLeft.right as NonEmptyNode<k, v>,
                remove_subl(rightRight),
            ),
            Color.Red,
        )
    }

    throw "Invariance violation."
}

function remove_balRight<k, v>(
    x: k,
    xv: v,
    tl: NonEmptyNode<k, v>,
    tr: NodeUnion<k, v>,
): NodeUnion<k, v> {
    if (tr.color === Color.Red) {
        return new NonEmptyNode(x, xv, tl, blacken(tr), Color.Red)
    }

    if (tl.color === Color.Black) {
        return remove_balance(x, xv, tl, tr)
    }

    if (tl.color === Color.Red && tl.right.color === Color.Black) {
        const leftLeft = tl.left as NonEmptyNode<k, v>
        const leftRight = tl.right as NonEmptyNode<k, v>

        return new NonEmptyNode(
            leftRight.key,
            leftRight.value,
            remove_balance(tl.key, tl.value, remove_subl(leftLeft), leftRight.left as NonEmptyNode<
                k,
                v
            >),
            new NonEmptyNode(x, xv, leftRight.right, tr, Color.Black),
            Color.Red,
        )
    }

    throw "Invariance violation."
}

function remove_append<k, v>(tl: NodeUnion<k, v>, tr: NodeUnion<k, v>): NodeUnion<k, v> {
    if (!tl.isNonEmpty()) return tr
    if (!tr.isNonEmpty()) return tl

    if (tl.color === Color.Red && tr.color === Color.Red) {
        const res = remove_append(tl.right, tr.left)

        if (res.color === Color.Red) {
            return new NonEmptyNode(
                res.key,
                res.value,
                new NonEmptyNode(tl.key, tl.value, tl.left, res.left, Color.Red),
                new NonEmptyNode(tr.key, tr.value, res.right, tr.right, Color.Red),
                Color.Red,
            )
        }

        return new NonEmptyNode(
            tl.key,
            tl.value,
            tl.left,
            new NonEmptyNode(tr.key, tr.value, res, tr.right, Color.Red),
            Color.Red,
        )
    }

    if (tl.color === Color.Black && tr.color === Color.Black) {
        const res = remove_append(tl.right, tr.left)

        if (res.color === Color.Red) {
            return new NonEmptyNode(
                res.key,
                res.value,
                new NonEmptyNode(tl.key, tl.value, tl.left, res.left, Color.Black),
                new NonEmptyNode(tr.key, tr.value, res.right, tr.right, Color.Black),
                Color.Red,
            )
        }

        return remove_balLeft(
            tl.key,
            tl.value,
            tl.left as NonEmptyNode<k, v>,
            new NonEmptyNode(tr.key, tr.value, res, tr.right, Color.Black),
        )
    }

    if (tr.color === Color.Red) {
        return new NonEmptyNode(tr.key, tr.value, remove_append(tl, tr.left), tr.right, Color.Red)
    }

    return new NonEmptyNode(tl.key, tl.value, tl.left, remove_append(tl.right, tr), Color.Red)
}
