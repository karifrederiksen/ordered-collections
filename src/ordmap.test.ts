import { expect } from "chai"
import * as Jsv from "jsverify"
import { OrdMap } from "./ordmap"
import { compareNumber } from "./util"

const tupleGen = Jsv.tuple([Jsv.int8, Jsv.number]) as Jsv.Arbitrary<[number, number]>

const mapGen = Jsv.bless({
    generator: Jsv.array(tupleGen).generator.map(OrdMap.number.from),
})

function compareNumberTuple<v>(l: [number, v], r: [number, v]): number {
    return compareNumber(l[0], r[0])
}

function push(arr: Array<[number, number]>, val: [number, number]): Array<[number, number]> {
    arr.push(val)
    return arr
}

function sortAndDedupe(arr_: Array<[number, number]>): Array<[number, number]> {
    const deduped = new Map(arr_)
    const arr: Array<[number, number]> = []

    for (const uniq of deduped) {
        arr.push(uniq)
    }

    return arr.sort(compareNumberTuple)
}

describe("OrdMap", () => {
    describe(".toArray()", () => {
        it("should return the map as an array of tuples", () => {
            Jsv.assertForall(mapGen, map => {
                return map.toArray().every(x => x.length === 2)
            })
        })

        it("should be ordered by key (first elem) in ascending order", () => {
            Jsv.assertForall(mapGen, map => {
                const arr = map.toArray()
                const sortedArr = arr.slice().sort(compareNumberTuple)
                expect(arr).deep.equals(sortedArr)
                return true
            })
        })
    })

    describe(".remove()", () => {
        it("should not throw", () => {
            Jsv.assertForall(mapGen, Jsv.number, (map, n) => {
                map.remove(n)
                return true
            })
        })
    })

    const foldlTests = new Array(100).fill((Math.random() * 100) | 0).map(n => {
        const arr = new Array<[number, number]>(n)
        for (let i = 0; i < n; i++) {
            arr[i] = [Math.random() * Number.MAX_VALUE, Math.random()]
        }
        return {
            asMap: OrdMap.number.from(arr),
            asArray: sortAndDedupe(arr),
        }
    })

    describe(".foldl()", () => {
        it("should traverse the full tree from left to right", () => {
            for (const { asMap, asArray } of foldlTests) {
                expect(asMap.foldl(push, [])).deep.equals(asArray)
            }

            Jsv.assertForall(Jsv.array(tupleGen), arr => {
                const a = OrdMap.number.from(arr).foldl(push, [])
                const b = sortAndDedupe(arr).reduce(push, [])

                expect(a).deep.equals(b)

                return true
            })
        })
    })

    describe(".foldr()", () => {
        it("should traverse the full tree from right to left", () => {
            for (const { asMap, asArray } of foldlTests) {
                expect(asMap.foldr(push, [])).deep.equals(asArray.slice().reverse())
            }

            Jsv.assertForall(Jsv.array(tupleGen), arr => {
                const a = OrdMap.number.from(arr).foldr(push, [])
                const b = sortAndDedupe(arr).reduceRight(push, [])

                expect(a).deep.equals(b)

                return true
            })
        })
    })

    describe(".difference()", () => {
        it("should merge the unique keys from both maps", () => {
            Jsv.assertForall(mapGen, mapGen, (l, r) => {
                const difference = l.difference(r)

                return difference.toArray().every(x => {
                    return l.find(x[0]) === undefined || r.find(x[0]) === undefined
                })
            })
        })
    })
})
