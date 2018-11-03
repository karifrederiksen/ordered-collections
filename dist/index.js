'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class EmptyNode {
    get size() {
        return 0;
    }
    get color() {
        return 1 /* Black */;
    }
    isNonEmpty() {
        return false;
    }
    find(_compare, _key) {
        return undefined;
    }
    min() {
        return undefined;
    }
    max() {
        return undefined;
    }
    insert(_compare, key, value) {
        return NonEmptyNode.of(key, value);
    }
    remove(_compare, _key) {
        return this;
    }
}
const EMPTY_NODE = new EmptyNode();
class NonEmptyNode {
    constructor(key, value, left, right, color) {
        this.key = key;
        this.value = value;
        this.left = left;
        this.right = right;
        this.color = color;
        this.size = left.size + right.size + 1;
    }
    static of(key, value) {
        return new NonEmptyNode(key, value, EMPTY_NODE, EMPTY_NODE, 0 /* Red */);
    }
    isNonEmpty() {
        return true;
    }
    find(compare, key) {
        let node = this;
        while (node.isNonEmpty()) {
            const c = compare(key, node.key);
            if (c < 0)
                node = node.left;
            else if (c > 0)
                node = node.right;
            else
                return node;
        }
        return undefined;
    }
    min() {
        let node = this;
        while (node.left.isNonEmpty()) {
            node = node.left;
        }
        return node;
    }
    max() {
        let node = this;
        while (node.right.isNonEmpty()) {
            node = node.right;
        }
        return node;
    }
    insert(compare, key, value) {
        const c = compare(key, this.key);
        if (c < 0)
            return insert_balanceLeft(this.key, this.value, this.left.insert(compare, key, value), this.right, this.color);
        if (c > 0)
            return insert_balanceRight(this.key, this.value, this.left, this.right.insert(compare, key, value), this.color);
        return new NonEmptyNode(key, value, this.left, this.right, this.color);
    }
    remove(compare, key) {
        const c = compare(key, this.key);
        if (c < 0) {
            return remove_balLeft(this.key, this.value, this.left.remove(compare, key), this
                .right);
        }
        if (c > 0) {
            return remove_balRight(this.key, this.value, this.left, this.right.remove(compare, key));
        }
        return remove_append(this.left, this.right);
    }
}
function blacken(node) {
    if (node.color === 0 /* Red */) {
        return new NonEmptyNode(node.key, node.value, node.left, node.right, 1 /* Black */);
    }
    return node;
}
function insert_balanceLeft(z, zv, l, d, color) {
    if (l.color === 0 /* Red */ && l.left.color === 0 /* Red */) {
        const newLeft = new NonEmptyNode(l.left.key, l.left.value, l.left.left, l.left.right, 1 /* Black */);
        const newRight = new NonEmptyNode(z, zv, l.right, d, 1 /* Black */);
        return new NonEmptyNode(l.key, l.value, newLeft, newRight, 0 /* Red */);
    }
    if (l.color === 0 /* Red */ && l.right.color === 0 /* Red */) {
        const newLeft = new NonEmptyNode(l.key, l.value, l.left, l.right.left, 1 /* Black */);
        const newRight = new NonEmptyNode(z, zv, l.right.right, d, 1 /* Black */);
        return new NonEmptyNode(l.right.key, l.right.value, newLeft, newRight, 0 /* Red */);
    }
    return new NonEmptyNode(z, zv, l, d, color);
}
function insert_balanceRight(x, xv, a, r, color) {
    if (r.color === 0 /* Red */ && r.left.color === 0 /* Red */) {
        const newLeft = new NonEmptyNode(x, xv, a, r.left.left, 1 /* Black */);
        const newRight = new NonEmptyNode(r.key, r.value, r.left.right, r.right, 1 /* Black */);
        return new NonEmptyNode(r.left.key, r.left.value, newLeft, newRight, 0 /* Red */);
    }
    if (r.color === 0 /* Red */ && r.right.color === 0 /* Red */) {
        const newLeft = new NonEmptyNode(x, xv, a, r.left, 1 /* Black */);
        const newRight = new NonEmptyNode(r.right.key, r.right.value, r.right.left, r.right.right, 1 /* Black */);
        return new NonEmptyNode(r.key, r.value, newLeft, newRight, 0 /* Red */);
    }
    return new NonEmptyNode(x, xv, a, r, color);
}
function remove_balance(x, xv, tl, tr) {
    if (tl.color === 0 /* Red */ && tr.color === 0 /* Red */) {
        return new NonEmptyNode(x, xv, blacken(tl), blacken(tr), 0 /* Red */);
    }
    if (tl.color === 0 /* Red */ && tl.left.color === 0 /* Red */) {
        return new NonEmptyNode(tl.key, tl.value, blacken(tl.left), new NonEmptyNode(x, xv, tl.left.right, tr, 1 /* Black */), 0 /* Red */);
    }
    if (tl.color === 0 /* Red */ && tl.right.color === 0 /* Red */) {
        return new NonEmptyNode(tl.right.key, tl.right.value, new NonEmptyNode(tl.key, tl.value, tl.left, tl.right.left, 1 /* Black */), new NonEmptyNode(x, xv, tl.right.left, tl.right.right, 1 /* Black */), 0 /* Red */);
    }
    if (tr.color === 0 /* Red */ && tr.right.color === 0 /* Red */) {
        return new NonEmptyNode(tr.key, tr.value, new NonEmptyNode(x, xv, tl, tr.left, 1 /* Black */), blacken(tr.right), 0 /* Red */);
    }
    if (tr.color === 0 /* Red */ && tr.left.color === 0 /* Red */) {
        return new NonEmptyNode(tr.left.key, tr.left.value, new NonEmptyNode(x, xv, tl, tr.left.left, 1 /* Black */), new NonEmptyNode(tr.key, tr.value, tr.left.right, tr.right, 1 /* Black */), 0 /* Red */);
    }
    return new NonEmptyNode(x, xv, tl, tr, 1 /* Black */);
}
function remove_subl(node) {
    if (node.color === 1 /* Black */) {
        return new NonEmptyNode(node.key, node.value, node.left, node.right, 0 /* Red */);
    }
    throw "Invariance violation. Expected black, got red";
}
function remove_balLeft(x, xv, tl, tr) {
    if (tl.color === 0 /* Red */) {
        return new NonEmptyNode(x, xv, blacken(tl), tr, 0 /* Red */);
    }
    if (tr.color === 1 /* Black */) {
        return remove_balance(x, xv, tl, new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, 0 /* Red */));
    }
    if (tr.color && !tr.left.color) {
        const rightLeft = tr.left;
        const rightRight = tr.right;
        return new NonEmptyNode(rightLeft.key, rightLeft.value, new NonEmptyNode(x, xv, tl, rightLeft.left, 1 /* Black */), remove_balance(tr.key, tr.value, rightLeft.right, remove_subl(rightRight)), 0 /* Red */);
    }
    throw "Invariance violation.";
}
function remove_balRight(x, xv, tl, tr) {
    if (tr.color === 0 /* Red */) {
        return new NonEmptyNode(x, xv, tl, blacken(tr), 0 /* Red */);
    }
    if (tl.color === 1 /* Black */) {
        return remove_balance(x, xv, tl, tr);
    }
    if (tl.color === 0 /* Red */ && tl.right.color === 1 /* Black */) {
        const leftLeft = tl.left;
        const leftRight = tl.right;
        return new NonEmptyNode(leftRight.key, leftRight.value, remove_balance(tl.key, tl.value, remove_subl(leftLeft), leftRight.left), new NonEmptyNode(x, xv, leftRight.right, tr, 1 /* Black */), 0 /* Red */);
    }
    throw "Invariance violation.";
}
function remove_append(tl, tr) {
    if (!tl.isNonEmpty())
        return tr;
    if (!tr.isNonEmpty())
        return tl;
    if (tl.color === 0 /* Red */ && tr.color === 0 /* Red */) {
        const res = remove_append(tl.right, tr.left);
        if (res.color === 0 /* Red */) {
            return new NonEmptyNode(res.key, res.value, new NonEmptyNode(tl.key, tl.value, tl.left, res.left, 0 /* Red */), new NonEmptyNode(tr.key, tr.value, res.right, tr.right, 0 /* Red */), 0 /* Red */);
        }
        return new NonEmptyNode(tl.key, tl.value, tl.left, new NonEmptyNode(tr.key, tr.value, res, tr.right, 0 /* Red */), 0 /* Red */);
    }
    if (tl.color === 1 /* Black */ && tr.color === 1 /* Black */) {
        const res = remove_append(tl.right, tr.left);
        if (res.color === 0 /* Red */) {
            return new NonEmptyNode(res.key, res.value, new NonEmptyNode(tl.key, tl.value, tl.left, res.left, 1 /* Black */), new NonEmptyNode(tr.key, tr.value, res.right, tr.right, 1 /* Black */), 0 /* Red */);
        }
        return remove_balLeft(tl.key, tl.value, tl.left, new NonEmptyNode(tr.key, tr.value, res, tr.right, 1 /* Black */));
    }
    if (tr.color === 0 /* Red */) {
        return new NonEmptyNode(tr.key, tr.value, remove_append(tl, tr.left), tr.right, 0 /* Red */);
    }
    return new NonEmptyNode(tl.key, tl.value, tl.left, remove_append(tl.right, tr), 0 /* Red */);
}

