"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhileStmt = exports.ReturnStmt = exports.IfStmt = exports.ForStmt = exports.FunctionStmt = exports.BlockStmt = exports.VarStmt = exports.PrintStmt = exports.ExprStmt = exports.LogicalExpr = exports.CallExpr = exports.AssignExpr = exports.NilLiteral = exports.BoolLiteral = exports.NumberLiteral = exports.StringLiteral = exports.VarExpr = exports.UnaryExpr = exports.BinaryExpr = exports.LogicalOperator = exports.UnaryOperator = exports.BinaryOperator = void 0;
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
    constructor(span, left, right, op) {
        this.span = span;
        this.left = left;
        this.right = right;
        this.op = op;
    }
    accept(visitor) { return visitor.visitBinaryExpr(this); }
}
exports.BinaryExpr = BinaryExpr;
class UnaryExpr {
    constructor(span, operator, operand) {
        this.span = span;
        this.operator = operator;
        this.operand = operand;
    }
    accept(visitor) { return visitor.visitUnaryExpr(this); }
}
exports.UnaryExpr = UnaryExpr;
class VarExpr {
    constructor(span, name) {
        this.span = span;
        this.name = name;
    }
    accept(visitor) { return visitor.visitVarExpr(this); }
}
exports.VarExpr = VarExpr;
class StringLiteral {
    constructor(span, value) {
        this.span = span;
        this.value = value;
    }
    accept(visitor) { return visitor.visitStringLiteral(this); }
}
exports.StringLiteral = StringLiteral;
class NumberLiteral {
    constructor(span, value) {
        this.span = span;
        this.value = value;
    }
    accept(visitor) { return visitor.visitNumberLiteral(this); }
}
exports.NumberLiteral = NumberLiteral;
class BoolLiteral {
    constructor(span, value) {
        this.span = span;
        this.value = value;
    }
    accept(visitor) { return visitor.visitBoolLiteral(this); }
}
exports.BoolLiteral = BoolLiteral;
class NilLiteral {
    constructor(span) {
        this.span = span;
    }
    accept(visitor) { return visitor.visitNilLiteral(this); }
}
exports.NilLiteral = NilLiteral;
class AssignExpr {
    constructor(span, name, value) {
        this.span = span;
        this.name = name;
    }
    accept(visitor) { return visitor.visitAssignExpr(this); }
}
exports.AssignExpr = AssignExpr;
class CallExpr {
    constructor(span, callee, args) {
        this.span = span;
        this.callee = callee;
        this.args = args;
    }
    accept(visitor) { return visitor.visitCallExpr(this); }
}
exports.CallExpr = CallExpr;
// export class GetExpr implements Expr {
// constructor(public span: diagnostics.Span, public object: Expr, public name: string) {}
// accept<T>(visitor: ExprVisitor<T>) { return visitor.visitGetExpr(this); }
// }
class LogicalExpr {
    constructor(span, left, operator, right) {
        this.span = span;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) { return visitor.visitLogicalExpr(this); }
}
exports.LogicalExpr = LogicalExpr;
class ExprStmt {
    constructor(span, expr) {
        this.span = span;
        this.expr = expr;
    }
    accept(visitor) { return visitor.visitExprStmt(this); }
}
exports.ExprStmt = ExprStmt;
class PrintStmt {
    constructor(span, expr) {
        this.span = span;
        this.expr = expr;
    }
    accept(visitor) { return visitor.visitPrintStmt(this); }
}
exports.PrintStmt = PrintStmt;
class VarStmt {
    constructor(span, name, initializer) {
        this.span = span;
        this.name = name;
        this.initializer = initializer;
    }
    accept(visitor) { return visitor.visitVarStmt(this); }
}
exports.VarStmt = VarStmt;
class BlockStmt {
    constructor(span, stmts) {
        this.span = span;
        this.stmts = stmts;
    }
    accept(visitor) { return visitor.visitBlockStmt(this); }
}
exports.BlockStmt = BlockStmt;
// export class ClassStmt implements Stmt {
// constructor(public span: diagnostics.Span, name: string, List<Stmt.Function> methods) {}
// accept<T>(visitor: StmtVisitor<T>) { return visitor.visitClassStmt(this); }
// }
class FunctionStmt {
    constructor(span, name, params, body) {
        this.span = span;
        this.name = name;
        this.params = params;
        this.body = body;
    }
    accept(visitor) { return visitor.visitFunctionStmt(this); }
}
exports.FunctionStmt = FunctionStmt;
class ForStmt {
    constructor(span, initializer, compare, increment, body) {
        this.span = span;
        this.initializer = initializer;
        this.compare = compare;
        this.increment = increment;
        this.body = body;
    }
    accept(visitor) { return visitor.visitForStmt(this); }
}
exports.ForStmt = ForStmt;
class IfStmt {
    constructor(span, condition, then_branch, else_branch) {
        this.span = span;
        this.condition = condition;
        this.then_branch = then_branch;
        this.else_branch = else_branch;
    }
    accept(visitor) { return visitor.visitIfStmt(this); }
}
exports.IfStmt = IfStmt;
class ReturnStmt {
    constructor(span, value) {
        this.span = span;
        this.value = value;
    }
    accept(visitor) { return visitor.visitReturnStmt(this); }
}
exports.ReturnStmt = ReturnStmt;
class WhileStmt {
    constructor(span, condition, body) {
        this.span = span;
        this.condition = condition;
        this.body = body;
    }
    accept(visitor) { return visitor.visitWhileStmt(this); }
}
exports.WhileStmt = WhileStmt;
