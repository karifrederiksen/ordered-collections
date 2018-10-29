import { expect } from "chai"
import * as Jsv from "jsverify"
import { OrdMap } from "./ordmap"
import { compareNumber } from "./util"

const tupleGen = Jsv.tuple([Jsv.number, Jsv.number]) as Jsv.Arbitrary<[number, number]>

const mapGen = Jsv.bless({
    generator: Jsv.array(tupleGen).generator.map(OrdMap.fromNumberKeyed),
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
                const sortedArr = arr.slice().sort((a, b) => compareNumber(a[0], b[0]))
                return arrDeepEq(arr, sortedArr)
            })
        })
    })

    describe(".union()", () => {
        it("should merge all keys from both maps", () => {
            Jsv.assertForall(mapGen, mapGen, (l, r) => {
                const merged = l.union(r)

                return (
                    l.toArray().every(x => merged.find(x[0]) !== undefined) &&
                    r.toArray().every(x => merged.find(x[0]) !== undefined)
                )
            })
        })

        it("should give precedence to the right-hand side in the event of a collision", () => {
            expect(
                OrdMap.ofNumberKeyed(1, "left")
                    .union(OrdMap.ofNumberKeyed(1, "right"))
                    .find(1),
            ).equals("right")
        })
    })

    describe(".intersect()", () => {
        it("should merge the common keys from both maps", () => {
            Jsv.assertForall(mapGen, mapGen, (l, r) => {
                const intersected = l.intersect(r)

                return intersected.toArray().every(x => {
                    return l.find(x[0]) !== undefined || r.find(x[0]) !== undefined
                })
            })
        })

        it("should take the values from the right-hand side", () => {
            expect(
                OrdMap.ofNumberKeyed(1, "left")
                    .union(OrdMap.ofNumberKeyed(1, "right"))
                    .find(1),
            ).equals("right")

            Jsv.assertForall(mapGen, mapGen, (l, r) => {
                const intersected = l.intersect(r)

                return intersected.toArray().every(x => {
                    return r.find(x[0]) === x[1]
                })
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
