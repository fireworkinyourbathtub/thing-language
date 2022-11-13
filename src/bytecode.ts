import * as diagnostics from './diagnostics';
import * as ast from './ast';
import * as runtime from './runtime';

export type Instruction = StmtMarker | UnaryOp | BinaryOp | Call | Assign | ReadVar | EndScope | StartScope | Return | If | While | MakeVar | Print;

export interface Print extends diagnostics.Located {
    type: 'Print';
    value: runtime.Value;
}

export interface MakeVar extends diagnostics.Located {
    type: 'MakeVar';
    name: string;
    value: runtime.Value;
}

export interface While extends diagnostics.Located {
    type: 'While';
    check_code: Instruction[];
    check: runtime.Value;
    body_code: Instruction[];
}

export interface If extends diagnostics.Located {
    type: 'If';
    cond: runtime.Value;
    true_branch: Instruction[];
    false_branch: Instruction[] | null;
}

export interface Return extends diagnostics.Located {
    type: 'Return';
    value: runtime.Value;
}

export interface StartScope extends diagnostics.Located {
    type: 'StartScope';
    span: diagnostics.Span;
}

export interface EndScope extends diagnostics.Located {
    type: 'EndScope';
    span: diagnostics.Span;
}

export interface ReadVar extends diagnostics.Located {
    type: 'ReadVar';
    name: string;
    dest: runtime.Register;
}

export interface Assign extends diagnostics.Located {
    type: 'Assign';
    name: string;
    value: runtime.Value;
}

export interface Call extends diagnostics.Located {
    type: 'Call';
    callee: runtime.Value;
    args: runtime.Value[];
    dest: runtime.Register;
}

export interface BinaryOp extends diagnostics.Located {
    type: 'BinaryOp';
    l: runtime.Value;
    r: runtime.Value;
    op: ast.BinaryOperator;
    dest: runtime.Register;
}

export interface UnaryOp extends diagnostics.Located {
    type: 'UnaryOp';
    v: runtime.Value;
    op: ast.UnaryOperator;
    dest: runtime.Register;
}

export interface StmtMarker extends diagnostics.Located {
    type: 'StmtMarker';
    span: diagnostics.Span;
}

export function pretty_print(instrs: Instruction[]): [string, Map<Instruction, [number, number]>] {
    let indentation = 0;
    let result = '';
    let cur_number = 0;
    let mapping = new Map();

    function blank_line() {
        result += '\n';
    }

    function append(instr: Instruction, s: string, sp: diagnostics.Span) {
        let sp_contents = sp.contents;
        let sp_annotation = sp_contents.split('\n').length > 1 ? `${sp_contents.split('\n')[0]}...` : sp_contents;
        append_no_span(instr, `${s}${' '.repeat(40 - s.length)}// ${sp_annotation}`);
    }

    function append_no_span(instr: Instruction | undefined, s: string) {
        let append = `${' '.repeat(indentation * 4)}${s}\n`
        if (instr != undefined)
            mapping.set(instr, [result.length, result.length + append.length]);

        result += append;
    }

    function append_marker(instr: Instruction, s: string) {
        blank_line();
        append_no_span(instr, s);
    }

    function pp_instrs(instrs: Instruction[]) {
        for (let instr of instrs) {
            pp_instr(instr);
        }
    }

    function pp_instr(instr: Instruction) {
        switch (instr.type) {
            case 'Print': {
                append(instr, `print ${instr.value.pretty_print()};`, instr.span);
                break;
            }

            case 'MakeVar': {
                append(instr, `make_var ${instr.name} = ${instr.value.pretty_print()};`, instr.span);
                break;
            }

            case 'While': {
                append(instr, 'while {', instr.span);
                indent();
                pp_instrs(instr.check_code);
                append_no_span(undefined, `check ${instr.check.pretty_print()}`);
                dedent();
                append_no_span(undefined, '}');
                append_no_span(undefined, '{');
                indent();
                pp_instrs(instr.body_code);
                dedent();
                append_no_span(undefined, '}');
                break;
            }

            case 'If': {
                append(instr, `if ${instr.cond.pretty_print()} {`, instr.span);
                indent();
                pp_instrs(instr.true_branch);
                dedent();
                if (instr.false_branch) {
                    append_no_span(instr, '} else {');
                    indent();
                    pp_instrs(instr.false_branch);
                    dedent();
                    append_no_span(instr, '}');
                } else {
                    append_no_span(instr, '}');
                }
                break;
            }

            case 'Return': {
                append(instr, `return ${instr.value.pretty_print()};`, instr.span);
                break;
            }

            case 'StartScope': {
                append(instr, `start_scope;`, instr.span);
                break;
            }

            case 'EndScope': {
                append(instr, `end_scope;`, instr.span);
                break;
            }

            case 'ReadVar': {
                append(instr, `read_var ${instr.name} -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }

            case 'Assign': {
                append(instr, `assign ${instr.name} = ${instr.value.pretty_print()};`, instr.span);
                break;
            }

            case 'Call': {
                append(instr, `call ${instr.callee.pretty_print()}(${instr.args.map(a => a.pretty_print()).join()}) -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }

            case 'BinaryOp': {
                let op_name;
                switch (instr.op) {
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

                append(instr, `${op_name} ${instr.l.pretty_print()} ${instr.r.pretty_print()} -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }

            case 'UnaryOp': {
                let op_name;
                switch (instr.op) {
                    case ast.UnaryOperator.Minus: op_name = 'neg'; break;
                    case ast.UnaryOperator.Bang: op_name = 'logic_neg'; break;
                }
                append(instr, `${op_name} ${instr.v.pretty_print()} -> ${instr.dest.pretty_print()};`, instr.span);
                break;
            }

            case 'StmtMarker': {
                append_marker(instr, `// line ${instr.span.start_line}: ${diagnostics.get_line(instr.span.source, instr.span.start_line)}`);
                break;
            }
        }
    }

    function indent() {
        ++indentation;
    }

    function dedent() {
        --indentation;
    }

    pp_instrs(instrs);

    return [result, mapping];
}
