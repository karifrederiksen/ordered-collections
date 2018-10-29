import * as Jsv from "jsverify"
import { OrdMap } from "./ordmap"
import { compareNumber } from "./util"

const tupleGen = Jsv.tuple([Jsv.int8, Jsv.number]) as Jsv.Arbitrary<[number, number]>

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
