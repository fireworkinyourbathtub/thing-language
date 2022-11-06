export abstract class AST {}

export abstract class Expr extends AST {}

export enum BinaryOperator {
    Plus, Minus, Star, Slash,
    Less, Equal, Greater, Bang,
    LessEqual, EqualEqual, GreaterEqual, BangEqual,
}
export class BinaryExpr extends Expr {
    constructor(public left: Expr, public right: Expr, public op: BinaryOperator) { super() }
}

export enum UnaryOperator {
    Minus,
    Bang,
}
export class UnaryExpr extends Expr {
    constructor(public operator: UnaryOperator, public operand: Expr) { super() }
}

export class Literal<T> extends Expr {
    constructor(public value: T) { super() }
}
