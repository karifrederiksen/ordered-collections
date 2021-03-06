import { expect } from "chai"

import { ForwardIterator, ReverseIterator } from "./iterators"
import { EMPTY_NODE, EmptyNode, NonEmptyNode, Node } from "./redblack"
import { compareNumber, numberLT } from "../util"

function createZeroArray(length: number): readonly number[] {
    const arr = new Array(length)
    for (let i = 0; i < arr.length; i++) {
        arr[i] = 0
    }
    return arr
}

function createTree(): EmptyNode<number>
function createTree(...values: readonly number[]): NonEmptyNode<number>
function createTree(...values: readonly number[]): Node<number> {
    let node: Node<number> = EMPTY_NODE

    for (const val of values) {
        node = node.insert(numberLT, val, undefined)
    }

    return node
}

function forward_toArray<a>(node: NonEmptyNode<a>): a[] {
    const arr: a[] = []

    {
        const iterator = new ForwardIterator(node, x => x.key)
        let res = iterator.next()
        while (!res.done) {
            arr.push(res.value)
            res = iterator.next()
        }
    }

    return arr
}

function reverse_toArray<a>(node: NonEmptyNode<a>): a[] {
    const arr: a[] = []

    {
        const iterator = new ReverseIterator(node, x => x.key)
        let res = iterator.next()
        while (!res.done) {
            arr.push(res.value)
            res = iterator.next()
        }
    }
    return arr
}

interface Equality<a> {
    readonly asTree: NonEmptyNode<a>
    readonly asArray: readonly a[]
}

describe("Iterators", () => {
    const forwardEqualities: readonly Equality<any>[] = [
        { asTree: createTree(3), asArray: [3] },
        { asTree: createTree(0, -2, -1), asArray: [-2, -1, 0] },
        { asTree: createTree(3, 2, 1, 4, 5), asArray: [1, 2, 3, 4, 5] },
        (() => {
            const arr = createZeroArray(20000).map(() => Math.random())
            const arrSorted = arr.slice()
            arrSorted.sort(compareNumber)

            return { asTree: createTree(...arr), asArray: arrSorted }
        })(),
    ]
    describe("ForwardIterator", () => {
        it("should iterate over the full tree in ascending order", () => {
            for (const { asTree, asArray } of forwardEqualities) {
                expect(forward_toArray(asTree)).deep.equals(asArray)
            }
        })
    })

    describe("ReverseIterator", () => {
        it("should iterate over the full tree in descending order", () => {
            for (const { asTree, asArray } of forwardEqualities) {
                const asReverse = asArray.slice().reverse()
                expect(reverse_toArray(asTree)).deep.equals(asReverse)
            }
        })
    })
})
