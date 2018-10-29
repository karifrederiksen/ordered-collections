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

    describe(".find()", () => {
        it("should return undefined for empty nodes", () => {
            Jsv.assertForall(Jsv.number, n => {
                return EMPTY_NODE.find(compareNumber, n) === undefined
            })
        })

        it("should return undefined for keys that don't exist", () => {
            const tests = [
                { toInsert: 0, toCheck: 1 },
                { toInsert: 1, toCheck: 0 },
                { toInsert: 42, toCheck: NaN },
                { toInsert: NaN, toCheck: 42 },
            ]
            for (const { toInsert, toCheck } of tests) {
                expect(
                    EMPTY_NODE.insert(compareNumber, toInsert, undefined).find(
                        compareNumber,
                        toCheck,
                    ),
                ).equals(undefined)
            }
        })
    })

    // describe(".min()", () => {
    //     throw "todo"
    // })

    // describe(".max()", () => {
    //     throw "todo"
    // })

    describe(".remove()", () => {
        Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
            return tree.remove(compareNumber, n).find(compareNumber, n) === undefined
        })
    })
})
