export type DefaultType = string | number | boolean

export function compareDefault<a extends DefaultType>(l: a, r: a): number {
    return l < r ? -1 : l > r ? 1 : 0
}

export type Comp<a, b> = (key: a, otherKey: b) => number

export function identity<a>(val: a): a {
    return val
}
