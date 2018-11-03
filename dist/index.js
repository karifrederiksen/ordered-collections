'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

var ForwardIterator = /** @class */ (function () {
    function ForwardIterator(node, f) {
        this.f = f;
        var stack = [node];
        var n = node;
        while (n.left.isNonEmpty()) {
            n = n.left;
            stack.push(n);
        }
        this.stack = stack;
    }
    ForwardIterator.prototype.next = function () {
        var stack = this.stack;
        if (stack.length === 0)
            return { done: true };
        var resultNode = stack.pop();
        var node = resultNode.right;
        while (node.isNonEmpty()) {
            stack.push(node);
            node = node.left;
        }
        return { done: false, value: this.f(resultNode) };
    };
    return ForwardIterator;
}());
var ReverseIterator = /** @class */ (function () {
    function ReverseIterator(node, f) {
        this.f = f;
        var stack = [node];
        var n = node;
        while (n.right.isNonEmpty()) {
            n = n.right;
            stack.push(n);
        }
        this.stack = stack;
    }
    ReverseIterator.prototype.next = function () {
        var stack = this.stack;
        if (stack.length === 0)
            return { done: true };
        var resultNode = stack.pop();
        var node = resultNode.left;
        while (node.isNonEmpty()) {
            stack.push(node);
            node = node.right;
        }
        return { done: false, value: this.f(resultNode) };
    };
    return ReverseIterator;
}());
var EMPTY_ITER = {
    next: function () { return ({ done: true }); },
};

