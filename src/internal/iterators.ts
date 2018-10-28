import { NonEmptyNode } from "./redblack"

export class ForwardIterator<a> implements Iterator<a> {
    private readonly stack: Array<NonEmptyNode<a>>

    constructor(node: NonEmptyNode<a>) {
        const stack: Array<NonEmptyNode<a>> = [node]
        let n = node
        while (!n.left.isEmpty()) {
            n = n.left
            stack.push(n)
        }
        this.stack = stack
    }

    next(): IteratorResult<a> {
        const { stack } = this

        if (stack.length === 0) return { done: true } as IteratorResult<a>

        const resultNode = stack.pop()!

        let node = resultNode.right
        while (!node.isEmpty()) {
            stack.push(node)
            node = node.left
        }
        return { done: false, value: resultNode.value }
    }
}

export class ReverseIterator<a> implements Iterator<a> {
    private readonly stack: Array<NonEmptyNode<a>>

    constructor(node: NonEmptyNode<a>) {
        const stack: Array<NonEmptyNode<a>> = [node]
        let n = node
        while (!n.right.isEmpty()) {
            n = n.right
            stack.push(n)
        }
        this.stack = stack
    }

    next(): IteratorResult<a> {
        const { stack } = this

        if (stack.length === 0) return { done: true } as IteratorResult<a>

        const resultNode = stack.pop()!

        let node = resultNode.left
        while (!node.isEmpty()) {
            stack.push(node)
            node = node.right
        }
        return { done: false, value: resultNode.value }
    }
}
