import * as lexer from './lexer';
import * as diagnostics from './diagnostics';

export type Expr = BinaryExpr | UnaryExpr | VarExpr | StringLiteral | NumberLiteral | BoolLiteral | NilLiteral | AssignExpr | CallExpr | LogicalExpr;
    // | GetExpr | SetExpr | ThisExpr | SuperExpr

export type Stmt = WhileStmt | ReturnStmt | IfStmt | ForStmt | FunctionStmt | BlockStmt | VarStmt | PrintStmt | ExprStmt;
    // | ClassStmt

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

export interface BinaryExpr extends diagnostics.Located {
    type: 'BinaryExpr';
    left: Expr;
    right: Expr;
    op: BinaryOperator;
}
export interface UnaryExpr extends diagnostics.Located {
    type: 'UnaryExpr';
    operator: UnaryOperator;
    operand: Expr;
}
export interface VarExpr extends diagnostics.Located {
    type: 'VarExpr';
    name: string;
}
export interface StringLiteral extends diagnostics.Located {
    type: 'StringLiteral';
    value: string;
}
export interface NumberLiteral extends diagnostics.Located {
    type: 'NumberLiteral';
    value: number;
}
export interface BoolLiteral extends diagnostics.Located {
    type: 'BoolLiteral';
    value: boolean;
}
export interface NilLiteral extends diagnostics.Located {
    type: 'NilLiteral';
}
export interface AssignExpr extends diagnostics.Located {
    type: 'AssignExpr';
    name: string;
    value: Expr;
}
export interface CallExpr extends diagnostics.Located {
    type: 'CallExpr';
    callee: Expr;
    args: Expr[];
}
// interface GetExpr extends diagnostics.Located {
//     object: Expr;
//     name: string;
// }
export interface LogicalExpr extends diagnostics.Located {
    type: 'LogicalExpr';
    left: Expr;
    op: LogicalOperator;
    right: Expr;
}
// interface SetExpr extends diagnostics.Located {
// object: Expr
// name: string;
// value: Expr;
// }
// interface ThisExpr extends diagnostics.Located {
// keyword: lexer.This
// }

// interface SuperExpr extends diagnostics.Located {
// keyword: Token, method:
// }

export interface ExprStmt extends diagnostics.Located {
    type: 'ExprStmt';
    expr: Expr;
}
export interface PrintStmt extends diagnostics.Located {
    type: 'PrintStmt';
    expr: Expr;
}
export interface VarStmt extends diagnostics.Located {
    type: 'VarStmt';
    name: string;
    initializer: Expr | null;
}
export interface BlockStmt extends diagnostics.Located {
    type: 'BlockStmt';
    stmts: Stmt[];
    readonly obrace_sp: diagnostics.Span;
    readonly cbrace_sp: diagnostics.Span;
}
// interface ClassStmt extends diagnostics.Located {
// name: string, List<Stmt.Function> methods
// }
export interface FunctionStmt extends diagnostics.Located {
    type: 'FunctionStmt';
    name: string;
    params: string[];
    body: BlockStmt;
}
export interface ForStmt extends diagnostics.Located {
    type: 'ForStmt';
    initializer: Stmt | null;
    compare: Expr | null;
    increment: Expr | null;
    body: Stmt;
    for_sp: diagnostics.Span;
}
export interface IfStmt extends diagnostics.Located {
    type: 'IfStmt';
    condition: Expr;
    then_branch: Stmt;
    else_branch: Stmt | null;
}
export interface ReturnStmt extends diagnostics.Located {
    type: 'ReturnStmt';
    value: Expr | null;
}
export interface WhileStmt extends diagnostics.Located {
    type: 'WhileStmt';
    condition: Expr;
    body: Stmt;
}