var EmptyNode = /** @class */ (function () {
    function EmptyNode() {
    }
    Object.defineProperty(EmptyNode.prototype, "size", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmptyNode.prototype, "color", {
        get: function () {
            return 1 /* Black */;
        },
        enumerable: true,
        configurable: true
    });
    EmptyNode.prototype.asBlack = function () {
        return this;
    };
    EmptyNode.prototype.isNonEmpty = function () {
        return false;
    };
    EmptyNode.prototype.find = function (_compare, _key) {
        return undefined;
    };
    EmptyNode.prototype.min = function () {
        return undefined;
    };
    EmptyNode.prototype.max = function () {
        return undefined;
    };
    EmptyNode.prototype.insert = function (compare, key, value) {
        return this.ins(compare, key, value);
    };
    EmptyNode.prototype.ins = function (_compare, key, value) {
        return NonEmptyNode.of(key, value);
    };
    EmptyNode.prototype.remove = function (_compare, _key) {
        return this;
    };
    EmptyNode.prototype.rem = function (_compare, _key) {
        return this;
    };
    return EmptyNode;
}());
var EMPTY_NODE = new EmptyNode();
var NonEmptyNode = /** @class */ (function () {
    function NonEmptyNode(key, value, left, right, color) {
        this.key = key;
        this.value = value;
        this.left = left;
        this.right = right;
        this.color = color;
        this.size = left.size + right.size + 1;
    }
    NonEmptyNode.of = function (key, value) {
        return new NonEmptyNode(key, value, EMPTY_NODE, EMPTY_NODE, 0 /* Red */);
    };
    NonEmptyNode.prototype.asBlack = function () {
        if (this.color === 1 /* Black */) {
            return this;
        }
        else {
            return new NonEmptyNode(this.key, this.value, this.left, this.right, 1 /* Black */);
        }
    };
    NonEmptyNode.prototype.isNonEmpty = function () {
        return true;
    };
    NonEmptyNode.prototype.find = function (compare, key) {
        var node = this;
        while (node.isNonEmpty()) {
            if (compare(key, node.key))
                node = node.left;
            else if (compare(node.key, key))
                node = node.right;
            else
                return node;
        }
        return undefined;
    };
    NonEmptyNode.prototype.min = function () {
        var node = this;
        while (node.left.isNonEmpty()) {
            node = node.left;
        }
        return node;
    };
    NonEmptyNode.prototype.max = function () {
        var node = this;
        while (node.right.isNonEmpty()) {
            node = node.right;
        }
        return node;
    };
    NonEmptyNode.prototype.insert = function (compare, key, value) {
        return this.ins(compare, key, value).asBlack();
    };
    NonEmptyNode.prototype.ins = function (compare, key, value) {
        if (compare(key, this.key)) {
            return balanceLeft(this.key, this.value, this.left.ins(compare, key, value), this.right, this.color);
        }
        if (compare(this.key, key)) {
            return balanceRight(this.key, this.value, this.left, this.right.ins(compare, key, value), this.color);
        }
        return new NonEmptyNode(key, value, this.left, this.right, this.color);
    };
    NonEmptyNode.prototype.remove = function (compare, key) {
        return this.rem(compare, key).asBlack();
    };
    NonEmptyNode.prototype.rem = function (compare, key) {
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
    };
    return NonEmptyNode;
}());
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
        var t_ = t;
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
        var trLeft = tr.left;
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
        var tlRight = tl.right;
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
        var bc = append(tl.right, tr.left);
        if (bc.color === 0 /* Red */) {
            return new NonEmptyNode(bc.key, bc.value, new NonEmptyNode(tl.key, tl.value, tl.left, bc.left, 0 /* Red */), new NonEmptyNode(tr.key, tr.value, bc.right, tr.right, 0 /* Red */), 0 /* Red */);
        }
        return new NonEmptyNode(tl.key, tl.value, tl.left, new NonEmptyNode(tr.key, tr.value, bc, tr.right, 0 /* Red */), 0 /* Red */);
    }
    if (tl.color === 1 /* Black */ && tr.color === 1 /* Black */) {
        var bc = append(tl.right, tr.left);
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

var OrdMap = /** @class */ (function () {
    function OrdMap(compare, root) {
        this.compare = compare;
        this.root = root;
    }
    OrdMap.empty = function (compare) {
        return new OrdMap(compare, EMPTY_NODE);
    };
    OrdMap.emptyNumberKeyed = function () {
        return OrdMap.empty(numberLT);
    };
    OrdMap.emptyStringKeyed = function () {
        return OrdMap.empty(stringLT);
    };
    OrdMap.of = function (key, value, compare) {
        return new OrdMap(compare, NonEmptyNode.of(key, value));
    };
    OrdMap.ofNumberKeyed = function (key, value) {
        return OrdMap.of(key, value, numberLT);
    };
    OrdMap.ofStringKeyed = function (key, value) {
        return OrdMap.of(key, value, stringLT);
    };
    OrdMap.from = function (iterable, compare) {
        var e_1, _a;
        var t = OrdMap.empty(compare);
        try {
            for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var val = iterable_1_1.value;
                t = t.insert(val[0], val[1]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return t;
    };
    OrdMap.fromNumberKeyed = function (iterable) {
        return OrdMap.from(iterable, numberLT);
    };
    OrdMap.fromStringKeyed = function (iterable) {
        return OrdMap.from(iterable, stringLT);
    };
    Object.defineProperty(OrdMap.prototype, "size", {
        get: function () {
            return this.root.size;
        },
        enumerable: true,
        configurable: true
    });
    OrdMap.prototype.find = function (key) {
        var node = this.root.find(this.compare, key);
        return node !== undefined ? node.value : undefined;
    };
    OrdMap.prototype.min = function () {
        var node = this.root.min();
        if (node === undefined) {
            return undefined;
        }
        return [node.key, node.value];
    };
    OrdMap.prototype.max = function () {
        if (this.root.isNonEmpty())
            return undefined;
        var node = this.root.max();
        if (node === undefined) {
            return undefined;
        }
        return [node.key, node.value];
    };
    OrdMap.prototype.insert = function (key, value) {
        return new OrdMap(this.compare, this.root.insert(this.compare, key, value));
    };
    OrdMap.prototype.remove = function (key) {
        if (this.root.find(this.compare, key) === undefined) {
            return this;
        }
        return this.unsafeRemove(key);
    };
    OrdMap.prototype.unsafeRemove = function (key) {
        return new OrdMap(this.compare, this.root.remove(this.compare, key));
    };
    OrdMap.prototype.keys = function () {
        var e_2, _a;
        var arr = [];
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                arr.push(val[0]);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return arr;
    };
    OrdMap.prototype.values = function () {
        var e_3, _a;
        var arr = [];
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                arr.push(val[1]);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return arr;
    };
    OrdMap.prototype.difference = function (other) {
        var e_4, _a, e_5, _b;
        checkComparisonFuncEquality(this.compare, other.compare);
        var newMap = OrdMap.empty(this.compare);
        try {
            for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                var val = _d.value;
                if (other.find(val[0]) === undefined) {
                    newMap = newMap.insert(val[0], val[1]);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            for (var other_1 = __values(other), other_1_1 = other_1.next(); !other_1_1.done; other_1_1 = other_1.next()) {
                var val = other_1_1.value;
                if (this.find(val[0]) === undefined) {
                    newMap = newMap.insert(val[0], val[1]);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (other_1_1 && !other_1_1.done && (_b = other_1.return)) _b.call(other_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return newMap;
    };
    OrdMap.prototype.toArray = function () {
        var e_6, _a;
        var arr = [];
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                arr.push(val);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return arr;
    };
    OrdMap.prototype.toJSON = function () {
        return this.toArray();
    };
    OrdMap.prototype.reverseIterator = function () {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ReverseIterator(this.root, getKvp);
    };
    OrdMap.prototype[Symbol.iterator] = function () {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ForwardIterator(this.root, getKvp);
    };
    return OrdMap;
}());
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

var OrdSet = /** @class */ (function () {
    function OrdSet(compare, root) {
        this.compare = compare;
        this.root = root;
    }
    OrdSet.empty = function (compare) {
        return new OrdSet(compare, EMPTY_NODE);
    };
    OrdSet.emptyNumber = function () {
        return OrdSet.empty(numberLT);
    };
    OrdSet.emptyString = function () {
        return OrdSet.empty(stringLT);
    };
    OrdSet.of = function (value, compare) {
        return new OrdSet(compare, NonEmptyNode.of(value, undefined));
    };
    OrdSet.ofNumber = function (value) {
        return OrdSet.of(value, numberLT);
    };
    OrdSet.ofString = function (value) {
        return OrdSet.of(value, stringLT);
    };
    OrdSet.from = function (iterable, compare) {
        var e_1, _a;
        var t = OrdSet.empty(compare);
        try {
            for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var val = iterable_1_1.value;
                t = t.insert(val);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return t;
    };
    OrdSet.fromNumbers = function (iterable) {
        return OrdSet.from(iterable, numberLT);
    };
    OrdSet.fromStrings = function (iterable) {
        return OrdSet.from(iterable, stringLT);
    };
    Object.defineProperty(OrdSet.prototype, "size", {
        get: function () {
            return this.root.size;
        },
        enumerable: true,
        configurable: true
    });
    OrdSet.prototype.has = function (key) {
        return this.root.isNonEmpty() ? this.root.find(this.compare, key) !== undefined : false;
    };
    OrdSet.prototype.min = function () {
        var node = this.root.min();
        if (node === undefined) {
            return undefined;
        }
        return node.key;
    };
    OrdSet.prototype.max = function () {
        var node = this.root.max();
        if (node === undefined) {
            return undefined;
        }
        return node.key;
    };
    OrdSet.prototype.insert = function (value) {
        return new OrdSet(this.compare, this.root.insert(this.compare, value, undefined));
    };
    OrdSet.prototype.remove = function (key) {
        if (this.root.find(this.compare, key) === undefined) {
            return this;
        }
        return new OrdSet(this.compare, this.root.remove(this.compare, key));
    };
    OrdSet.prototype.union = function (other) {
        var e_2, _a, e_3, _b;
        checkComparisonFuncEquality$1(this.compare, other.compare);
        var newSet = OrdSet.empty(this.compare);
        try {
            for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                var val = _d.value;
                newSet = newSet.insert(val);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            for (var other_1 = __values(other), other_1_1 = other_1.next(); !other_1_1.done; other_1_1 = other_1.next()) {
                var val = other_1_1.value;
                newSet = newSet.insert(val);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (other_1_1 && !other_1_1.done && (_b = other_1.return)) _b.call(other_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return newSet;
    };
    OrdSet.prototype.intersect = function (other) {
        var e_4, _a;
        checkComparisonFuncEquality$1(this.compare, other.compare);
        var newSet = OrdSet.empty(this.compare);
        try {
            for (var other_2 = __values(other), other_2_1 = other_2.next(); !other_2_1.done; other_2_1 = other_2.next()) {
                var val = other_2_1.value;
                if (this.has(val)) {
                    newSet = newSet.insert(val);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (other_2_1 && !other_2_1.done && (_a = other_2.return)) _a.call(other_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return newSet;
    };
    OrdSet.prototype.difference = function (other) {
        var e_5, _a, e_6, _b;
        checkComparisonFuncEquality$1(this.compare, other.compare);
        var newSet = OrdSet.empty(this.compare);
        try {
            for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                var val = _d.value;
                if (!other.has(val)) {
                    newSet = newSet.insert(val);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        try {
            for (var other_3 = __values(other), other_3_1 = other_3.next(); !other_3_1.done; other_3_1 = other_3.next()) {
                var val = other_3_1.value;
                if (!this.has(val)) {
                    newSet = newSet.insert(val);
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (other_3_1 && !other_3_1.done && (_b = other_3.return)) _b.call(other_3);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return newSet;
    };
    OrdSet.prototype.toArray = function () {
        var e_7, _a;
        var arr = [];
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                arr.push(val);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return arr;
    };
    OrdSet.prototype.toJSON = function () {
        return this.toArray();
    };
    OrdSet.prototype.reverseIterator = function () {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ReverseIterator(this.root, getKey);
    };
    OrdSet.prototype[Symbol.iterator] = function () {
        if (!this.root.isNonEmpty())
            return EMPTY_ITER;
        return new ForwardIterator(this.root, getKey);
    };
    return OrdSet;
}());
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
