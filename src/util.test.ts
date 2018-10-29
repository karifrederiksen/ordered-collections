import { expect } from "chai"
import * as Jsv from "jsverify"
import { compareNumber } from "./util"

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
    })
})
