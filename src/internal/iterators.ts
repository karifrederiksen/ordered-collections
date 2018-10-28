import { NonEmptyNode } from "./redblack"

export class ForwardIterator<k, v, b> implements Iterator<b> {
    private readonly stack: Array<NonEmptyNode<k, v>>

    constructor(node: NonEmptyNode<k, v>, private readonly f: (node: NonEmptyNode<k, v>) => b) {
        const stack: Array<NonEmptyNode<k, v>> = [node]
        let n = node
        while (n.left.isNonEmpty()) {
            n = n.left
            stack.push(n)
        }
        this.stack = stack
    }

    next(): IteratorResult<b> {
        const { stack } = this

        if (stack.length === 0) return { done: true } as IteratorResult<b>

        const resultNode = stack.pop()!

        let node = resultNode.right
        while (node.isNonEmpty()) {
            stack.push(node)
            node = node.left
        }
        return { done: false, value: this.f(resultNode) }
    }
}

export class ReverseIterator<k, v, b> implements Iterator<b> {
    private readonly stack: Array<NonEmptyNode<k, v>>

    constructor(node: NonEmptyNode<k, v>, private readonly f: (node: NonEmptyNode<k, v>) => b) {
        const stack: Array<NonEmptyNode<k, v>> = [node]
        let n = node
        while (n.right.isNonEmpty()) {
            n = n.right
            stack.push(n)
        }
        this.stack = stack
    }

    next(): IteratorResult<b> {
        const { stack } = this

        if (stack.length === 0) return { done: true } as IteratorResult<b>

        const resultNode = stack.pop()!

        let node = resultNode.left
        while (node.isNonEmpty()) {
            stack.push(node)
            node = node.right
        }
        return { done: false, value: this.f(resultNode) }
    }
}

export const EMPTY_ITER: Iterator<any> = {
    next: () => ({ done: true } as IteratorResult<any>),
}
