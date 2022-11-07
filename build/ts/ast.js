"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhileStmt = exports.ReturnStmt = exports.IfStmt = exports.ForStmt = exports.FunctionStmt = exports.BlockStmt = exports.VarDecl = exports.PrintStmt = exports.ExprStmt = exports.Stmt = exports.ThisExpr = exports.SetExpr = exports.LogicalExpr = exports.GetExpr = exports.CallExpr = exports.AssignExpr = exports.Literal = exports.VarExpr = exports.UnaryExpr = exports.BinaryExpr = exports.LogicalOperator = exports.UnaryOperator = exports.BinaryOperator = exports.Expr = exports.AST = void 0;
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
class BinaryExpr extends Expr {
    constructor(left, right, op) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }
}
exports.BinaryExpr = BinaryExpr;
class UnaryExpr extends Expr {
    constructor(operator, operand) {
        super();
        this.operator = operator;
        this.operand = operand;
    }
}
exports.UnaryExpr = UnaryExpr;
class VarExpr extends Expr {
    constructor(name) {
        super();
        this.name = name;
    }
}
exports.VarExpr = VarExpr;
class Literal extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }
}
exports.Literal = Literal;
class AssignExpr extends Expr {
    constructor(name, value) {
        super();
        this.name = name;
    }
}
exports.AssignExpr = AssignExpr;
class CallExpr extends Expr {
    constructor(callee, args) {
        super();
        this.callee = callee;
        this.args = args;
    }
}
exports.CallExpr = CallExpr;
class GetExpr extends Expr {
    constructor(object, name) {
        super();
        this.object = object;
        this.name = name;
    }
}
exports.GetExpr = GetExpr;
class LogicalExpr extends Expr {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}
exports.LogicalExpr = LogicalExpr;
class SetExpr extends Expr {
    constructor(object, name, value) {
        super();
        this.object = object;
        this.name = name;
        this.value = value;
    }
}
exports.SetExpr = SetExpr;
class ThisExpr extends Expr {
    constructor(keyword) {
        super();
        this.keyword = keyword;
    }
}
exports.ThisExpr = ThisExpr;
// export class SuperExpr extends Expr {
// constructor(keyword: Token, method: ) { super() }
// }
class Stmt extends AST {
}
exports.Stmt = Stmt;
class ExprStmt extends Stmt {
    constructor(expr) {
        super();
        this.expr = expr;
    }
}
exports.ExprStmt = ExprStmt;
class PrintStmt extends Stmt {
    constructor(expr) {
        super();
        this.expr = expr;
    }
}
exports.PrintStmt = PrintStmt;
class VarDecl extends Stmt {
    constructor(name, initializer) {
        super();
        this.name = name;
        this.initializer = initializer;
    }
}
exports.VarDecl = VarDecl;
class BlockStmt extends Stmt {
    constructor(stmts) { super(); }
}
exports.BlockStmt = BlockStmt;
// export class ClassStmt extends Stmt {
// constructor(name: string, List<Stmt.Function> methods) { super() }
// }
class FunctionStmt extends Stmt {
    constructor(name, param, body) { super(); }
}
exports.FunctionStmt = FunctionStmt;
class ForStmt extends Stmt {
    constructor(initializer, compare, increment, body) { super(); }
}
exports.ForStmt = ForStmt;
class IfStmt extends Stmt {
    constructor(condition, then_branch, else_branch) { super(); }
}
exports.IfStmt = IfStmt;
class ReturnStmt extends Stmt {
    constructor(value) { super(); }
}
exports.ReturnStmt = ReturnStmt;
class WhileStmt extends Stmt {
    constructor(condition, body) { super(); }
}
exports.WhileStmt = WhileStmt;
