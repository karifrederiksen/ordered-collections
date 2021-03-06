import { expect } from "chai"
import * as Jsv from "jsverify"

import { Node, EmptyNode, EMPTY_NODE } from "./redblack"
import { numberLT, compareNumber } from "../util"

function arrToTree(arr: readonly number[]): Node<number, void> {
    let node: Node<number, void> = EMPTY_NODE
    for (let i = 0; i < arr.length; i++) {
        node = node.insert(numberLT, arr[i], undefined)
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
                EMPTY_NODE.insert(numberLT, 1, undefined)
                    .remove(numberLT, 1)
                    .isNonEmpty(),
            ).equals(false)
        })
    })

    describe(".insert()", () => {
        it("should return a non-empty array", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                expect(tree.insert(numberLT, n, undefined).isNonEmpty()).equals(true)
                return true
            })
        })

        it("should insert the given value into the tree", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                expect(tree.insert(numberLT, n, undefined).find(numberLT, n)).not.equals(undefined)
                return true
            })
        })
    })

    describe(".find()", () => {
        it("should return undefined for empty nodes", () => {
            Jsv.assertForall(Jsv.number, n => {
                expect(EMPTY_NODE.find(numberLT, n)).equals(undefined)
                return true
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
                    EMPTY_NODE.insert(numberLT, toInsert, undefined).find(numberLT, toCheck),
                ).equals(undefined)
            }
        })
    })

    describe(".min()", () => {
        it("should return the smallest value in the tree", () => {
            expect(arrToTree([]).min()).equals(undefined)

            Jsv.assertForall(Jsv.array(Jsv.number), arr => {
                const tree = arrToTree(arr)
                const sortedArr = arr.slice().sort(compareNumber)
                const min = tree.min()
                if (min === undefined) {
                    if (arr.length > 0) {
                        throw "Min not found"
                    }
                    return true
                }
                expect(sortedArr[0]).equals(min.key)
                return true
            })
        })
    })

    describe(".max()", () => {
        it("should return the greatest value in the tree", () => {
            expect(arrToTree([]).max()).equals(undefined)

            Jsv.assertForall(Jsv.array(Jsv.number), arr => {
                const tree = arrToTree(arr)
                const sortedArr = arr.slice().sort(compareNumber)
                const max = tree.max()
                if (max === undefined) {
                    if (arr.length > 0) {
                        throw "Max not found"
                    }
                    return true
                }
                expect(sortedArr[sortedArr.length - 1]).equals(max.key)
                return true
            })
        })
    })

    describe(".remove()", () => {
        it("should not throw when the key is preset", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                tree.insert(numberLT, n, undefined).remove(numberLT, n)
                return true
            })
        })
        it("should not contain a key after it's been removed", () => {
            Jsv.assertForall(treeGen, Jsv.number, (tree, n) => {
                expect(
                    tree
                        .insert(numberLT, n, undefined)
                        .remove(numberLT, n)
                        .find(numberLT, n),
                ).equals(undefined)
                return true
            })
        })
    })
})
