'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ForwardIterator {
    constructor(node, f) {
        this.f = f;
        if (node.isNonEmpty()) {
            const stack = [node];
            let n = node;
            while (n.left.isNonEmpty()) {
                n = n.left;
                stack.push(n);
            }
            this.stack = stack;
        }
        else {
            this.stack = [];
        }
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
        if (node.isNonEmpty()) {
            const stack = [node];
            let n = node;
            while (n.right.isNonEmpty()) {
                n = n.right;
                stack.push(n);
            }
            this.stack = stack;
        }
        else {
            this.stack = [];
        }
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

class EmptyNode {
    get size() {
        return 0;
    }
    get color() {
        return 1 /* Black */;
    }
    asBlack() {
        return this;
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
    insert(compare, key, value) {
        return this.ins(compare, key, value);
    }
    ins(_compare, key, value) {
        return NonEmptyNode.of(key, value);
    }
    remove(_compare, _key) {
        return this;
    }
    rem(_compare, _key) {
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
    asBlack() {
        if (this.color === 1 /* Black */) {
            return this;
        }
        else {
            return new NonEmptyNode(this.key, this.value, this.left, this.right, 1 /* Black */);
        }
    }
    isNonEmpty() {
        return true;
    }
    find(compare, key) {
        let node = this;
        while (node.isNonEmpty()) {
            if (compare(key, node.key))
                node = node.left;
            else if (compare(node.key, key))
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
        return this.ins(compare, key, value).asBlack();
    }
    ins(compare, key, value) {
        if (compare(key, this.key)) {
            return balanceLeft(this.key, this.value, this.left.ins(compare, key, value), this.right, this.color);
        }
        if (compare(this.key, key)) {
            return balanceRight(this.key, this.value, this.left, this.right.ins(compare, key, value), this.color);
        }
        return new NonEmptyNode(key, value, this.left, this.right, this.color);
    }
    remove(compare, key) {
        return this.rem(compare, key).asBlack();
    }
    rem(compare, key) {
        if (compare(key, this.key)) {
            if (this.left.color === 1 /* Black */) {
                return balLeft(this.key, this.value, this.left.rem(compare, key), this
                    .right);
            }
            return new NonEmptyNode(this.key, this.value, this.left.rem(compare, key), this.right, 0 /* Red */);
        }
        if (compare(this.key, key)) {
            if (this.right.color === 1 /* Black */) {
                return balRight(this.key, this.value, this.left, this.right.rem(compare, key));
            }
            return new NonEmptyNode(this.key, this.value, this.left, this.right.rem(compare, key), 0 /* Red */);
        }
        return append(this.left, this.right);
    }
}
if (process.env.NODE_ENV !== "production") {
    EmptyNode.prototype.toJSON = function () {
        return {};
    };
    NonEmptyNode.prototype.toJSON = function () {
        return {
            color: this.color === 1 /* Black */ ? "Black" : "Red",
            key: this.key,
            value: this.value,
            left: this.left,
            right: this.right,
        };
    };
}
function balance(x, xv, tl, tr) {
    if (tl.color === 0 /* Red */) {
        if (tr.color === 0 /* Red */) {
            return new NonEmptyNode(x, xv, new NonEmptyNode(tl.key, tl.value, tl.left, tl.right, 1 /* Black */), new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, 1 /* Black */), 0 /* Red */);
        }
        if (tl.left.color === 0 /* Red */) {
            return new NonEmptyNode(tl.key, tl.value, new NonEmptyNode(tl.left.key, tl.left.value, tl.left.left, tl.left.right, 1 /* Black */), new NonEmptyNode(x, xv, tl.right, tr, 1 /* Black */), 0 /* Red */);
        }
        if (tl.right.color === 0 /* Red */) {
            return new NonEmptyNode(tl.right.key, tl.right.value, new NonEmptyNode(tl.key, tl.value, tl.left, tl.right.left, 1 /* Black */), new NonEmptyNode(x, xv, tl.right.right, tr, 1 /* Black */), 0 /* Red */);
        }
    }
    else if (tr.color === 0 /* Red */) {
        if (tr.right.color === 0 /* Red */) {
            return new NonEmptyNode(tr.key, tr.value, new NonEmptyNode(x, xv, tl, tr.left, 1 /* Black */), new NonEmptyNode(tr.right.key, tr.right.value, tr.right.left, tr.right.right, 1 /* Black */), 0 /* Red */);
        }
        if (tr.left.color === 0 /* Red */) {
            return new NonEmptyNode(tr.left.key, tr.left.value, new NonEmptyNode(x, xv, tl, tr.left.left, 1 /* Black */), new NonEmptyNode(tr.key, tr.value, tr.left.right, tr.right, 1 /* Black */), 0 /* Red */);
        }
    }
    return new NonEmptyNode(x, xv, tl, tr, 1 /* Black */);
}
function subl(t) {
    if (t.color === 1 /* Black */) {
        const t_ = t;
        return new NonEmptyNode(t_.key, t_.value, t_.left, t_.right, 0 /* Red */);
    }
    throw "Defect: invariance violation; expected black, got red node: " + t;
}
function balLeft(x, xv, tl, tr) {
    if (tl.color === 0 /* Red */) {
        return new NonEmptyNode(x, xv, new NonEmptyNode(tl.key, tl.value, tl.left, tl.right, 1 /* Black */), tr, 0 /* Red */);
    }
    if (tr.color === 1 /* Black */) {
        return balance(x, xv, tl, new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, 0 /* Red */));
    }
    if (tr.color === 0 /* Red */ && tr.left.color === 1 /* Black */) {
        const trLeft = tr.left;
        return new NonEmptyNode(trLeft.key, trLeft.value, new NonEmptyNode(x, xv, tl, trLeft.left, 1 /* Black */), balance(tr.key, tr.value, trLeft.right, subl(tr.right)), 0 /* Red */);
    }
    throw "Defect: invariance violation in balLeft";
}
function balRight(x, xv, tl, tr) {
    if (tr.color === 0 /* Red */) {
        return new NonEmptyNode(x, xv, tl, new NonEmptyNode(tr.key, tr.value, tr.left, tr.right, 1 /* Black */), 0 /* Red */);
    }
    if (tl.color === 1 /* Black */) {
        return balance(x, xv, new NonEmptyNode(tl.key, tl.value, tl.left, tl.right, 0 /* Red */), tr);
    }
    if (tl.color === 0 /* Red */ && tl.right.color === 1 /* Black */) {
        const tlRight = tl.right;
        return new NonEmptyNode(tlRight.key, tlRight.value, balance(tl.key, tl.value, subl(tl.left), tlRight.left), new NonEmptyNode(x, xv, tlRight.right, tr, 1 /* Black */), 0 /* Red */);
    }
    throw "Defect: invariance violation in balRight";
}
function append(tl, tr) {
    if (!tl.isNonEmpty()) {
        return tr;
    }
    if (!tr.isNonEmpty()) {
        return tl;
    }
    if (tl.color === 0 /* Red */ && tr.color === 0 /* Red */) {
        const bc = append(tl.right, tr.left);
        if (bc.color === 0 /* Red */) {
            return new NonEmptyNode(bc.key, bc.value, new NonEmptyNode(tl.key, tl.value, tl.left, bc.left, 0 /* Red */), new NonEmptyNode(tr.key, tr.value, bc.right, tr.right, 0 /* Red */), 0 /* Red */);
        }
        return new NonEmptyNode(tl.key, tl.value, tl.left, new NonEmptyNode(tr.key, tr.value, bc, tr.right, 0 /* Red */), 0 /* Red */);
    }
    if (tl.color === 1 /* Black */ && tr.color === 1 /* Black */) {
        const bc = append(tl.right, tr.left);
        if (bc.color === 0 /* Red */) {
            return new NonEmptyNode(bc.key, bc.value, new NonEmptyNode(tl.key, tl.value, tl.left, bc.left, 1 /* Black */), new NonEmptyNode(tr.key, tr.value, bc.right, tr.right, 1 /* Black */), 0 /* Red */);
        }
        return balLeft(tl.key, tl.value, tl.left, new NonEmptyNode(tr.key, tr.value, bc, tr.right, 1 /* Black */));
    }
    if (tr.color === 0 /* Red */) {
        return new NonEmptyNode(tr.key, tr.value, append(tl, tr.left), tr.right, 0 /* Red */);
    }
    if (tl.color === 0 /* Red */) {
        return new NonEmptyNode(tl.key, tl.value, tl.left, append(tl.right, tr), 0 /* Red */);
    }
    throw "unmatched tree on append: " + JSON.stringify(tl) + ", " + JSON.stringify(tr);
}
function balanceLeft(z, zv, l, d, color) {
    if (l.color === 0 /* Red */ && l.left.color === 0 /* Red */) {
        return new NonEmptyNode(l.key, l.value, new NonEmptyNode(l.left.key, l.left.value, l.left.left, l.left.right, 1 /* Black */), new NonEmptyNode(z, zv, l.right, d, 1 /* Black */), 0 /* Red */);
    }
    if (l.color === 0 /* Red */ && l.right.color === 0 /* Red */) {
        return new NonEmptyNode(l.right.key, l.right.value, new NonEmptyNode(l.key, l.value, l.left, l.right.left, 1 /* Black */), new NonEmptyNode(z, zv, l.right.right, d, 1 /* Black */), 0 /* Red */);
    }
    return new NonEmptyNode(z, zv, l, d, color);
}
function balanceRight(x, xv, a, r, color) {
    if (r.color === 0 /* Red */ && r.left.color === 0 /* Red */) {
        return new NonEmptyNode(r.left.key, r.left.value, new NonEmptyNode(x, xv, a, r.left.left, 1 /* Black */), new NonEmptyNode(r.key, r.value, r.left.right, r.right, 1 /* Black */), 0 /* Red */);
    }
    if (r.color === 0 /* Red */ && r.right.color === 0 /* Red */) {
        return new NonEmptyNode(r.key, r.value, new NonEmptyNode(x, xv, a, r.left, 1 /* Black */), new NonEmptyNode(r.right.key, r.right.value, r.right.left, r.right.right, 1 /* Black */), 0 /* Red */);
    }
    return new NonEmptyNode(x, xv, a, r, color);
}

function numberLT(l, r) {
    if (isNaN(l)) {
        return false;
    }
    if (isNaN(r)) {
        return true;
    }
    return l < r;
}
function stringLT(l, r) {
    return l < r;
}
function mutablePush(arr, val) {
    arr.push(val);
    return arr;
}

class OrdMap {
    constructor(compare, root) {
        this.compare = compare;
        this.root = root;
    }
    static empty(compare) {
        return new OrdMap(compare, EMPTY_NODE);
    }
    static of(key, value, compare) {
        return new OrdMap(compare, NonEmptyNode.of(key, value));
    }
    static from(iterable, compare) {
        let t = OrdMap.empty(compare);
        for (const val of iterable) {
            t = t.insert(val[0], val[1]);
        }
        return t;
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
        if (this.root.find(this.compare, key) === undefined) {
            return this;
        }
        return this.unsafeRemove(key);
    }
    foldl(f, initial) {
        let node = this.root;
        if (node.isNonEmpty()) {
            const stack = [node];
            while (node.left.isNonEmpty()) {
                node = node.left;
                stack.push(node);
            }
            while (stack.length > 0) {
                const resultNode = stack.pop();
                node = resultNode.right;
                while (node.isNonEmpty()) {
                    stack.push(node);
                    node = node.left;
                }
                initial = f(initial, [resultNode.key, resultNode.value]);
            }
            return initial;
        }
        else {
            return initial;
        }
    }
    foldr(f, initial) {
        let node = this.root;
        if (node.isNonEmpty()) {
            const stack = [node];
            while (node.right.isNonEmpty()) {
                node = node.right;
                stack.push(node);
            }
            while (stack.length > 0) {
                const resultNode = stack.pop();
                node = resultNode.left;
                while (node.isNonEmpty()) {
                    stack.push(node);
                    node = node.right;
                }
                initial = f(initial, [resultNode.key, resultNode.value]);
            }
            return initial;
        }
        else {
            return initial;
        }
    }
    unsafeRemove(key) {
        return new OrdMap(this.compare, this.root.remove(this.compare, key));
    }
    keys() {
        return this.foldl(mutablePushKey, []);
    }
    values() {
        return this.foldl(mutablePushValue, []);
    }
    difference(other) {
        checkComparisonFuncEquality(this.compare, other.compare);
        let newMap = OrdMap.empty(this.compare);
        newMap = this.foldl((map, val) => (other.find(val[0]) === undefined ? map.insert(val[0], val[1]) : map), newMap);
        newMap = other.foldl((map, val) => (this.find(val[0]) === undefined ? map.insert(val[0], val[1]) : map), newMap);
        return newMap;
    }
    toArray() {
        return this.foldl(mutablePush, []);
    }
    toJSON() {
        return this.toArray();
    }
    reverseIterator() {
        return new ReverseIterator(this.root, getKvp);
    }
    [Symbol.iterator]() {
        return new ForwardIterator(this.root, getKvp);
    }
}
OrdMap.number = {
    empty() {
        return OrdMap.empty(numberLT);
    },
    of(key, value) {
        return OrdMap.of(key, value, numberLT);
    },
    from(iterable) {
        return OrdMap.from(iterable, numberLT);
    },
};
OrdMap.string = {
    empty() {
        return OrdMap.empty(stringLT);
    },
    of(key, value) {
        return OrdMap.of(key, value, stringLT);
    },
    from(iterable) {
        return OrdMap.from(iterable, stringLT);
    },
};
function mutablePushKey(arr, val) {
    arr.push(val[0]);
    return arr;
}
function mutablePushValue(arr, val) {
    arr.push(val[1]);
    return arr;
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
    static of(value, compare) {
        return new OrdSet(compare, NonEmptyNode.of(value, undefined));
    }
    static from(iterable, compare) {
        let t = OrdSet.empty(compare);
        for (const val of iterable) {
            t = t.insert(val);
        }
        return t;
    }
    get size() {
        return this.root.size;
    }
    has(key) {
        return this.root.isNonEmpty() ? this.root.find(this.compare, key) !== undefined : false;
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
        if (this.root.find(this.compare, key) === undefined) {
            return this;
        }
        return new OrdSet(this.compare, this.root.remove(this.compare, key));
    }
    foldl(f, initial) {
        let node = this.root;
        if (node.isNonEmpty()) {
            const stack = [node];
            while (node.left.isNonEmpty()) {
                node = node.left;
                stack.push(node);
            }
            while (stack.length > 0) {
                const resultNode = stack.pop();
                node = resultNode.right;
                while (node.isNonEmpty()) {
                    stack.push(node);
                    node = node.left;
                }
                initial = f(initial, resultNode.key);
            }
            return initial;
        }
        else {
            return initial;
        }
    }
    foldr(f, initial) {
        let node = this.root;
        if (node.isNonEmpty()) {
            const stack = [node];
            while (node.right.isNonEmpty()) {
                node = node.right;
                stack.push(node);
            }
            while (stack.length > 0) {
                const resultNode = stack.pop();
                node = resultNode.left;
                while (node.isNonEmpty()) {
                    stack.push(node);
                    node = node.right;
                }
                initial = f(initial, resultNode.key);
            }
            return initial;
        }
        else {
            return initial;
        }
    }
    union(other) {
        checkComparisonFuncEquality$1(this.compare, other.compare);
        let newSet = OrdSet.empty(this.compare);
        newSet = this.foldl((set, val) => set.insert(val), newSet);
        newSet = other.foldl((set, val) => set.insert(val), newSet);
        return newSet;
    }
    intersect(other) {
        checkComparisonFuncEquality$1(this.compare, other.compare);
        let newSet = OrdSet.empty(this.compare);
        newSet = other.foldl((set, val) => (this.has(val) ? set.insert(val) : set), newSet);
        return newSet;
    }
    difference(other) {
        checkComparisonFuncEquality$1(this.compare, other.compare);
        let newSet = OrdSet.empty(this.compare);
        newSet = this.foldl((set, val) => (other.has(val) ? set : set.insert(val)), newSet);
        newSet = this.foldl((set, val) => (this.has(val) ? set : set.insert(val)), newSet);
        return newSet;
    }
    toArray() {
        return this.foldl(mutablePush, []);
    }
    toJSON() {
        return this.toArray();
    }
    reverseIterator() {
        return new ReverseIterator(this.root, getKey);
    }
    [Symbol.iterator]() {
        return new ForwardIterator(this.root, getKey);
    }
}
OrdSet.number = {
    empty() {
        return OrdSet.empty(numberLT);
    },
    of(value) {
        return OrdSet.of(value, numberLT);
    },
    from(iterable) {
        return OrdSet.from(iterable, numberLT);
    },
};
OrdSet.string = {
    empty() {
        return OrdSet.empty(stringLT);
    },
    of(value) {
        return OrdSet.of(value, stringLT);
    },
    from(iterable) {
        return OrdSet.from(iterable, stringLT);
    },
};
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
