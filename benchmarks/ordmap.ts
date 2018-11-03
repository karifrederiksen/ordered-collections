import { Suite } from "benchmark"
import * as Imm from "immutable"
import { OrdMap } from "../dist/index"

process.env.NODE_ENV = "production"

const sizes = [
    10,
    100,
    1000,
    10000,
    // 100000,
]

const tests = {
    construct: true,
    find: true,
    insert: true,
    remove: true,
}

function randomArr<a>(size: number, f: (i: number) => a): ReadonlyArray<a> {
    const arr = new Array<a>(size)
    for (let i = 0; i < size; i++) {
        arr[i] = f(i)
    }
    return arr
}

const randomIntArr = (size: number) =>
    randomArr(size, i => [(Math.random() * (-1 >>> 0)) | 0, i] as [number, number])

function run(size: number): void {
    const arr = randomIntArr(size)

    if (tests.construct) {
        const name = "construct (size: " + size + ")"
        console.log(name)
        new Suite(name)
            .add("Native             ", () => new Map(arr))
            .add("OrdMap             ", () => OrdMap.fromNumberKeyed(arr))
            .add("Immutable.js Map   ", () => Imm.Map<number, number>(arr))
            .add("Immutable.js OrdMap", () => Imm.OrderedMap<number, number>(arr))
            .on("cycle", (ev: any) => console.log("" + ev.target))
            .run()
    }

    const nativeMap: ReadonlyMap<number, number> = new Map(arr)
    const ordMap = OrdMap.fromNumberKeyed(arr)
    const immMap = Imm.Map<number, number>(arr)
    const ImmOrdMap = Imm.OrderedMap<number, number>(arr)

    if (tests.find) {
        const name = "find (size: " + size + ")"
        console.log(name)
        const keysToLookup = arr.slice(0, (size / 10) | 0).map(x => x[0])

        new Suite(name)
            .add("Native             ", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    nativeMap.get(keysToLookup[i])
                }
            })
            .add("OrdMap             ", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    ordMap.find(keysToLookup[i])
                }
            })
            .add("Immutable.js Map   ", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    immMap.get(keysToLookup[i])
                }
            })
            .add("Immutable.js OrdMap", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    ImmOrdMap.get(keysToLookup[i])
                }
            })
            .on("cycle", (ev: any) => console.log("" + ev.target))
            .run()
    }

    if (tests.insert) {
        const name = "insert (size: " + size + ")"
        console.log(name)

        const kvpsToInsert = randomIntArr((size / 10) | 0)
        new Suite(name)
            .add("OrdMap             ", () => {
                let map = ordMap
                for (let i = 0; i < kvpsToInsert.length; i++) {
                    const kvp = kvpsToInsert[i]
                    map = map.insert(kvp[0], kvp[1])
                }
            })
            .add("Immutable.js Map   ", () => {
                let map = immMap
                for (let i = 0; i < kvpsToInsert.length; i++) {
                    const kvp = kvpsToInsert[i]
                    map = map.set(kvp[0], kvp[1])
                }
            })
            .add("Immutable.js OrdMap", () => {
                let map = ImmOrdMap
                for (let i = 0; i < kvpsToInsert.length; i++) {
                    const kvp = kvpsToInsert[i]
                    map = map.set(kvp[0], kvp[1])
                }
            })
            .on("cycle", (ev: any) => console.log("" + ev.target))
            .run()
    }

    if (tests.remove) {
        const name = "remove (size: " + size + ")"
        console.log(name)

        const keysToLookup = arr.slice(0, (arr.length / 10) | 0).map(x => x[0])

        new Suite(name)
            .add("OrdMap             ", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    ordMap.remove(keysToLookup[i])
                }
            })
            .add("Immutable.js Map   ", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    immMap.remove(keysToLookup[i])
                }
            })
            .add("Immutable.js OrdMap", () => {
                for (let i = 0; i < keysToLookup.length; i++) {
                    ImmOrdMap.remove(keysToLookup[i])
                }
            })
            .on("cycle", (ev: any) => console.log("" + ev.target))
            .run()
    }
}

for (const size of sizes) {
    run(size)
}
