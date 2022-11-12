import * as diagnostics from './diagnostics';
import * as ast from './ast';
import * as runtime from './runtime';

export interface InstructionVisitor<T> {
    visitStmtMarker(instr: StmtMarker): T;
    visitUnaryOp(instr: UnaryOp): T;
    visitBinaryOp(instr: BinaryOp): T;
    visitCall(instr: Call): T;
    visitAssign(instr: Assign): T;
    visitReadVar(instr: ReadVar): T;
    visitEndScope(instr: EndScope): T;
    visitStartScope(instr: StartScope): T;
    visitReturn(instr: Return): T;
    visitIf(instr: If): T;
    visitWhile(instr: While): T;
    visitMakeVar(instr: MakeVar): T;
    visitPrint(instr: Print): T;
}

export interface Instruction extends diagnostics.Located {
    pretty_print(ppc: PrettyPrintContext): void;
    accept<T>(v: InstructionVisitor<T>): T;
}

export class Print implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly expr: runtime.Value) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`print ${this.expr.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitPrint(this);
    }
}

export class MakeVar implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly name: string, public readonly value: runtime.Value) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`make_var ${this.name} = ${this.value.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitMakeVar(this);
    }
}

export class While implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly check_code: Instruction[], public readonly check: runtime.Value, public readonly body_code: Instruction[]) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append('while {', this.span);
        ppc.indent();
        ppc.pretty_print_instrs(this.check_code);
        ppc.append_no_span(`check ${this.check.pretty_print()}`);
        ppc.dedent();
        ppc.append_no_span('}');
        ppc.append_no_span('{');
        ppc.indent();
        ppc.pretty_print_instrs(this.body_code);
        ppc.dedent();
        ppc.append_no_span('}');
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitWhile(this);
    }
}

export class If implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly cond: runtime.Value, public readonly true_branch: Instruction[], public readonly false_branch: Instruction[] | null) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append('if ${this.cond.pretty_print()} {', this.span);
        ppc.indent();
        ppc.pretty_print_instrs(this.true_branch);
        ppc.dedent();
        if (this.false_branch) {
            ppc.append_no_span('} else {');
            ppc.indent();
            ppc.pretty_print_instrs(this.false_branch);
            ppc.dedent();
            ppc.append_no_span('}');
        } else {
            ppc.append_no_span('}');
        }
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitIf(this);
    }
}

export class Return implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: runtime.Value) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`return ${this.v.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitReturn(this);
    }
}

export class StartScope implements Instruction {
    constructor(public readonly span: diagnostics.Span) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`start_scope;`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitStartScope(this);
    }
}

export class EndScope implements Instruction {
    constructor(public readonly span: diagnostics.Span) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`end_scope;`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitEndScope(this);
    }
}

export class ReadVar implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: string, public readonly dest: runtime.Register) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`read_var ${this.v} -> ${this.dest.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitReadVar(this);
    }
}

export class Assign implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly variable: string, public value: runtime.Value) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`assign ${this.variable} = ${this.value.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitAssign(this);
    }
}

export class Call implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly callee: runtime.Value, public args: runtime.Value[], public dest: runtime.Register) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append(`call ${this.callee.pretty_print()}(${this.args.map(a => a.pretty_print()).join()}) -> ${this.dest.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitCall(this);
    }
}

export class BinaryOp implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly l: runtime.Value, public readonly r: runtime.Value, public readonly op: ast.BinaryOperator, public readonly dest: runtime.Register) {}
    pretty_print(ppc: PrettyPrintContext) {
        let op_name;
        switch (this.op) {
            case ast.BinaryOperator.Plus: op_name = 'add'; break;
            case ast.BinaryOperator.Minus: op_name = 'sub'; break;
            case ast.BinaryOperator.Star: op_name = 'mul'; break;
            case ast.BinaryOperator.Slash: op_name = 'div'; break;
            case ast.BinaryOperator.Less: op_name = 'cmp<'; break;
            case ast.BinaryOperator.Greater: op_name = 'cmp>'; break;
            case ast.BinaryOperator.LessEqual: op_name = 'cmp<='; break;
            case ast.BinaryOperator.EqualEqual: op_name = 'cmp=='; break;
            case ast.BinaryOperator.GreaterEqual: op_name = 'cmp>='; break;
            case ast.BinaryOperator.BangEqual: op_name = 'cmp!='; break;
        }

        ppc.append(`${op_name} ${this.l.pretty_print()} ${this.r.pretty_print()} -> ${this.dest.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitBinaryOp(this);
    }
}

export class UnaryOp implements Instruction {
    constructor(public readonly span: diagnostics.Span, public readonly v: runtime.Value, public readonly op: ast.UnaryOperator, public readonly dest: runtime.Register) {}
    pretty_print(ppc: PrettyPrintContext) {
        let op_name;
        switch (this.op) {
            case ast.UnaryOperator.Minus: op_name = 'neg'; break;
            case ast.UnaryOperator.Bang: op_name = 'logic_neg'; break;
        }
        ppc.append(`${op_name} ${this.v.pretty_print()} -> ${this.dest.pretty_print()};`, this.span);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitUnaryOp(this);
    }
}

export class StmtMarker implements Instruction {
    constructor(public readonly span: diagnostics.Span) {}
    pretty_print(ppc: PrettyPrintContext) {
        ppc.append_marker(`// line ${this.span.start_line}: ${diagnostics.get_line(this.span.source, this.span.start_line)}`);
    }
    accept<T>(visitor: InstructionVisitor<T>): T {
        return visitor.visitStmtMarker(this);
    }
}

export class PrettyPrintContext {
    indentation: number;
    result: string;

    constructor() {
        this.indentation = 0;
        this.result = '';
    }

    indent() {
        ++this.indentation;
    }

    dedent() {
        --this.indentation;
    }

    blank_line() {
        this.result += '\n';
    }

    append(s: string, sp: diagnostics.Span) {
        let sp_contents = sp.contents;
        let sp_annotation = sp_contents.split('\n').length > 1 ? `${sp_contents.split('\n')[0]}...` : sp_contents;
        this.append_no_span(`${s}${' '.repeat(40 - s.length)}// ${sp_annotation}`);
    }

    append_no_span(s: string) {
        this.result += `${' '.repeat(this.indentation * 4)}${s}\n`;
    }

    append_marker(s: string) {
        this.blank_line();
        this.append_no_span(s);
    }

    pretty_print_instrs(instrs: Instruction[]) {
        for (let instr of instrs) {
            instr.pretty_print(this);
        }
    }
}
