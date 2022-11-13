"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicalOperator = exports.UnaryOperator = exports.BinaryOperator = void 0;
// | ClassStmt
var BinaryOperator;
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["Plus"] = 0] = "Plus";
    BinaryOperator[BinaryOperator["Minus"] = 1] = "Minus";
    BinaryOperator[BinaryOperator["Star"] = 2] = "Star";
    BinaryOperator[BinaryOperator["Slash"] = 3] = "Slash";
    BinaryOperator[BinaryOperator["Less"] = 4] = "Less";
    BinaryOperator[BinaryOperator["Greater"] = 5] = "Greater";
    BinaryOperator[BinaryOperator["LessEqual"] = 6] = "LessEqual";
    BinaryOperator[BinaryOperator["GreaterEqual"] = 7] = "GreaterEqual";
    BinaryOperator[BinaryOperator["EqualEqual"] = 8] = "EqualEqual";
    BinaryOperator[BinaryOperator["BangEqual"] = 9] = "BangEqual";
})(BinaryOperator = exports.BinaryOperator || (exports.BinaryOperator = {}));
var UnaryOperator;
(function (UnaryOperator) {
    UnaryOperator[UnaryOperator["Minus"] = 0] = "Minus";
    UnaryOperator[UnaryOperator["Bang"] = 1] = "Bang";
})(UnaryOperator = exports.UnaryOperator || (exports.UnaryOperator = {}));
var LogicalOperator;
(function (LogicalOperator) {
    LogicalOperator[LogicalOperator["And"] = 0] = "And";
    LogicalOperator[LogicalOperator["Or"] = 1] = "Or";
})(LogicalOperator = exports.LogicalOperator || (exports.LogicalOperator = {}));
