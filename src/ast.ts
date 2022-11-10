import * as lexer from './lexer';

export interface AST {}

interface ExprVisitor {
    visitBinaryExpr(ast: BinaryExpr): void;
    visitUnaryExpr(ast: UnaryExpr): void;
    visitVarExpr(ast: VarExpr): void;
    visitStringLiteral(ast: StringLiteral): void;
    visitNumberLiteral(ast: NumberLiteral): void;
    visitBoolLiteral(ast: BoolLiteral): void;
    visitNilLiteral(ast: NilLiteral): void;
    visitAssignExpr(ast: AssignExpr): void;
    visitCallExpr(ast: CallExpr): void;
    visitGetExpr(ast: GetExpr): void;
    visitLogicalExpr(ast: LogicalExpr): void;
    visitSetExpr(ast: SetExpr): void;
    visitThisExpr(ast: ThisExpr): void;

    // visit(ast: SuperExpr): void;
}

export interface Expr extends AST {
    accept(visitor: ExprVisitor): void;
}

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

export class BinaryExpr implements Expr {
    constructor(public left: Expr, public right: Expr, public op: BinaryOperator) {}
    accept(visitor: ExprVisitor) { visitor.visitBinaryExpr(this); }
}
export class UnaryExpr implements Expr {
    constructor(public operator: UnaryOperator, public operand: Expr) {}
    accept(visitor: ExprVisitor) { visitor.visitUnaryExpr(this); }
}
export class VarExpr implements Expr {
    constructor(public name: string) {}
    accept(visitor: ExprVisitor) { visitor.visitVarExpr(this); }
}
export class StringLiteral implements Expr {
    constructor(public value: string) {}
    accept(visitor: ExprVisitor) { visitor.visitStringLiteral(this); }
}
export class NumberLiteral implements Expr {
    constructor(public value: number) {}
    accept(visitor: ExprVisitor) { visitor.visitNumberLiteral(this); }
}
export class BoolLiteral implements Expr {
    constructor(public value: boolean) {}
    accept(visitor: ExprVisitor) { visitor.visitBoolLiteral(this); }
}
export class NilLiteral implements Expr {
    constructor() {}
    accept(visitor: ExprVisitor) { visitor.visitNilLiteral(this); }
}
export class AssignExpr implements Expr {
    constructor(public name: string, value: Expr) {}
    accept(visitor: ExprVisitor) { visitor.visitAssignExpr(this); }
}
export class CallExpr implements Expr {
    constructor(public callee: Expr, public args: Expr[]) {}
    accept(visitor: ExprVisitor) { visitor.visitCallExpr(this); }
}
export class GetExpr implements Expr {
    constructor(public object: Expr, public name: string) {}
    accept(visitor: ExprVisitor) { visitor.visitGetExpr(this); }
}
export class LogicalExpr implements Expr {
    constructor(public left: Expr, public operator: LogicalOperator, public right: Expr) {}
    accept(visitor: ExprVisitor) { visitor.visitLogicalExpr(this); }
}
export class SetExpr implements Expr {
    constructor(public object: Expr, public name: string, public value: Expr) {}
    accept(visitor: ExprVisitor) { visitor.visitSetExpr(this); }
}
export class ThisExpr implements Expr {
    constructor(public keyword: lexer.This) {}
    accept(visitor: ExprVisitor) { visitor.visitThisExpr(this); }
}

// export class SuperExpr implements Expr {
// constructor(keyword: Token, method: ) {}
// accept(visitor: ExprVisitor) { visitor.visitSuperExpr(this); }
// }

interface StmtVisitor {
    visitExprStmt(ast: ExprStmt): void;
    visitPrintStmt(ast: PrintStmt): void;
    visitVarStmt(ast: VarStmt): void;
    visitBlockStmt(ast: BlockStmt): void;
    // visitClassStmt(ast: ClassStmt): void;
    visitFunctionStmt(ast: FunctionStmt): void;
    visitForStmt(ast: ForStmt): void;
    visitIfStmt(ast: IfStmt): void;
    visitReturnStmt(ast: ReturnStmt): void;
    visitWhileStmt(ast: WhileStmt): void;
}
export interface Stmt extends AST {
    accept(visitor: StmtVisitor): void;
}

export class ExprStmt implements Stmt {
    constructor(public expr: Expr) {}
    accept(visitor: StmtVisitor) { visitor.visitExprStmt(this); }
}
export class PrintStmt implements Stmt {
    constructor(public expr: Expr) {}
    accept(visitor: StmtVisitor) { visitor.visitPrintStmt(this); }
}
export class VarStmt implements Stmt {
    constructor(public name: string, public initializer: Expr | null) {}
    accept(visitor: StmtVisitor) { visitor.visitVarStmt(this); }
}
export class BlockStmt implements Stmt {
    constructor(public stmts: Stmt[]) {}
    accept(visitor: StmtVisitor) { visitor.visitBlockStmt(this); }
}
// export class ClassStmt implements Stmt {
// constructor(name: string, List<Stmt.Function> methods) {}
// accept(visitor: StmtVisitor) { visitor.visitClassStmt(this); }
// }
export class FunctionStmt implements Stmt {
    constructor(public name: string, public param: string[], public body: BlockStmt) {}
    accept(visitor: StmtVisitor) { visitor.visitFunctionStmt(this); }
}
export class ForStmt implements Stmt {
    constructor(public initializer: Stmt | null, public compare: Expr | null, public increment: Expr | null, public body: Stmt) {}
    accept(visitor: StmtVisitor) { visitor.visitForStmt(this); }
}
export class IfStmt implements Stmt {
    constructor(public condition: Expr, public then_branch: Stmt, public else_branch: Stmt | null) {}
    accept(visitor: StmtVisitor) { visitor.visitIfStmt(this); }
}
export class ReturnStmt implements Stmt {
    constructor(public value: Expr | null) {}
    accept(visitor: StmtVisitor) { visitor.visitReturnStmt(this); }
}
export class WhileStmt implements Stmt {
    constructor(public condition: Expr, public body: Stmt) {}
    accept(visitor: StmtVisitor) { visitor.visitWhileStmt(this); }
}
