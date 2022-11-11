import * as lexer from './lexer';
import * as diagnostics from './diagnostics';

export interface AST extends diagnostics.Located {}

export interface ExprVisitor<T> {
    visitBinaryExpr(ast: BinaryExpr): T;
    visitUnaryExpr(ast: UnaryExpr): T;
    visitVarExpr(ast: VarExpr): T;
    visitStringLiteral(ast: StringLiteral): T;
    visitNumberLiteral(ast: NumberLiteral): T;
    visitBoolLiteral(ast: BoolLiteral): T;
    visitNilLiteral(ast: NilLiteral): T;
    visitAssignExpr(ast: AssignExpr): T;
    visitCallExpr(ast: CallExpr): T;
    visitLogicalExpr(ast: LogicalExpr): T;

    // visitGetExpr(ast: GetExpr): T;
    // visitSetExpr(ast: SetExpr): T;
    // visitThisExpr(ast: ThisExpr): T;
    // visitSuperExpr(ast: SuperExpr): T;
}

export interface Expr extends AST {
    accept<T>(visitor: ExprVisitor<T>): T;
}

export enum BinaryOperator {
    Plus, Minus, Star, Slash,
    Less, Greater,
    LessEqual, GreaterEqual,
    EqualEqual, BangEqual,
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
    constructor(public span: diagnostics.Span, public left: Expr, public right: Expr, public op: BinaryOperator) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitBinaryExpr(this); }
}
export class UnaryExpr implements Expr {
    constructor(public span: diagnostics.Span, public operator: UnaryOperator, public operand: Expr) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitUnaryExpr(this); }
}
export class VarExpr implements Expr {
    constructor(public span: diagnostics.Span, public name: string) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitVarExpr(this); }
}
export class StringLiteral implements Expr {
    constructor(public span: diagnostics.Span, public value: string) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitStringLiteral(this); }
}
export class NumberLiteral implements Expr {
    constructor(public span: diagnostics.Span, public value: number) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitNumberLiteral(this); }
}
export class BoolLiteral implements Expr {
    constructor(public span: diagnostics.Span, public value: boolean) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitBoolLiteral(this); }
}
export class NilLiteral implements Expr {
    constructor(public span: diagnostics.Span, ) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitNilLiteral(this); }
}
export class AssignExpr implements Expr {
    constructor(public span: diagnostics.Span, public name: string, public value: Expr) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitAssignExpr(this); }
}
export class CallExpr implements Expr {
    constructor(public span: diagnostics.Span, public callee: Expr, public args: Expr[]) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitCallExpr(this); }
}
// export class GetExpr implements Expr {
    // constructor(public span: diagnostics.Span, public object: Expr, public name: string) {}
    // accept<T>(visitor: ExprVisitor<T>) { return visitor.visitGetExpr(this); }
// }
export class LogicalExpr implements Expr {
    constructor(public span: diagnostics.Span, public left: Expr, public operator: LogicalOperator, public right: Expr) {}
    accept<T>(visitor: ExprVisitor<T>) { return visitor.visitLogicalExpr(this); }
}
// export class SetExpr implements Expr {
    // constructor(public span: diagnostics.Span, public object: Expr, public name: string, public value: Expr) {}
    // accept<T>(visitor: ExprVisitor<T>) { return visitor.visitSetExpr(this); }
// }
// export class ThisExpr implements Expr {
    // constructor(public span: diagnostics.Span, public keyword: lexer.This) {}
    // accept<T>(visitor: ExprVisitor<T>) { return visitor.visitThisExpr(this); }
// }

// export class SuperExpr implements Expr {
// constructor(public span: diagnostics.Span, keyword: Token, method: ) {}
// accept<T>(visitor: ExprVisitor<T>) { return visitor.visitSuperExpr(this); }
// }

export interface StmtVisitor<T> {
    visitExprStmt(ast: ExprStmt): T;
    visitPrintStmt(ast: PrintStmt): T;
    visitVarStmt(ast: VarStmt): T;
    visitBlockStmt(ast: BlockStmt): T;
    // visitClassStmt(ast: ClassStmt): T;
    visitFunctionStmt(ast: FunctionStmt): T;
    visitForStmt(ast: ForStmt): T;
    visitIfStmt(ast: IfStmt): T;
    visitReturnStmt(ast: ReturnStmt): T;
    visitWhileStmt(ast: WhileStmt): T;
}
export interface Stmt extends AST {
    accept<T>(visitor: StmtVisitor<T>): T;
}

export class ExprStmt implements Stmt {
    constructor(public span: diagnostics.Span, public expr: Expr) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitExprStmt(this); }
}
export class PrintStmt implements Stmt {
    constructor(public span: diagnostics.Span, public expr: Expr) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitPrintStmt(this); }
}
export class VarStmt implements Stmt {
    constructor(public span: diagnostics.Span, public name: string, public initializer: Expr | null) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitVarStmt(this); }
}
export class BlockStmt implements Stmt {
    constructor(public span: diagnostics.Span, public stmts: Stmt[]) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitBlockStmt(this); }
}
// export class ClassStmt implements Stmt {
// constructor(public span: diagnostics.Span, name: string, List<Stmt.Function> methods) {}
// accept<T>(visitor: StmtVisitor<T>) { return visitor.visitClassStmt(this); }
// }
export class FunctionStmt implements Stmt {
    constructor(public span: diagnostics.Span, public name: string, public params: string[], public body: BlockStmt) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitFunctionStmt(this); }
}
export class ForStmt implements Stmt {
    constructor(public span: diagnostics.Span, public initializer: Stmt | null, public compare: Expr | null, public increment: Expr | null, public body: Stmt) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitForStmt(this); }
}
export class IfStmt implements Stmt {
    constructor(public span: diagnostics.Span, public condition: Expr, public then_branch: Stmt, public else_branch: Stmt | null) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitIfStmt(this); }
}
export class ReturnStmt implements Stmt {
    constructor(public span: diagnostics.Span, public value: Expr | null) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitReturnStmt(this); }
}
export class WhileStmt implements Stmt {
    constructor(public span: diagnostics.Span, public condition: Expr, public body: Stmt) {}
    accept<T>(visitor: StmtVisitor<T>) { return visitor.visitWhileStmt(this); }
}
