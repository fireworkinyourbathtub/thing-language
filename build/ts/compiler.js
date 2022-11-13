"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const bytecode = __importStar(require("./bytecode"));
const runtime = __importStar(require("./runtime"));
class RegisterContext {
    constructor() {
        this.register_i = 0;
    }
    new_register() {
        return new runtime.Register(this.register_i++);
    }
}
function make_stmt_marker(stmt) {
    return new bytecode.StmtMarker(stmt.span);
}
function compile(stmts) {
    let register_context = new RegisterContext();
    let instructions = [];
    for (let stmt of stmts) {
        compile_stmt(stmt, instructions, register_context);
    }
    return instructions;
}
exports.compile = compile;
function compile_stmt(stmt, instructions, register_context) {
    instructions.push(make_stmt_marker(stmt));
    switch (stmt.type) {
        case 'ExprStmt': {
            compile_expr(stmt.expr, instructions, register_context);
            break;
        }
        case 'PrintStmt': {
            let e = compile_expr(stmt.expr, instructions, register_context);
            instructions.push(new bytecode.Print(stmt.span, e));
            break;
        }
        case 'VarStmt': {
            let e;
            if (stmt.initializer) {
                e = compile_expr(stmt.initializer, instructions, register_context);
            }
            else {
                e = new runtime.Nil();
            }
            instructions.push(new bytecode.MakeVar(stmt.span, stmt.name, e));
            break;
        }
        case 'BlockStmt': {
            instructions.push(new bytecode.StartScope(stmt.obrace_sp));
            for (let sub_stmt of stmt.stmts) {
                compile_stmt(sub_stmt, instructions, register_context);
            }
            instructions.push(new bytecode.EndScope(stmt.cbrace_sp));
            break;
        }
        case 'FunctionStmt': {
            let register_context = new RegisterContext();
            let instrs = [];
            compile_stmt(stmt.body, instrs, register_context);
            let fn = new runtime.Function(stmt.name, stmt.params, instructions);
            instructions.push(new bytecode.MakeVar(stmt.span, stmt.name, fn));
            break;
        }
        case 'ForStmt': {
            instructions.push(new bytecode.StartScope(stmt.for_sp));
            if (stmt.initializer) {
                compile_stmt(stmt.initializer, instructions, register_context);
            }
            let check_code = [];
            let check;
            if (stmt.compare) {
                check = compile_expr(stmt.compare, check_code, register_context);
            }
            else {
                check = new runtime.Bool(true);
            }
            let body_code = [];
            compile_stmt(stmt.body, body_code, register_context);
            if (stmt.increment) {
                compile_expr(stmt.increment, body_code, register_context);
            }
            instructions.push(new bytecode.While(stmt.span, check_code, check, body_code));
            instructions.push(new bytecode.EndScope(stmt.for_sp)); // TODO: better span?
            break;
        }
        case 'IfStmt': {
            let cond = compile_expr(stmt.condition, instructions, register_context);
            let true_code = [];
            compile_stmt(stmt.then_branch, true_code, register_context);
            let false_code;
            if (stmt.else_branch) {
                false_code = [];
                compile_stmt(stmt.else_branch, false_code, register_context);
            }
            else {
                false_code = null;
            }
            instructions.push(new bytecode.If(stmt.span, cond, true_code, false_code));
            break;
        }
        case 'ReturnStmt': {
            let e;
            if (stmt.value) {
                e = compile_expr(stmt.value, instructions, register_context);
            }
            else {
                e = new runtime.Nil();
            }
            instructions.push(new bytecode.Return(stmt.span, e));
            break;
        }
        case 'WhileStmt': {
            let check_code = [];
            let check = compile_expr(stmt.condition, check_code, register_context);
            let body_code = [];
            compile_stmt(stmt.body, body_code, register_context);
            instructions.push(new bytecode.While(stmt.span, check_code, check, body_code));
            break;
        }
    }
}
function compile_expr(expr, instructions, register_context) {
    switch (expr.type) {
        case 'BinaryExpr': {
            let l = compile_expr(expr.left, instructions, register_context);
            let r = compile_expr(expr.right, instructions, register_context);
            let reg = register_context.new_register();
            instructions.push(new bytecode.BinaryOp(expr.span, l, r, expr.op, reg));
            return reg;
        }
        case 'UnaryExpr': {
            let v = compile_expr(expr.operand, instructions, register_context);
            let reg = register_context.new_register();
            instructions.push(new bytecode.UnaryOp(expr.span, v, expr.operator, reg));
            return reg;
        }
        case 'VarExpr': {
            let reg = register_context.new_register();
            instructions.push(new bytecode.ReadVar(expr.span, expr.name, reg));
            return reg;
        }
        case 'StringLiteral': {
            return new runtime.String(expr.value);
        }
        case 'NumberLiteral': {
            return new runtime.Number(expr.value);
        }
        case 'BoolLiteral': {
            return new runtime.Bool(expr.value);
        }
        case 'NilLiteral': {
            return new runtime.Nil();
        }
        case 'AssignExpr': {
            let v = compile_expr(expr.value, instructions, register_context);
            instructions.push(new bytecode.Assign(expr.span, expr.name, v));
            return v;
        }
        case 'CallExpr': {
            let callee = compile_expr(expr.callee, instructions, register_context);
            let args = [];
            for (let a_ast of expr.args) {
                args.push(compile_expr(a_ast, instructions, register_context));
            }
            let reg = register_context.new_register();
            instructions.push(new bytecode.Call(expr.span, callee, args, reg));
            return reg;
        }
        case 'LogicalExpr': {
            throw new Error("not implemented yet"); // TODO
            break;
        }
    }
}
