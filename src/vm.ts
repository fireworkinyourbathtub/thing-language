import * as bytecode from './bytecode';
import * as runtime from './runtime';

class InstructionLister implements bytecode.InstructionVisitor<IterableIterator<bytecode.Instruction>> {
    constructor(public env: runtime.Environment) {}
    *visitStmtMarker(instr: bytecode.StmtMarker) { yield instr; }
    *visitUnaryOp(instr: bytecode.UnaryOp) { yield instr; }
    *visitBinaryOp(instr: bytecode.BinaryOp) { yield instr; }
    *visitCall(instr: bytecode.Call) { yield instr; }
    *visitAssign(instr: bytecode.Assign) { yield instr; }
    *visitReadVar(instr: bytecode.ReadVar) { yield instr; }
    *visitEndScope(instr: bytecode.EndScope) { yield instr; }
    *visitStartScope(instr: bytecode.StartScope) { yield instr; }
    *visitReturn(instr: bytecode.Return) { yield instr; }
    *visitIf(instr: bytecode.If): IterableIterator<bytecode.Instruction> {
        if (instr.cond.to_runtime_value(this.env).is_truthy()) {
            yield* instruction_list(this.env, instr.true_branch);
        } else {
            if (instr.false_branch) {
                yield* instruction_list(this.env, instr.false_branch);
            }
        }
    }
    *visitWhile(instr: bytecode.While): IterableIterator<bytecode.Instruction> {
        while (true) {
            yield* instruction_list(this.env, instr.check_code);
            if (!instr.check.to_runtime_value(this.env).is_truthy()) break;
            yield* instruction_list(this.env, instr.body_code);
        }
    }
    *visitMakeVar(instr: bytecode.MakeVar) { yield instr; }
    *visitPrint(instr: bytecode.Print) { yield instr; }
}

function* instruction_list(env: runtime.Environment, instructions: bytecode.Instruction[]) {
    for (let instr of instructions) {
        yield* instr.accept(new InstructionLister(env));
    }
}

export function interpret(instructions: bytecode.Instruction[]) {
    let env = new runtime.Environment(null);
    for (let instr of instruction_list(env, instructions)) {
        let ppc = new bytecode.PrettyPrintContext();
        instr.pretty_print(ppc)
        console.log(ppc.result);


    }
}
