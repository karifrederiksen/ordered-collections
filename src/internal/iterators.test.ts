import { expect } from "chai"
import * as Jsv from "jsverify"

import { ForwardIterator } from "./iterators"
import { EMPTY_NODE, EmptyNode, NonEmptyNode, Node } from "./redblack"
import { compareDefault } from "../util"

function createZeroArray(length: number): ReadonlyArray<number> {
    const arr = new Array(length)
    for (let i = 0; i < arr.length; i++) {
        arr[i] = 0
    }
    return arr
}

function createTree(): EmptyNode<number>
function createTree(...values: Array<number>): NonEmptyNode<number>
function createTree(...values: Array<number>): Node<number> {
    let node: Node<number> = EMPTY_NODE

    for (const val of values) {
        node = node.insert(compareDefault, val, undefined)
    }

    // console.log(values, node)
    return node
}

function toArray<a>(node: NonEmptyNode<a>): ReadonlyArray<a> {
    const arr: Array<a> = []

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

interface Equality<a> {
    readonly asTree: NonEmptyNode<a>
    readonly asArray: ReadonlyArray<a>
}

describe("Iterators", () => {
    describe("ForwardIterator", () => {
        const equalities: ReadonlyArray<Equality<any>> = [
            { asTree: createTree(3), asArray: [3] },
            { asTree: createTree(0, -2, -1), asArray: [-2, -1, 0] },
            { asTree: createTree(3, 2, 1, 4, 5), asArray: [1, 2, 3, 4, 5] },
            (() => {
                const arr = createZeroArray(20000).map(() => Math.random())
                const arrSorted = arr.slice()
                arrSorted.sort(compareDefault)

                return { asTree: createTree(...arr), asArray: arrSorted }
            })(),
        ]

        it("should iterate over the full tree in ascending order", () => {
            for (const { asTree, asArray } of equalities) {
                expect(toArray(asTree)).deep.equals(asArray)
            }
        })
    })
})
