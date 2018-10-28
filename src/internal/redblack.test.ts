import { expect } from "chai"
import * as Jsv from "jsverify"

import { Node, EmptyNode, EMPTY_NODE, Config } from "./redblack"
import { compareDefault, DefaultType, identity } from "../util"

const treeConfig: Config<DefaultType, DefaultType, DefaultType> = {
    compare: compareDefault,
    getValue: identity,
}

function arrToTree<a extends DefaultType>(arr: ReadonlyArray<a>): Node<a> {
    let node: Node<a> = EMPTY_NODE
    for (let i = 0; i < arr.length; i++) {
        node = node.insert(compareDefault, arr[i])
    }
    return node
}

const treeGen = Jsv.bless({
    generator: Jsv.array(Jsv.number).generator.map(arrToTree),
})

describe("red black tree", () => {
    describe(".isEmpty()", () => {
        it("should return true for empty nodes", () => {
            expect(new EmptyNode().isEmpty()).equals(true)
            expect(EMPTY_NODE.isEmpty()).equals(true)
            expect(
                EMPTY_NODE.insert(compareDefault, 1)
                    .remove(compareDefault, 1)
                    .isEmpty(),
            ).equals(true)
        })
    })

    describe(".insert()", () => {
        it("should return a non-empty array", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                return tree.insert(compareDefault, n).isEmpty() === false
            })
        })

        it("should insert the given value into the tree", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                return tree.insert(compareDefault, n).find(treeConfig, n) !== undefined
            })
        })
    })
})
