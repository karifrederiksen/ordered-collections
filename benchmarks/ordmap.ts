import { Suite } from "benchmark"
import * as Imm from "immutable"
import { OrdMap } from "../dist/index"

process.env.NODE_ENV = "production"

const config = {
    sizes: [
        10,
        100,
        1000,
        10000,
        // 100000,
    ] as const,
    construct: true,
    find: true,
    insert: true,
    remove: true,
} as const

interface Runnable<a> {
    (): a
}

type ConstructData = readonly (readonly [number, number])[]
type FindData = readonly number[]
type InsertData = readonly (readonly [number, number])[]
type RemoveData = readonly number[]

interface LibBench<a> {
    readonly name: string
    construct(data: ConstructData): Runnable<a>
    find?(self: a, data: FindData): Runnable<void>
    insert?(self: a, data: InsertData): Runnable<void>
    remove?(self: a, data: RemoveData): Runnable<void>
}

const NATIVE_BENCH: LibBench<Map<number, number>> = {
    name: "Native",
    construct(data) {
        return () => new Map<number, number>(data)
    },
    find(self, data) {
        return () => {
            for (let i = 0; i < data.length; i++) {
                self.get(data[i])
            }
        }
    },
}

const ORDMAP_BENCH: LibBench<OrdMap<number, number>> = {
    name: "OrdMap",
    construct(data) {
        return () => OrdMap.number.from(data)
    },
    find(self, data) {
        return () => {
            for (let i = 0; i < data.length; i++) {
                self.find(data[i])
            }
        }
    },
    insert(self, data) {
        return () => {
            let map = self
            for (let i = 0; i < data.length; i++) {
                const kvp = data[i]
                map = map.insert(kvp[0], kvp[1])
            }
        }
    },
    remove(self, data) {
        return () => {
            let map = self
            for (let i = 0; i < data.length; i++) {
                map = map.remove(data[i])
            }
        }
    },
}

const IMM_MAP_BENCH: LibBench<Imm.Map<number, number>> = {
    name: "Immutable.js Map",
    construct(data) {
        return () => Imm.Map<number, number>(data as any)
    },
    find(self, data) {
        return () => {
            for (let i = 0; i < data.length; i++) {
                self.get(data[i])
            }
        }
    },
    insert(self, data) {
        return () => {
            let map = self
            for (let i = 0; i < data.length; i++) {
                const kvp = data[i]
                map = map.set(kvp[0], kvp[1])
            }
        }
    },
    remove(self, data) {
        return () => {
            let map = self
            for (let i = 0; i < data.length; i++) {
                map = map.remove(data[i])
            }
        }
    },
}

const IMM_ORDMAP_BENCH: LibBench<Imm.OrderedMap<number, number>> = {
    name: "Immutable.js OrdMap",
    construct(data) {
        return () => Imm.OrderedMap<number, number>(data as any)
    },
    find(self, data) {
        return () => {
            for (let i = 0; i < data.length; i++) {
                self.get(data[i])
            }
        }
    },
    insert(self, data) {
        return () => {
            let map = self
            for (let i = 0; i < data.length; i++) {
                const kvp = data[i]
                map = map.set(kvp[0], kvp[1])
            }
        }
    },
    remove(self, data) {
        return () => {
            let map = self
            for (let i = 0; i < data.length; i++) {
                map = map.remove(data[i])
            }
        }
    },
}

const LIB_BENCHES: readonly LibBench<unknown>[] = [
    NATIVE_BENCH,
    ORDMAP_BENCH,
    IMM_MAP_BENCH,
    IMM_ORDMAP_BENCH,
]

const RANDOMIZED_ARRS: readonly (readonly [number, number][])[] = config.sizes.map(randomIntArr)

const LIB_INSTANCES: Record<string, any> = (() => {
    const instances: Record<string, any> = {}
    for (let idx = 0; idx < RANDOMIZED_ARRS.length; idx++) {
        for (const lib of LIB_BENCHES) {
            instances[idx + lib.name] = lib.construct(RANDOMIZED_ARRS[idx])()
        }
    }

    return instances
})()

function randomArr<a>(size: number, f: (i: number) => a): readonly a[] {
    const arr = new Array<a>(size)
    for (let i = 0; i < size; i++) {
        arr[i] = f(i)
    }
    return arr
}

function randomIntArr(size: number) {
    return randomArr(size, (i) => [(Math.random() * (-1 >>> 0)) | 0, i] as [number, number])
}

const libNameLength = LIB_BENCHES.reduce((n, s) => Math.max(s.name.length, n), 0)

function formatLibName(name: string): string {
    return "    " + name + " ".repeat(libNameLength - name.length)
}

function onCycle(ev: any) {
    console.log("" + ev.target)
}

function addToSuite(suite: Suite, idx: number, fName: "find" | "insert" | "remove", data: any) {
    for (const lib of LIB_BENCHES) {
        const f = lib[fName]
        if (f != null) {
            suite.add(formatLibName(lib.name), f(LIB_INSTANCES[idx + lib.name], data))
        }
    }
}

for (let idx = 0; idx < RANDOMIZED_ARRS.length; idx++) {
    const size = config.sizes[idx]
    const arr = RANDOMIZED_ARRS[idx]
    if (config.construct) {
        const name = "construct | size: " + size
        const suite = new Suite(name)
        for (const lib of LIB_BENCHES) {
            suite.add(formatLibName(lib.name), lib.construct(arr))
        }
        console.log(name)
        suite.on("cycle", onCycle).run()
    }
    if (config.find) {
        const keysToLookup = arr.slice(0, (size / 10) | 0).map((x) => x[0])
        const name = "find | size: " + size
        const suite = new Suite(name)
        addToSuite(suite, idx, "find", keysToLookup)
        console.log(name)
        suite.on("cycle", onCycle).run()
    }
    if (config.insert) {
        const kvpsToInsert = randomIntArr((size / 10) | 0)
        const name = "insert | size: " + size
        const suite = new Suite(name)
        addToSuite(suite, idx, "insert", kvpsToInsert)
        console.log(name)
        suite.on("cycle", onCycle).run()
    }
    if (config.remove) {
        const keysToLookup = arr.slice(0, (arr.length / 10) | 0).map((x) => x[0])
        const name = "remove | size: " + size
        const suite = new Suite(name)
        addToSuite(suite, idx, "remove", keysToLookup)
        console.log(name)
        suite.on("cycle", onCycle).run()
    }
}
