import { expect } from "chai"
import * as Jsv from "jsverify"

import { Node, EmptyNode, EMPTY_NODE } from "./redblack"
import { compareDefault, DefaultType } from "../util"

function arrToTree<a extends DefaultType>(arr: ReadonlyArray<a>): Node<a, void> {
    let node: Node<a, void> = EMPTY_NODE
    for (let i = 0; i < arr.length; i++) {
        node = node.insert(compareDefault, arr[i], undefined)
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
                EMPTY_NODE.insert(compareDefault, 1, undefined)
                    .remove(compareDefault, 1)
                    .isNonEmpty(),
            ).equals(false)
        })
    })

    describe(".insert()", () => {
        it("should return a non-empty array", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                return tree.insert(compareDefault, n, undefined).isNonEmpty() === true
            })
        })

        it("should insert the given value into the tree", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                return (
                    tree.insert(compareDefault, n, undefined).find(compareDefault, n) !== undefined
                )
            })
        })
    })
})
