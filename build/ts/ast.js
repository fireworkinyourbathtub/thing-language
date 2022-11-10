"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhileStmt = exports.ReturnStmt = exports.IfStmt = exports.ForStmt = exports.FunctionStmt = exports.BlockStmt = exports.VarStmt = exports.PrintStmt = exports.ExprStmt = exports.ThisExpr = exports.SetExpr = exports.LogicalExpr = exports.GetExpr = exports.CallExpr = exports.AssignExpr = exports.NilLiteral = exports.BoolLiteral = exports.NumberLiteral = exports.StringLiteral = exports.VarExpr = exports.UnaryExpr = exports.BinaryExpr = exports.LogicalOperator = exports.UnaryOperator = exports.BinaryOperator = void 0;
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
class BinaryExpr {
    constructor(left, right, op) {
        this.left = left;
        this.right = right;
        this.op = op;
    }
    accept(visitor) { visitor.visitBinaryExpr(this); }
}
exports.BinaryExpr = BinaryExpr;
class UnaryExpr {
    constructor(operator, operand) {
        this.operator = operator;
        this.operand = operand;
    }
    accept(visitor) { visitor.visitUnaryExpr(this); }
}
exports.UnaryExpr = UnaryExpr;
class VarExpr {
    constructor(name) {
        this.name = name;
    }
    accept(visitor) { visitor.visitVarExpr(this); }
}
exports.VarExpr = VarExpr;
class StringLiteral {
    constructor(value) {
        this.value = value;
    }
    accept(visitor) { visitor.visitStringLiteral(this); }
}
exports.StringLiteral = StringLiteral;
class NumberLiteral {
    constructor(value) {
        this.value = value;
    }
    accept(visitor) { visitor.visitNumberLiteral(this); }
}
exports.NumberLiteral = NumberLiteral;
class BoolLiteral {
    constructor(value) {
        this.value = value;
    }
    accept(visitor) { visitor.visitBoolLiteral(this); }
}
exports.BoolLiteral = BoolLiteral;
class NilLiteral {
    constructor() { }
    accept(visitor) { visitor.visitNilLiteral(this); }
}
exports.NilLiteral = NilLiteral;
class AssignExpr {
    constructor(name, value) {
        this.name = name;
    }
    accept(visitor) { visitor.visitAssignExpr(this); }
}
exports.AssignExpr = AssignExpr;
class CallExpr {
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    accept(visitor) { visitor.visitCallExpr(this); }
}
exports.CallExpr = CallExpr;
class GetExpr {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    accept(visitor) { visitor.visitGetExpr(this); }
}
exports.GetExpr = GetExpr;
class LogicalExpr {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) { visitor.visitLogicalExpr(this); }
}
exports.LogicalExpr = LogicalExpr;
class SetExpr {
    constructor(object, name, value) {
        this.object = object;
        this.name = name;
        this.value = value;
    }
    accept(visitor) { visitor.visitSetExpr(this); }
}
exports.SetExpr = SetExpr;
class ThisExpr {
    constructor(keyword) {
        this.keyword = keyword;
    }
    accept(visitor) { visitor.visitThisExpr(this); }
}
exports.ThisExpr = ThisExpr;
class ExprStmt {
    constructor(expr) {
        this.expr = expr;
    }
    accept(visitor) { visitor.visitExprStmt(this); }
}
exports.ExprStmt = ExprStmt;
class PrintStmt {
    constructor(expr) {
        this.expr = expr;
    }
    accept(visitor) { visitor.visitPrintStmt(this); }
}
exports.PrintStmt = PrintStmt;
class VarStmt {
    constructor(name, initializer) {
        this.name = name;
        this.initializer = initializer;
    }
    accept(visitor) { visitor.visitVarStmt(this); }
}
exports.VarStmt = VarStmt;
class BlockStmt {
    constructor(stmts) {
        this.stmts = stmts;
    }
    accept(visitor) { visitor.visitBlockStmt(this); }
}
exports.BlockStmt = BlockStmt;
// export class ClassStmt implements Stmt {
// constructor(name: string, List<Stmt.Function> methods) {}
// accept(visitor: StmtVisitor) { visitor.visitClassStmt(this); }
// }
class FunctionStmt {
    constructor(name, param, body) {
        this.name = name;
        this.param = param;
        this.body = body;
    }
    accept(visitor) { visitor.visitFunctionStmt(this); }
}
exports.FunctionStmt = FunctionStmt;
class ForStmt {
    constructor(initializer, compare, increment, body) {
        this.initializer = initializer;
        this.compare = compare;
        this.increment = increment;
        this.body = body;
    }
    accept(visitor) { visitor.visitForStmt(this); }
}
exports.ForStmt = ForStmt;
class IfStmt {
    constructor(condition, then_branch, else_branch) {
        this.condition = condition;
        this.then_branch = then_branch;
        this.else_branch = else_branch;
    }
    accept(visitor) { visitor.visitIfStmt(this); }
}
exports.IfStmt = IfStmt;
class ReturnStmt {
    constructor(value) {
        this.value = value;
    }
    accept(visitor) { visitor.visitReturnStmt(this); }
}
exports.ReturnStmt = ReturnStmt;
class WhileStmt {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
    }
    accept(visitor) { visitor.visitWhileStmt(this); }
}
exports.WhileStmt = WhileStmt;
