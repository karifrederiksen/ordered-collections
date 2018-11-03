import { LessThan } from "../util"
import { ForwardIterator } from "./iterators"

/*
 * This is mostly a port of the scala RBT
 * https://github.com/scala/scala/blob/6296e324485f1d457e561824a3a8ddcafc3a08d8/src/library/scala/collection/immutable/RedBlackTree.scala
 */

export interface Node<k, v = void> {
    size: number
    color: Color
    isNonEmpty(): this is NonEmptyNode<k, v>
    find(compare: LessThan<k>, key: k): NonEmptyNode<k, v> | undefined
    min(): NonEmptyNode<k, v> | undefined
    max(): NonEmptyNode<k, v> | undefined
    insert(compare: LessThan<k>, key: k, value: v): NonEmptyNode<k, v>
    remove(compare: LessThan<k>, key: k): Node<k, v>
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

    asBlack(): EmptyNode<k, v> {
        return this
    }

    isNonEmpty(): this is NonEmptyNode<k, v> {
        return false
    }

    find(_compare: LessThan<k>, _key: k): NonEmptyNode<k, v> | undefined {
        return undefined
    }

    min(): undefined {
        return undefined
    }

    max(): undefined {
        return undefined
    }

    insert(compare: LessThan<k>, key: k, value: v): NonEmptyNode<k, v> {
        return this.ins(compare, key, value)
    }

    ins(_compare: LessThan<k>, key: k, value: v): NonEmptyNode<k, v> {
        return NonEmptyNode.of(key, value)
    }

    remove(_compare: LessThan<k>, _key: k): NodeUnion<k, v> {
        return this
    }

