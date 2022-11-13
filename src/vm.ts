import * as bytecode from './bytecode';
import * as runtime from './runtime';
import * as ast from './ast';
import * as visualization from './visualization';

function* instruction_list(registers: runtime.RuntimeValue[], instructions: bytecode.Instruction[]): IterableIterator<bytecode.Instruction> {
    for (let instr of instructions) {
        yield* instruction_list_1(registers, instr);
    }
}

function* instruction_list_1(registers: runtime.RuntimeValue[], instr: bytecode.Instruction): IterableIterator<bytecode.Instruction> {
    switch (instr.type) {
        case 'If': {
            if (instr.cond.resolve(registers).is_truthy()) {
                yield* instruction_list(registers, instr.true_branch);
            } else {
                if (instr.false_branch) {
                    yield* instruction_list(registers, instr.false_branch);
                }
            }
            break;
        }
        case 'While': {
            while (true) {
                yield* instruction_list(registers, instr.check_code);
                if (!instr.check.resolve(registers).is_truthy()) break;
                yield* instruction_list(registers, instr.body_code);
            }
            break;
        }

        case 'StmtMarker': break;

        default: {
            yield instr;
            break;
        }
    }
}

export async function interpret(instructions: bytecode.Instruction[]) {
    let globals = new runtime.Environment(null);
    interpret_(globals, globals, instructions);
}

export async function interpret_(globals: runtime.Environment, env: runtime.Environment, instructions: bytecode.Instruction[]): Promise<runtime.RuntimeValue> {
    let tracker = new visualization.CallStackFrame(instructions);
    let registers: runtime.RuntimeValue[] = [];

    for (let instr of instruction_list(registers, instructions)) {
        tracker.focus_instr(instr);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        switch (instr.type) {
            case 'StmtMarker': break;

            case 'UnaryOp': {
                let value = instr.v.resolve(registers);
                let result;
                switch (instr.op) {
                    case ast.UnaryOperator.Minus:
                        if (value instanceof runtime.Number) {
                            result = new runtime.Number(-value.x);
                        } else {
                            throw new Error(`cannot negate non-number ${value.type()}`); // TODO
                        }
                        break;
                    case ast.UnaryOperator.Bang:
                        result = new runtime.Bool(!value.is_truthy());
                        break;
                }

                registers[instr.dest.index] = result;
                break;
            }

            case 'BinaryOp': {
                let l = instr.l.resolve(registers);
                let r = instr.r.resolve(registers);
                let result: runtime.RuntimeValue;
                let cannot_compare = new Error(`cannot compare ${l.type()} and ${r.type()}; can only compare number and number`);
                switch (instr.op) {
                    case ast.BinaryOperator.Plus: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Number(l.x + r.x);
                        } else if (l instanceof runtime.String && r instanceof runtime.String) {
                            result = new runtime.String(l.x + r.x);
                        } else {
                            throw new Error(`cannot add ${l.type()} and ${r.type()}; can only add number and number or string and string`);
                        }
                        break;
                    }
                    case ast.BinaryOperator.Minus: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Number(l.x - r.x);
                        } else {
                            throw new Error(`cannot subtract ${l.type()} and ${r.type()}; can only subtract number and number`);
                        }
                        break;
                    }
                    case ast.BinaryOperator.Star: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Number(l.x * r.x);
                        } else {
                            throw new Error(`cannot multiply ${l.type()} and ${r.type()}; can only multiply number and number`);
                        }
                        break;
                    }
                    case ast.BinaryOperator.Slash: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Number(l.x / r.x);
                        } else {
                            throw new Error(`cannot divide ${l.type()} and ${r.type()}; can only divide number and number`);
                        }
                        break;
                    }

                    case ast.BinaryOperator.Less: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Bool(l.x < r.x);
                        } else {
                            throw cannot_compare;
                        }
                        break;
                    }
                    case ast.BinaryOperator.Greater: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Bool(l.x > r.x);
                        } else {
                            throw cannot_compare;
                        }
                        break;
                    }
                    case ast.BinaryOperator.LessEqual: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Bool(l.x <= r.x);
                        } else {
                            throw cannot_compare;
                        }
                        break;
                    }
                    case ast.BinaryOperator.GreaterEqual: {
                        if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Bool(l.x >= r.x);
                        } else {
                            throw cannot_compare;
                        }
                        break;
                    }

                    case ast.BinaryOperator.EqualEqual: {
                        if (l instanceof runtime.Nil && r instanceof runtime.Nil) {
                            result = new runtime.Bool(true);
                        } else if (l instanceof runtime.Number && r instanceof runtime.Number) {
                            result = new runtime.Bool(l.x == r.x);
                        } else if (l instanceof runtime.String && r instanceof runtime.String) {
                            result = new runtime.Bool(l.x == r.x);
                        } else if (l instanceof runtime.Bool && r instanceof runtime.Bool) {
                            result = new runtime.Bool(l.x == r.x);
                        } else if (l instanceof runtime.Function && r instanceof runtime.Function) {
                            result = new runtime.Bool(false);
                        }

                        break;
                    }
                    case ast.BinaryOperator.BangEqual: {
                        result = new runtime.Bool(l != r);
                        break;
                    }
                }

                registers[instr.dest.index] = result!; // TODO: remove !
                break;
            }
            case 'Call': {
                let callee = instr.callee.resolve(registers);
                let args = instr.args.map(x => x.resolve(registers));

                if (!('call' in callee && 'arity' in callee))
                    throw new Error("can only call functions and classes");

                let callee_ = callee as unknown as runtime.Callable;

                if (args.length != callee_.arity)
                    throw new Error(`wrong number of arguments: expected ${callee_.arity}, got ${args.length}`);
                else
                    registers[instr.dest.index] = await callee_.call(globals, args);

                break;
            }

            case 'Assign': {
                env.set_variable(instr.name, instr.value.resolve(registers));
                break;
            }
            case 'MakeVar': {
                env.put_variable(instr.name, instr.value.resolve(registers));
                break;
            }
            case 'ReadVar': {
                registers[instr.dest.index] = env.get_variable(instr.name);
                break;
            }

            case 'StartScope': {
                env = new runtime.Environment(env);
                break;
            }
            case 'EndScope': {
                env = env.parent!;
                break;
            }

            case 'Return': {
                tracker.done();
                return instr.value.resolve(registers);
            }

            case 'Print': {
                console.log(instr.value.resolve(registers).stringify()); // TODO
                break;
            }

            case 'If': break; // handled by instruction_list
            case 'While': break; // handled by instruction_list
        }
    }

    tracker.done();
    return new runtime.Nil();
}
