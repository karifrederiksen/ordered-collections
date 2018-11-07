import { expect } from "chai"
import * as Jsv from "jsverify"
import { OrdSet } from "./ordset"
import { compareNumber } from "./util"

const setGen = Jsv.bless({
    generator: Jsv.array(Jsv.int8).generator.map(OrdSet.fromNumbers),
})

function arrDeepEq<a>(arr1: ReadonlyArray<a>, arr2: ReadonlyArray<a>): boolean {
    if (arr1.length !== arr2.length) {
        return false
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false
        }
    }
    return true
}

function push(arr: Array<number>, val: number): Array<number> {
    arr.push(val)
    return arr
}

describe("OrdSet", () => {
    describe(".toArray()", () => {
        it("should be ordered in ascending order", () => {
            Jsv.assertForall(setGen, set => {
                const arr = set.toArray()
                const sortedArr = arr.slice().sort(compareNumber)
                return arrDeepEq(arr, sortedArr)
            })
        })
    })

    describe(".remove()", () => {
        it("should not throw", () => {
            Jsv.assertForall(setGen, Jsv.number, (set, n) => {
                set.remove(n)
                return true
            })
        })
    })

    const foldlTests = new Array(100).fill((Math.random() * 100) | 0).map(n => {
        const arr = new Array(n)
        for (let i = 0; i < n; i++) {
            arr[i] = Math.random() * Number.MAX_VALUE
        }
        return { asSet: OrdSet.fromNumbers(arr), asArray: arr.sort(compareNumber) }
    })

    describe(".foldl()", () => {
        it("should traverse the full tree from left to right", () => {
            for (const { asSet, asArray } of foldlTests) {
                expect(asSet.foldl(push, [])).deep.equals(asArray)
            }

            Jsv.assertForall(Jsv.array(Jsv.number), arr => {
                const a = arr
                    .slice()
                    .sort(compareNumber)
                    .reduce(push, [])
                const b = OrdSet.fromNumbers(arr).foldl(push, [] as Array<number>)

                return arrDeepEq(a, b)
            })
        })
    })

    describe(".foldr()", () => {
        it("should traverse the full tree from right to left", () => {
            for (const { asSet, asArray } of foldlTests) {
                expect(asSet.foldr(push, [])).deep.equals(asArray.slice().reverse())
            }

            Jsv.assertForall(Jsv.array(Jsv.number), arr => {
                const a = arr
                    .slice()
                    .sort(compareNumber)
                    .reduce(push, [])
                const b = OrdSet.fromNumbers(arr).foldl(push, [] as Array<number>)

                return arrDeepEq(a, b)
            })
        })
    })

    describe(".union()", () => {
        it("should return all values from both sets", () => {
            Jsv.assertForall(setGen, setGen, (l, r) => {
                const merged = l.union(r)
                return (
                    l.toArray().every(x => merged.has(x)) && r.toArray().every(x => merged.has(x))
                )
            })
        })
    })

    describe(".intersect()", () => {
        it("should return the common values for both sets", () => {
            Jsv.assertForall(setGen, setGen, (l, r) => {
                return l
                    .intersect(r)
                    .toArray()
                    .every(x => {
                        return l.has(x) && r.has(x)
                    })
            })
        })
    })

    describe(".difference()", () => {
        it("should return the values that are unique to each set", () => {
            Jsv.assertForall(setGen, setGen, (l, r) => {
                return l
                    .difference(r)
                    .toArray()
                    .every(x => {
                        return Number(l.has(x)) + Number(r.has(x)) === 1
                    })
            })
        })
    })
})
