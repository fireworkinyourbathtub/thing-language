import * as bytecode from './bytecode';
import * as runtime from './runtime';


function* instruction_list(env: runtime.Environment, instructions: bytecode.Instruction[]): IterableIterator<bytecode.Instruction> {
    for (let instr of instructions) {
        yield* instruction_list_1(env, instr);
    }
}

function* instruction_list_1(env: runtime.Environment, instr: bytecode.Instruction): IterableIterator<bytecode.Instruction> {
    switch (instr.type) {
        case 'If': {
            if (instr.cond.to_runtime_value(env).is_truthy()) {
                yield* instruction_list(env, instr.true_branch);
            } else {
                if (instr.false_branch) {
                    yield* instruction_list(env, instr.false_branch);
                }
            }
            break;
        }
        case 'While': {
            while (true) {
                yield* instruction_list(env, instr.check_code);
                if (!instr.check.to_runtime_value(env).is_truthy()) break;
                yield* instruction_list(env, instr.body_code);
            }
            break;
        }

        default: {
            yield instr;
            break;
        }
    }
}

export function interpret(instructions: bytecode.Instruction[]) {
    let env = new runtime.Environment(null);
    for (let instr of instruction_list(env, instructions)) {
        console.log(bytecode.pretty_print([instr]));
        switch (instr.type) {
            case 'StmtMarker': break;
            case 'UnaryOp': { // TODO
                break;
            }
            case 'BinaryOp': { // TODO
                break;
            }
            case 'Call': { // TODO
                break;
            }
            case 'Assign': { // TODO
                break;
            }
            case 'ReadVar': { // TODO
                break;
            }
            case 'EndScope': { // TODO
                break;
            }
            case 'StartScope': { // TODO
                break;
            }
            case 'Return': { // TODO
                break;
            }
            case 'If': { // TODO
                break;
            }
            case 'While': { // TODO
                break;
            }
            case 'MakeVar': { // TODO
                break;
            }
            case 'Print': { // TODO
                break;
            }
        }
    }
}