    rem(_compare: LessThan<k>, _key: k): NodeUnion<k, v> {
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

    asBlack(): NonEmptyNode<k, v> {
        if (this.color === Color.Black) {
            return this
        } else {
            return new NonEmptyNode(this.key, this.value, this.left, this.right, Color.Black)
        }
    }

    isNonEmpty(): this is NonEmptyNode<k, v> {
        return true
    }

    find(compare: LessThan<k>, key: k): NonEmptyNode<k, v> | undefined {
        let node: NodeUnion<k, v> = this
        while (node.isNonEmpty()) {
            if (compare(key, node.key)) node = node.left
            else if (compare(node.key, key)) node = node.right
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

    insert(compare: LessThan<k>, key: k, value: v): NonEmptyNode<k, v> {
        return this.ins(compare, key, value).asBlack()
    }

    ins(compare: LessThan<k>, key: k, value: v): NonEmptyNode<k, v> {
        if (compare(key, this.key)) {
            return balanceLeft(
                this.key,
                this.value,
                this.left.ins(compare, key, value),
                this.right,
                this.color,
            )
        }
        if (compare(this.key, key)) {
            return balanceRight(
                this.key,
                this.value,
                this.left,
                this.right.ins(compare, key, value),
                this.color,
            )
        }
        return new NonEmptyNode(key, value, this.left, this.right, this.color)
    }

    remove(compare: LessThan<k>, key: k): NodeUnion<k, v> {
        return this.rem(compare, key).asBlack()
    }

    rem(compare: LessThan<k>, key: k): NodeUnion<k, v> {
        if (compare(key, this.key)) {
            if (this.left.color === Color.Black) {
                return balLeft<k, v>(this.key, this.value, this.left.rem(compare, key), this
                    .right as NonEmptyNode<k, v>)
            }
            return new NonEmptyNode(
                this.key,
                this.value,
                this.left.rem(compare, key),
                this.right,
                Color.Red,
            )
        }

        if (compare(this.key, key)) {
            if (this.right.color === Color.Black) {
                return balRight(
                    this.key,
                    this.value,
                    this.left as NonEmptyNode<k, v>,
                    this.right.rem(compare, key),
                )
            }
            return new NonEmptyNode(
                this.key,
                this.value,
                this.left,
                this.right.rem(compare, key),
                Color.Red,
            )
        }

        return append(this.left, this.right)
    }
}

if (process.env.NODE_ENV !== "production") {
    ;(EmptyNode.prototype as any).toJSON = function() {
        return {}
    }
    ;(NonEmptyNode.prototype as any).toJSON = function() {
        return {
            color: this.color === Color.Black ? "Black" : "Red",
            key: this.key,
            value: this.value,
            left: this.left,
            right: this.right,
        }
    }
}

function balance<k, v>(x: k, xv: v, tl: NodeUnion<k, v>, tr: NodeUnion<k, v>): NodeUnion<k, v> {
    if (tl.color === Color.Red) {
        if (tr.color === Color.Red) {
            return new NonEmptyNode(
                x,
                xv,
                new NonEmptyNode(tl.key, tl.value, tl.left, tl.right, Color.Black),
                new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, Color.Black),
                Color.Red,
            )
        }
        if (tl.left.color === Color.Red) {
            return new NonEmptyNode(
                tl.key,
                tl.value,
                new NonEmptyNode(
                    tl.left.key,
                    tl.left.value,
                    tl.left.left,
                    tl.left.right,
                    Color.Black,
                ),
                new NonEmptyNode(x, xv, tl.right, tr, Color.Black),
                Color.Red,
            )
        }
        if (tl.right.color === Color.Red) {
            return new NonEmptyNode(
                tl.right.key,
                tl.right.value,
                new NonEmptyNode(tl.key, tl.value, tl.left, tl.right.left, Color.Black),
                new NonEmptyNode(x, xv, tl.right.right, tr, Color.Black),
                Color.Red,
            )
        }
    } else if (tr.color === Color.Red) {
        if (tr.right.color === Color.Red) {
            return new NonEmptyNode(
                tr.key,
                tr.value,
                new NonEmptyNode(x, xv, tl, tr.left, Color.Black),
                new NonEmptyNode(
                    tr.right.key,
                    tr.right.value,
                    tr.right.left,
                    tr.right.right,
                    Color.Black,
                ),
                Color.Red,
            )
        }
        if (tr.left.color === Color.Red) {
            return new NonEmptyNode(
                tr.left.key,
                tr.left.value,
                new NonEmptyNode(x, xv, tl, tr.left.left, Color.Black),
                new NonEmptyNode(tr.key, tr.value, tr.left.right, tr.right, Color.Black),
                Color.Red,
            )
        }
    }
    return new NonEmptyNode(x, xv, tl, tr, Color.Black)
}

function subl<k, v>(t: NodeUnion<k, v>): NonEmptyNode<k, v> {
    if (t.color === Color.Black) {
        const t_ = t as NonEmptyNode<k, v>
        return new NonEmptyNode(t_.key, t_.value, t_.left, t_.right, Color.Red)
    }
    throw "Defect: invariance violation; expected black, got red node: " + t
}

function balLeft<k, v>(x: k, xv: v, tl: NodeUnion<k, v>, tr: NonEmptyNode<k, v>): NodeUnion<k, v> {
    if (tl.color === Color.Red) {
        return new NonEmptyNode(
            x,
            xv,
            new NonEmptyNode(tl.key, tl.value, tl.left, tl.right, Color.Black),
            tr,
            Color.Red,
        )
    }
    if (tr.color === Color.Black) {
        return balance(x, xv, tl, new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, Color.Red))
    }
    if (tr.color === Color.Red && tr.left.color === Color.Black) {
        const trLeft = tr.left as NonEmptyNode<k, v>

        return new NonEmptyNode(
            trLeft.key,
            trLeft.value,
            new NonEmptyNode(x, xv, tl, trLeft.left, Color.Black),
            balance(tr.key, tr.value, trLeft.right, subl(tr.right)),
            Color.Red,
        )
    }

    throw "Defect: invariance violation in balLeft"
}

function balRight<k, v>(x: k, xv: v, tl: NonEmptyNode<k, v>, tr: NodeUnion<k, v>): NodeUnion<k, v> {
    if (tr.color === Color.Red) {
        return new NonEmptyNode(
            x,
            xv,
            tl,
            new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, Color.Black),
            Color.Red,
        )
    }
    if (tl.color === Color.Black) {
        return balance(x, xv, new NonEmptyNode(tl.key, tl.value, tl.left, tl.right, Color.Red), tr)
    }
    if (tl.color === Color.Red && tl.right.color === Color.Black) {
        const tlRight = tl.right as NonEmptyNode<k, v>

        return new NonEmptyNode(
            tlRight.key,
            tlRight.value,
            balance(tl.key, tl.value, subl(tl.left), tlRight.left),
            new NonEmptyNode(x, xv, tlRight.right, tr, Color.Black),
            Color.Red,
        )
    }

    throw "Defect: invariance violation in balRight"
}

function append<k, v>(tl: NodeUnion<k, v>, tr: NodeUnion<k, v>): NodeUnion<k, v> {
    if (!tl.isNonEmpty()) {
        return tr
    }
    if (!tr.isNonEmpty()) {
        return tl
    }
    if (tl.color === Color.Red && tr.color === Color.Red) {
        const bc = append(tl.right, tr.left)
        if (bc.color === Color.Red) {
            return new NonEmptyNode(
                bc.key,
                bc.value,
                new NonEmptyNode(tl.key, tl.value, tl.left, bc.left, Color.Red),
                new NonEmptyNode(tr.key, tr.value, bc.right, tr.right, Color.Red),
                Color.Red,
            )
        }
        return new NonEmptyNode(
            tl.key,
            tl.value,
            tl.left,
            new NonEmptyNode(tr.key, tr.value, bc, tr.right, Color.Red),
            Color.Red,
        )
    }
    if (tl.color === Color.Black && tr.color === Color.Black) {
        const bc = append(tl.right, tr.left)
        if (bc.color === Color.Red) {
            return new NonEmptyNode(
                bc.key,
                bc.value,
                new NonEmptyNode(tl.key, tl.value, tl.left, bc.left, Color.Black),
                new NonEmptyNode(tr.key, tr.value, bc.right, tr.right, Color.Black),
                Color.Red,
            )
        }
        return balLeft(
            tl.key,
            tl.value,
            tl.left,
            new NonEmptyNode(tr.key, tr.value, bc, tr.right, Color.Black),
        )
    }
    if (tr.color === Color.Red) {
        return new NonEmptyNode(tr.key, tr.value, append(tl, tr.left), tr.right, Color.Red)
    }
    if (tl.color === Color.Red) {
        return new NonEmptyNode(tl.key, tl.value, tl.left, append(tl.right, tr), Color.Red)
    }
    throw "unmatched tree on append: " + JSON.stringify(tl) + ", " + JSON.stringify(tr)
}

