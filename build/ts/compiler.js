"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
function compile(stmts) {
    let instructions = [];
    for (let stmt of stmts) {
        compile_stmt(instructions, stmt);
    }
    return instructions;
}
exports.compile = compile;
function compile_stmt(instructions, stmt) {
    throw new Error("not implemented yet");
}
function compile_expr(instructions, expr) {
    throw new Error("not implemented yet");
}
