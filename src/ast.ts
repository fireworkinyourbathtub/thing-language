import * as lexer from './lexer';

export abstract class AST {}

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

export abstract class Expr extends AST {
    abstract accept(visitor: ExprVisitor): void;
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

export class BinaryExpr extends Expr {
    constructor(public left: Expr, public right: Expr, public op: BinaryOperator) { super() }
    accept(visitor: ExprVisitor) { visitor.visitBinaryExpr(this); }
}
export class UnaryExpr extends Expr {
    constructor(public operator: UnaryOperator, public operand: Expr) { super() }
    accept(visitor: ExprVisitor) { visitor.visitUnaryExpr(this); }
}
export class VarExpr extends Expr {
    constructor(public name: string) { super() }
    accept(visitor: ExprVisitor) { visitor.visitVarExpr(this); }
}
export class StringLiteral extends Expr {
    constructor(public value: string) { super() }
    accept(visitor: ExprVisitor) { visitor.visitStringLiteral(this); }
}
export class NumberLiteral extends Expr {
    constructor(public value: number) { super() }
    accept(visitor: ExprVisitor) { visitor.visitNumberLiteral(this); }
}
export class BoolLiteral extends Expr {
    constructor(public value: boolean) { super() }
    accept(visitor: ExprVisitor) { visitor.visitBoolLiteral(this); }
}
export class NilLiteral extends Expr {
    constructor() { super() }
    accept(visitor: ExprVisitor) { visitor.visitNilLiteral(this); }
}
export class AssignExpr extends Expr {
    constructor(public name: string, value: Expr) { super() }
    accept(visitor: ExprVisitor) { visitor.visitAssignExpr(this); }
}
export class CallExpr extends Expr {
    constructor(public callee: Expr, public args: Expr[]) { super() }
    accept(visitor: ExprVisitor) { visitor.visitCallExpr(this); }
}
export class GetExpr extends Expr {
    constructor(public object: Expr, public name: string) { super() }
    accept(visitor: ExprVisitor) { visitor.visitGetExpr(this); }
}
export class LogicalExpr extends Expr {
    constructor(public left: Expr, public operator: LogicalOperator, public right: Expr) { super() }
    accept(visitor: ExprVisitor) { visitor.visitLogicalExpr(this); }
}
export class SetExpr extends Expr {
    constructor(public object: Expr, public name: string, public value: Expr) { super() }
    accept(visitor: ExprVisitor) { visitor.visitSetExpr(this); }
}
export class ThisExpr extends Expr {
    constructor(public keyword: lexer.This) { super() }
    accept(visitor: ExprVisitor) { visitor.visitThisExpr(this); }
}

// export class SuperExpr extends Expr {
// constructor(keyword: Token, method: ) { super() }
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
export abstract class Stmt extends AST {
    abstract accept(visitor: StmtVisitor): void;
}

export class ExprStmt extends Stmt {
    constructor(public expr: Expr) { super() }
    accept(visitor: StmtVisitor) { visitor.visitExprStmt(this); }
}
export class PrintStmt extends Stmt {
    constructor(public expr: Expr) { super() }
    accept(visitor: StmtVisitor) { visitor.visitPrintStmt(this); }
}
export class VarStmt extends Stmt {
    constructor(public name: string, public initializer: Expr | null) { super() }
    accept(visitor: StmtVisitor) { visitor.visitVarStmt(this); }
}
export class BlockStmt extends Stmt {
    constructor(public stmts: Stmt[]) { super() }
    accept(visitor: StmtVisitor) { visitor.visitBlockStmt(this); }
}
// export class ClassStmt extends Stmt {
// constructor(name: string, List<Stmt.Function> methods) { super() }
// accept(visitor: StmtVisitor) { visitor.visitClassStmt(this); }
// }
export class FunctionStmt extends Stmt {
    constructor(public name: string, public param: string[], public body: BlockStmt) { super() }
    accept(visitor: StmtVisitor) { visitor.visitFunctionStmt(this); }
}
export class ForStmt extends Stmt {
    constructor(public initializer: Stmt | null, public compare: Expr | null, public increment: Expr | null, public body: Stmt) { super() }
    accept(visitor: StmtVisitor) { visitor.visitForStmt(this); }
}
export class IfStmt extends Stmt {
    constructor(public condition: Expr, public then_branch: Stmt, public else_branch: Stmt | null) { super() }
    accept(visitor: StmtVisitor) { visitor.visitIfStmt(this); }
}
export class ReturnStmt extends Stmt {
    constructor(public value: Expr | null) { super() }
    accept(visitor: StmtVisitor) { visitor.visitReturnStmt(this); }
}
export class WhileStmt extends Stmt {
    constructor(public condition: Expr, public body: Stmt) { super() }
    accept(visitor: StmtVisitor) { visitor.visitWhileStmt(this); }
}