function compareNumber(l, r) {
    if (isNaN(l)) {
        if (isNaN(r)) {
            return 0;
        }
        return 1;
    }
    if (isNaN(r)) {
        return -1;
    }
    return l < r ? -1 : r < l ? 1 : 0;
}
function compareString(l, r) {
    return l < r ? -1 : r < l ? 1 : 0;
}

class ForwardIterator {
    constructor(node, f) {
        this.f = f;
        const stack = [node];
        let n = node;
        while (n.left.isNonEmpty()) {
            n = n.left;
            stack.push(n);
        }
        this.stack = stack;
    }
    next() {
        const { stack } = this;
        if (stack.length === 0)
            return { done: true };
        const resultNode = stack.pop();
        let node = resultNode.right;
        while (node.isNonEmpty()) {
            stack.push(node);
            node = node.left;
        }
        return { done: false, value: this.f(resultNode) };
    }
}
class ReverseIterator {
    constructor(node, f) {
        this.f = f;
        const stack = [node];
        let n = node;
        while (n.right.isNonEmpty()) {
            n = n.right;
            stack.push(n);
        }
        this.stack = stack;
    }
    next() {
        const { stack } = this;
        if (stack.length === 0)
            return { done: true };
        const resultNode = stack.pop();
        let node = resultNode.left;
        while (node.isNonEmpty()) {
            stack.push(node);
            node = node.right;
        }
        return { done: false, value: this.f(resultNode) };
    }
}
const EMPTY_ITER = {
    next: () => ({ done: true }),
};

