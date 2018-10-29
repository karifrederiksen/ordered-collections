import { expect } from "chai"
import * as Jsv from "jsverify"
import { compareNumber, compareString } from "./util"

describe("util", () => {
    describe("compareNumber()", () => {
        it("NaN is the greatest number", () => {
            expect(compareNumber(NaN, NaN)).equals(0)
            expect(compareNumber(NaN, Infinity)).equals(1)
            expect(compareNumber(NaN, -Infinity)).equals(1)
            expect(compareNumber(Infinity, NaN)).equals(-1)
            expect(compareNumber(-Infinity, NaN)).equals(-1)

            Jsv.assertForall(Jsv.number, n => {
                return compareNumber(NaN, n) === 1 && compareNumber(n, NaN) === -1
            })
        })

        it("should compare in ascending order", () => {
            const tests = [
                { unsorted: [1, 3, 2], sorted: [1, 2, 3] },
                { unsorted: [1, NaN, 3, 2], sorted: [1, 2, 3, NaN] },
                {
                    unsorted: [1, NaN, -1, Infinity, 0, -Infinity, 2],
                    sorted: [-Infinity, -1, 0, 1, 2, Infinity, NaN],
                },
            ]
            for (const { unsorted, sorted } of tests) {
                expect(unsorted.slice().sort(compareNumber)).deep.equals(sorted)
            }
        })
    })

    describe("compareString()", () => {
        const tests = [
            { unsorted: ["a", "c", "b"], sorted: ["a", "b", "c"] },
            { unsorted: ["aa", "c", "ba"], sorted: ["aa", "ba", "c"] },
        ]
        for (const { unsorted, sorted } of tests) {
            expect(unsorted.slice().sort(compareString)).deep.equals(sorted)
        }
    })
})