function balanceLeft<k, v>(
    z: k,
    zv: v,
    l: NonEmptyNode<k, v>,
    d: NodeUnion<k, v>,
    color: Color,
): NonEmptyNode<k, v> {
    if (l.color === Color.Red && l.left.color === Color.Red) {
        return new NonEmptyNode(
            l.key,
            l.value,
            new NonEmptyNode(l.left.key, l.left.value, l.left.left, l.left.right, Color.Black),
            new NonEmptyNode(z, zv, l.right, d, Color.Black),
            Color.Red,
        )
    }

    if (l.color === Color.Red && l.right.color === Color.Red) {
        return new NonEmptyNode(
            l.right.key,
            l.right.value,
            new NonEmptyNode(l.key, l.value, l.left, l.right.left, Color.Black),
            new NonEmptyNode(z, zv, l.right.right, d, Color.Black),
            Color.Red,
        )
    }

    return new NonEmptyNode(z, zv, l, d, color)
}

function balanceRight<k, v>(
    x: k,
    xv: v,
    a: NodeUnion<k, v>,
    r: NonEmptyNode<k, v>,
    color: Color,
): NonEmptyNode<k, v> {
    if (r.color === Color.Red && r.left.color === Color.Red) {
        return new NonEmptyNode(
            r.left.key,
            r.left.value,
            new NonEmptyNode(x, xv, a, r.left.left, Color.Black),
            new NonEmptyNode(r.key, r.value, r.left.right, r.right, Color.Black),
            Color.Red,
        )
    }
    if (r.color === Color.Red && r.right.color === Color.Red) {
        return new NonEmptyNode(
            r.key,
            r.value,
            new NonEmptyNode(x, xv, a, r.left, Color.Black),
            new NonEmptyNode(r.right.key, r.right.value, r.right.left, r.right.right, Color.Black),
            Color.Red,
        )
    }

    return new NonEmptyNode(x, xv, a, r, color)
}

//

// Development utlity

export function checkInvariants<a extends NodeUnion<unknown, unknown>>(tree_: a): void {
    if (process.env.NODE_ENV === "production") {
        return
    }

    const tree: NodeUnion<unknown, unknown> = tree_
    const errors: PushArray<string> = []

    if (tree.isNonEmpty()) {
        const iter = new ForwardIterator(tree, x => x)
        let res = iter.next()
        while (!res.done) {
            checkRedParentInvariant(res.value, errors)
            res = iter.next()
        }
        checkPathBlackCountInvariant(tree, errors)
    }

    if (errors.length > 0) {
        throw JSON.stringify({ errors: errors, node: tree }, undefined, 2)
    }
}

interface PushArray<a> extends ReadonlyArray<a> {
    push(val: a): unknown
}

function checkRedParentInvariant(
    tree: NodeUnion<unknown, unknown>,
    errors: PushArray<string>,
): void {
    // if a node is red, then both its children should be black
    if (tree.color === Color.Red) {
        if (tree.left.color !== Color.Black) {
            errors.push("Left child of a red node should be black")
        }
        if (tree.right.color !== Color.Black) {
            errors.push("Right child of a red node should be black")
        }
    }
}

function checkPathBlackCountInvariant(
    tree: NonEmptyNode<unknown, unknown>,
    errors: PushArray<string>,
): void {
    // every path from a given node to any of its descendant Empty nodes should contain the same number of black nodes
    const blackCounts: PushArray<number> = []
    traverse(tree, blackCounts, 0)

    const distinctBlacks = new Set(blackCounts)

    if (distinctBlacks.size !== 1) {
        errors.push(
            `Every path to an Empty node should have the same number of black nodes in between. 
            Found ${distinctBlacks.size} paths lengths.`,
        )
    }
}

function traverse(
    tree: NodeUnion<unknown, unknown>,
    arr: PushArray<number>,
    blackCount: number,
): void {
    if (!tree.isNonEmpty()) {
        arr.push(blackCount)
        return
    }

    if (tree.color === Color.Black) {
        blackCount += 1
    }

    traverse(tree.left, arr, blackCount)
    traverse(tree.right, arr, blackCount)
}