class OrdMap {
    constructor(compare, root) {
        this.compare = compare;
        this.root = root;
    }
    static empty(compare) {
        return new OrdMap(compare, EMPTY_NODE);
    }
    static emptyNumberKeyed() {
        return OrdMap.empty(compareNumber);
    }
    static emptyStringKeyed() {
        return OrdMap.empty(compareString);
    }
    static of(key, value, compare) {
        return new OrdMap(compare, NonEmptyNode.of(key, value));
    }
    static ofNumberKeyed(key, value) {
        return OrdMap.of(key, value, compareNumber);
    }
    static ofStringKeyed(key, value) {
        return OrdMap.of(key, value, compareString);
    }
    static from(iterable, compare) {
        let t = OrdMap.empty(compare);
        for (const val of iterable) {
            t = t.insert(val[0], val[1]);
        }
        return t;
    }
    static fromNumberKeyed(iterable) {
        return OrdMap.from(iterable, compareNumber);
    }
    static fromStringKeyed(iterable) {
        return OrdMap.from(iterable, compareString);
    }
    get size() {
        return this.root.size;
    }
    find(key) {
        const node = this.root.find(this.compare, key);
        return node !== undefined ? node.value : undefined;
    }
    min() {
        const node = this.root.min();
        if (node === undefined) {
            return undefined;
        }
        return [node.key, node.value];
    }
    max() {
        if (this.root.isNonEmpty())
            return undefined;
        const node = this.root.max();
        if (node === undefined) {
            return undefined;
        }
        return [node.key, node.value];
    }
    insert(key, value) {
        return new OrdMap(this.compare, this.root.insert(this.compare, key, value));
    }
    remove(key) {
        return new OrdMap(this.compare, this.root.remove(this.compare, key));
    }
    keys() {
        const arr = [];
        for (const val of this) {
            arr.push(val[0]);
        }
        return arr;
    }
    values() {
        const arr = [];
        for (const val of this) {
            arr.push(val[1]);
        }
        return arr;
    }
    difference(other) {
        checkComparisonFuncEquality(this.compare, other.compare);
        let newMap = OrdMap.empty(this.compare);
        for (const val of this) {
            if (other.find(val[0]) === undefined) {
                newMap = newMap.insert(val[0], val[1]);
            }
        }
        for (const val of other) {
            if (this.find(val[0]) === undefined) {
                newMap = newMap.insert(val[0], val[1]);
            }
        }
        return newMap;
    }
    toArray() {
        const arr = [];
        for (const val of this) {
            arr.push(val);
        }
        return arr;
    }
    toJSON() {
        return this.toArray();
    }
    reverseIterator() {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ReverseIterator(this.root, getKvp);
    }
    [Symbol.iterator]() {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ForwardIterator(this.root, getKvp);
    }
}
function getKvp(node) {
    return [node.key, node.value];
}
function checkComparisonFuncEquality(f1, f2) {
    if (process.env.NODE_ENV !== "production") {
        if (f1 !== f2) {
            console.warn("You're merging two maps with different compare functions. This can lead to inconsistent results.\n\nConsider using the same comparison function for both maps.");
        }
    }
}

