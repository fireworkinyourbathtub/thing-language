import * as diagnostics from './diagnostics';

export interface Instruction {
    readonly span: diagnostics.Span;
    pretty_print(): string;
}

export interface Value {}

export class Register implements Value {
    constructor(public index: number) {}
}

export class Nil implements Value {
    constructor() {}
}

export class Constant<T> implements Value {
    constructor(public x: T) {}
}

export class Print implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly expr: Value) {}
    pretty_print(): string {
        return `print ${this.expr};`;
    }
}

export class MakeVar implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly name: string, public readonly value: Value) {}
    pretty_print(): string {
        return `make_var ${this.name} = ${this.value};`;
    }
}

export class DefineFun implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly name: string, public readonly params: string[], public readonly instructions: Instruction[]) {}
    pretty_print(): string {
        return `define_function ${this.name} (${this.params}) { /* TODO */ };`;
    }
}

export class While implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly check_code: Instruction[], public readonly check: Value, public readonly body_code: Instruction[]) {}
    pretty_print(): string {
        return `while ${this.check} { /* TODO */ };`;
    }
}

export class If implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly cond: Value, public readonly true_branch: Instruction[], public readonly false_branch: Instruction[] | null) {}
    pretty_print(): string {
        return `if ${this.cond} { /* TODO */ };`;
    }
}

export class Return implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: Value) {}
    pretty_print(): string {
        return `return ${this.v};`;
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
        return `read_var ${this.v} -> ${this.dest};`;
    }
}
