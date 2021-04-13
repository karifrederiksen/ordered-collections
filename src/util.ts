export function numberLT(l: number, r: number): boolean {
    if (isNaN(l)) {
        return false
    }
    if (isNaN(r)) {
        return true
    }
    return l < r
}

export function stringLT(l: string, r: string): boolean {
    return l < r
}

export type LessThan<a> = (key: a, otherKey: a) => boolean

// below: order functions based on the LT functions

export function compareNumber(l: number, r: number): number {
    return numberLT(l, r) ? -1 : numberLT(r, l) ? 1 : 0
}

export function compareString(l: string, r: string): number {
    return stringLT(l, r) ? -1 : stringLT(r, l) ? 1 : 0
}
