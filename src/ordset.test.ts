import { expect } from "chai"
import * as Jsv from "jsverify"
import { OrdSet } from "./ordset"
import { compareNumber } from "./util"

const setGen = Jsv.bless({
    generator: Jsv.array(Jsv.int8).generator.map(OrdSet.number.from),
})

function push(arr: number[], val: number): number[] {
    arr.push(val)
    return arr
}

function sortAndDedupe(arr_: readonly number[]): number[] {
    const deduped = new Set(arr_)
    const arr: number[] = []

    for (const uniq of deduped) {
        arr.push(uniq)
    }

    return arr.sort(compareNumber)
}

describe("OrdSet", () => {
    describe(".toArray()", () => {
        it("should be ordered in ascending order", () => {
            Jsv.assertForall(setGen, set => {
                const arr = set.toArray()
                const sortedArr = arr.slice().sort(compareNumber)

                expect(arr).deep.equals(sortedArr)

                return true
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
        return { asSet: OrdSet.number.from(arr), asArray: sortAndDedupe(arr) }
    })

    describe(".foldl()", () => {
        it("should traverse the full tree from left to right", () => {
            for (const { asSet, asArray } of foldlTests) {
                expect(asSet.foldl(push, [])).deep.equals(asArray)
            }

            Jsv.assertForall(Jsv.array(Jsv.number), arr => {
                const a = OrdSet.number.from(arr).foldl(push, [])
                const b = sortAndDedupe(arr).reduce(push, [])

                expect(a).deep.equals(b)

                return true
            })
        })
    })

    describe(".foldr()", () => {
        it("should traverse the full tree from right to left", () => {
            for (const { asSet, asArray } of foldlTests) {
                expect(asSet.foldr(push, [])).deep.equals(asArray.slice().reverse())
            }

            Jsv.assertForall(Jsv.array(Jsv.number), arr => {
                const a = OrdSet.number.from(arr).foldr(push, [])
                const b = sortAndDedupe(arr).reduceRight(push, [])

                expect(a).deep.equals(b)

                return true
            })
        })
    })

    describe(".union()", () => {
        it("should return all values from both sets", () => {
            Jsv.assertForall(setGen, setGen, (l, r) => {
                const merged = l.union(r)
                for (const x of l.toArray()) {
                    expect(merged.has(x)).equals(true)
                }
                for (const x of r.toArray()) {
                    expect(merged.has(x)).equals(true)
                }
                return true
            })
        })
    })

    describe(".intersect()", () => {
        it("should return the common values for both sets", () => {
            Jsv.assertForall(setGen, setGen, (l, r) => {
                for (const x of l.intersect(r).toArray()) {
                    expect(l.has(x) || r.has(x)).equals(true)
                }
                return true
            })
        })
    })

    describe(".difference()", () => {
        it("should return the values that are unique to each set", () => {
            Jsv.assertForall(setGen, setGen, (l, r) => {
                for (const x of l.difference(r).toArray()) {
                    expect(Number(l.has(x)) + Number(r.has(x))).equals(1)
                }
                return true
            })
        })
    })
})
