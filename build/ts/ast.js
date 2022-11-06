"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Literal = exports.UnaryExpr = exports.UnaryOperator = exports.BinaryExpr = exports.BinaryOperator = exports.Expr = exports.AST = void 0;
class AST {
}
exports.AST = AST;
class Expr extends AST {
}
exports.Expr = Expr;
var BinaryOperator;
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["Plus"] = 0] = "Plus";
    BinaryOperator[BinaryOperator["Minus"] = 1] = "Minus";
    BinaryOperator[BinaryOperator["Star"] = 2] = "Star";
    BinaryOperator[BinaryOperator["Slash"] = 3] = "Slash";
    BinaryOperator[BinaryOperator["Less"] = 4] = "Less";
    BinaryOperator[BinaryOperator["Equal"] = 5] = "Equal";
    BinaryOperator[BinaryOperator["Greater"] = 6] = "Greater";
    BinaryOperator[BinaryOperator["Bang"] = 7] = "Bang";
    BinaryOperator[BinaryOperator["LessEqual"] = 8] = "LessEqual";
    BinaryOperator[BinaryOperator["EqualEqual"] = 9] = "EqualEqual";
    BinaryOperator[BinaryOperator["GreaterEqual"] = 10] = "GreaterEqual";
    BinaryOperator[BinaryOperator["BangEqual"] = 11] = "BangEqual";
})(BinaryOperator = exports.BinaryOperator || (exports.BinaryOperator = {}));
class BinaryExpr extends Expr {
    constructor(left, right, op) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }
}
exports.BinaryExpr = BinaryExpr;
var UnaryOperator;
(function (UnaryOperator) {
    UnaryOperator[UnaryOperator["Minus"] = 0] = "Minus";
    UnaryOperator[UnaryOperator["Bang"] = 1] = "Bang";
})(UnaryOperator = exports.UnaryOperator || (exports.UnaryOperator = {}));
class UnaryExpr extends Expr {
    constructor(operator, operand) {
        super();
        this.operator = operator;
        this.operand = operand;
    }
}
exports.UnaryExpr = UnaryExpr;
class Literal extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }
}
exports.Literal = Literal;
