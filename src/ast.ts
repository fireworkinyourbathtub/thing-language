import * as lexer from './lexer';

export abstract class AST { thing() {} }

export abstract class Expr extends AST {}

export enum BinaryOperator {
    Plus, Minus, Star, Slash,
    Less, Equal, Greater, Bang,
    LessEqual, EqualEqual, GreaterEqual, BangEqual,
}

export enum UnaryOperator {
    Minus,
    Bang,
}

export enum LogicalOperator {
    And,
    Or,
}

export class BinaryExpr extends Expr {
    constructor(public left: Expr, public right: Expr, public op: BinaryOperator) { super() }
}
export class UnaryExpr extends Expr {
    constructor(public operator: UnaryOperator, public operand: Expr) { super() }
}
export class VarExpr extends Expr {
    constructor(public name: string) { super() }
}
export class Literal<T> extends Expr {
    constructor(public value: T) { super() }
}
export class AssignExpr extends Expr {
    constructor(public name: string, value: Expr) { super() }
}
export class CallExpr extends Expr {
    constructor(public callee: Expr, public args: Expr[]) { super() }
}
export class GetExpr extends Expr {
    constructor(public object: Expr, public name: string) { super() }
}
export class LogicalExpr extends Expr {
    constructor(public left: Expr, public operator: LogicalOperator, public right: Expr) { super() }
}
export class SetExpr extends Expr {
    constructor(public object: Expr, public name: string, public value: Expr) { super() }
}
export class ThisExpr extends Expr {
    constructor(public keyword: lexer.This) { super() }
}

// export class SuperExpr extends Expr {
    // constructor(keyword: Token, method: ) { super() }
// }

export abstract class Stmt extends AST {}

export class ExprStmt extends Stmt {
    constructor(public expr: Expr) { super() }
}
export class PrintStmt extends Stmt {
    constructor(public expr: Expr) { super() }
}
export class VarStmt extends Stmt {
    constructor(public name: string, public initializer: Expr | null) { super() }
}
export class BlockStmt extends Stmt {
    constructor(public stmts: Stmt[]) { super() }
}
// export class ClassStmt extends Stmt {
    // constructor(name: string, List<Stmt.Function> methods) { super() }
// }
export class FunctionStmt extends Stmt {
    constructor(public name: string, public param: string[], public body: BlockStmt) { super() }
}
export class ForStmt extends Stmt {
    constructor(public initializer: Stmt | null, public compare: Expr | null, public increment: Expr | null, public body: Stmt) { super() }
}
export class IfStmt extends Stmt {
    constructor(public condition: Expr, public then_branch: Stmt, public else_branch: Stmt | null) { super() }
}
export class ReturnStmt extends Stmt {
    constructor(public value: Expr | null) { super() }
}
export class WhileStmt extends Stmt {
    constructor(public condition: Expr, public body: Stmt) { super() }
}
