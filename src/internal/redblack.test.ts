import { expect } from "chai"
import * as Jsv from "jsverify"

import { Node, EmptyNode, EMPTY_NODE } from "./redblack"
import { compareNumber } from "../util"

function arrToTree(arr: ReadonlyArray<number>): Node<number, void> {
    let node: Node<number, void> = EMPTY_NODE
    for (let i = 0; i < arr.length; i++) {
        node = node.insert(compareNumber, arr[i], undefined)
    }
    return node
}

const treeGen = Jsv.bless({
    generator: Jsv.array(Jsv.number).generator.map(arrToTree),
})

describe("red black tree", () => {
    describe(".isNonEmpty()", () => {
        it("should return false for empty nodes", () => {
            expect(new EmptyNode().isNonEmpty()).equals(false)
            expect(EMPTY_NODE.isNonEmpty()).equals(false)
            expect(
                EMPTY_NODE.insert(compareNumber, 1, undefined)
                    .remove(compareNumber, 1)
                    .isNonEmpty(),
            ).equals(false)
        })
    })

    describe(".insert()", () => {
        it("should return a non-empty array", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                return tree.insert(compareNumber, n, undefined).isNonEmpty() === true
            })
        })

        it("should insert the given value into the tree", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                return tree.insert(compareNumber, n, undefined).find(compareNumber, n) !== undefined
            })
        })
    })

    // describe(".find()", () => {
    //     throw "todo"
    // })

    // describe(".min()", () => {
    //     throw "todo"
    // })

    // describe(".max()", () => {
    //     throw "todo"
    // })

    // describe(".remove()", () => {
    //     throw "todo"
    // })
})
