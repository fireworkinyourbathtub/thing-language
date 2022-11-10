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
