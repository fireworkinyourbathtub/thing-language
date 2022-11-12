import * as bytecode from './bytecode';

class Environemnt {
    let registers: bytecode.Value[] = [];
    let variables: Map<String, bytecode.Value>[] = [new Map()];
}

export function interpret(instructions: bytecode.Instruction[]) {

    for (let instr of instructions) {

    }
}
