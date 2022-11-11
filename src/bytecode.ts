import * as diagnostics from './diagnostics';
import * as ast from './ast';

export interface Instruction extends diagnostics.Located {
    pretty_print(): string;
}

export interface Value {
    pretty_print(): string;
}

export class Register implements Value {
    constructor(public index: number) {}
    pretty_print() { return `%${this.index}`; }
}

export class Nil implements Value {
    constructor() {}
    pretty_print() { return `nil`; }
}

export class Constant<T> implements Value {
    constructor(public x: T) {}
    pretty_print() { return this.x as string; }
}

export class Print implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly expr: Value) {}
    pretty_print(): string {
        return `print ${this.expr.pretty_print()};`;
    }
}

export class MakeVar implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly name: string, public readonly value: Value) {}
    pretty_print(): string {
        return `make_var ${this.name} = ${this.value.pretty_print()};`;
    }
}

export class DefineFun implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly name: string, public readonly params: string[], public readonly instructions: Instruction[]) {}
    pretty_print(): string {
        return `define_function ${this.name} (${this.params}) { /* TODO */ };`; // TODO: pretty print params
    }
}

export class While implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly check_code: Instruction[], public readonly check: Value, public readonly body_code: Instruction[]) {}
    pretty_print(): string {
        return `while ${this.check.pretty_print()} { /* TODO */ };`; // TODO
    }
}

export class If implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly cond: Value, public readonly true_branch: Instruction[], public readonly false_branch: Instruction[] | null) {}
    pretty_print(): string {
        return `if ${this.cond.pretty_print()} { /* TODO */ };`; // TODO
    }
}

export class Return implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: Value) {}
    pretty_print(): string {
        return `return ${this.v.pretty_print()};`;
    }
}

export class StartScope implements Instruction {
    constructor(public readonly span: diagnostics.Span) {}
    pretty_print(): string {
        return `start_scope;`;
    }
}

export class EndScope implements Instruction {
    constructor(public readonly span: diagnostics.Span) {}
    pretty_print(): string {
        return `end_scope;`;
    }
}

export class ReadVar implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: string, public readonly dest: Register) {}
    pretty_print(): string {
        return `read_var ${this.v} -> ${this.dest.pretty_print()};`;
    }
}

export class Assign implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly variable: string, public value: Value) {}
    pretty_print(): string {
        return `assign ${this.variable} = ${this.value.pretty_print()};`;
    }
}

export class Call implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly callee: Value, public args: Value[], public dest: Register) {}
    pretty_print(): string {
        return `call ${this.callee.pretty_print()}(${this.args}) -> ${this.dest.pretty_print()};`; // TODO: pretty print args
    }
}

export class BinaryOp implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly l: Value, public readonly r: Value, public readonly op: ast.BinaryOperator, public readonly dest: Register) {}
    pretty_print(): string {
        // return `call ${this.callee}(${this.args}) -> ${this.dest};`;
        throw new Error("not implemented yet");
    }
}

export class UnaryOp implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: Value, public readonly op: ast.UnaryOperator, public readonly dest: Register) {}
    pretty_print(): string {
        // return `call ${this.callee}(${this.args}) -> ${this.dest};`;
        throw new Error("not implemented yet");
    }
}