class OrdSet {
    constructor(compare, root) {
        this.compare = compare;
        this.root = root;
    }
    static empty(compare) {
        return new OrdSet(compare, EMPTY_NODE);
    }
    static emptyNumber() {
        return OrdSet.empty(compareNumber);
    }
    static emptyString() {
        return OrdSet.empty(compareString);
    }
    static of(value, compare) {
        return new OrdSet(compare, NonEmptyNode.of(value, undefined));
    }
    static ofNumber(value) {
        return OrdSet.of(value, compareNumber);
    }
    static ofString(value) {
        return OrdSet.of(value, compareString);
    }
    static from(iterable, compare) {
        let t = OrdSet.empty(compare);
        for (const val of iterable) {
            t = t.insert(val);
        }
        return t;
    }
    static fromNumbers(iterable) {
        return OrdSet.from(iterable, compareNumber);
    }
    static fromStrings(iterable) {
        return OrdSet.from(iterable, compareString);
    }
    get size() {
        return this.root.size;
    }
    has(key) {
        return this.root.isNonEmpty() ? false : this.root.find(this.compare, key) !== undefined;
    }
    min() {
        const node = this.root.min();
        if (node === undefined) {
            return undefined;
        }
        return node.key;
    }
    max() {
        const node = this.root.max();
        if (node === undefined) {
            return undefined;
        }
        return node.key;
    }
    insert(value) {
        return new OrdSet(this.compare, this.root.insert(this.compare, value, undefined));
    }
    remove(key) {
        return new OrdSet(this.compare, this.root.remove(this.compare, key));
    }
    union(other) {
        checkComparisonFuncEquality$1(this.compare, other.compare);
        let newSet = OrdSet.empty(this.compare);
        for (const val of this) {
            newSet = newSet.insert(val);
        }
        for (const val of other) {
            newSet = newSet.insert(val);
        }
        return newSet;
    }
    intersect(other) {
        checkComparisonFuncEquality$1(this.compare, other.compare);
        let newSet = OrdSet.empty(this.compare);
        for (const val of other) {
            if (this.has(val)) {
                newSet = newSet.insert(val);
            }
        }
        return newSet;
    }
    difference(other) {
        checkComparisonFuncEquality$1(this.compare, other.compare);
        let newSet = OrdSet.empty(this.compare);
        for (const val of this) {
            if (!other.has(val)) {
                newSet = newSet.insert(val);
            }
        }
        for (const val of other) {
            if (!this.has(val)) {
                newSet = newSet.insert(val);
            }
        }
        return newSet;
    }
    toArray() {
        const arr = [];
        for (const val of this) {
            arr.push(val);
        }
        return arr;
    }
    toJSON() {
        return this.toArray();
    }
    reverseIterator() {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ReverseIterator(this.root, getKey);
    }
    [Symbol.iterator]() {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ForwardIterator(this.root, getKey);
    }
}
function getKey(node) {
    return node.key;
}
function checkComparisonFuncEquality$1(f1, f2) {
    if (process.env.NODE_ENV !== "production") {
        if (f1 !== f2) {
            console.warn("You're merging two sets with different compare functions. This can lead to inconsistent results.\n\nConsider using the same comparison function for both sets.");
        }
    }
}

exports.OrdMap = OrdMap;
exports.OrdSet = OrdSet;
//# sourceMappingURL=index.js.map
