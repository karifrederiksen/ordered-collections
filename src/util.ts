export function compareNumber(l: number, r: number): number {
    if (isNaN(l)) {
        if (isNaN(r)) {
            return 0
        }
        return 1
    }
    if (isNaN(r)) {
        return -1
    }
    return l < r ? -1 : r < l ? 1 : 0
}

export function compareString(l: string, r: string): number {
    return l < r ? -1 : r < l ? 1 : 0
}

export type Comp<a> = (key: a, otherKey: a) => number
