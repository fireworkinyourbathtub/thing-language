import * as ast from './ast';
import * as bytecode from './bytecode';

type Register = number;

export function compile(stmts: ast.Stmt[]): bytecode.Instruction[] {
    let instructions: bytecode.Instruction[] = [];


    for (let stmt of stmts) {
        compile_stmt(instructions, stmt);
    }

    return instructions;
}

function compile_stmt(instructions: bytecode.Instruction[], stmt: ast.Stmt) {
    throw new Error("not implemented yet");
}

function compile_expr(instructions: bytecode.Instruction[], expr: ast.Expr): Register {
    throw new Error("not implemented yet");
}
