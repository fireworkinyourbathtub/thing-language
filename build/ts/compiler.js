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
class RegisterContext {
    constructor() {
        this.register_i = 0;
    }
    new_register() {
        return new bytecode.Register(this.register_i++);
    }
}
class Compiler {
    constructor(register_context) {
        this.register_context = register_context;
        this.instructions = [];
    }
    compile_stmt(stmt) {
        stmt.accept(this);
    }
    compile_expr(expr) {
        return expr.accept(this);
    }
    make_stmt_marker(stmt) {
        this.instruction(new bytecode.StmtMarker(stmt.span));
    }
    visitExprStmt(stmt) {
        this.make_stmt_marker(stmt);
        this.compile_expr(stmt.expr);
    }
    visitPrintStmt(stmt) {
        this.make_stmt_marker(stmt);
        let e = this.compile_expr(stmt.expr);
        this.instruction(new bytecode.Print(stmt.span, e));
    }
    visitVarStmt(stmt) {
        this.make_stmt_marker(stmt);
        let e;
        if (stmt.initializer) {
            e = this.compile_expr(stmt.initializer);
        }
        else {
            e = new bytecode.Nil();
        }
        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, e));
    }
    visitBlockStmt(stmt) {
        this.make_stmt_marker(stmt);
        this.instruction(new bytecode.StartScope(stmt.obrace_sp));
        for (let sub_stmt of stmt.stmts) {
            sub_stmt.accept(this);
        }
        this.instruction(new bytecode.EndScope(stmt.cbrace_sp));
    }
    visitFunctionStmt(stmt) {
        this.make_stmt_marker(stmt);
        let register_context = new RegisterContext();
        let fn_compiler = new Compiler(register_context);
        fn_compiler.compile_stmt(stmt.body);
        let fn = new bytecode.Function(stmt.name, stmt.params, fn_compiler.instructions);
        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, fn));
    }
    visitForStmt(stmt) {
        this.make_stmt_marker(stmt);
        this.instruction(new bytecode.StartScope(stmt.for_sp));
        if (stmt.initializer) {
            this.compile_stmt(stmt.initializer);
        }
        let check_compiler = new Compiler(this.register_context);
        let check;
        if (stmt.compare) {
            check = check_compiler.compile_expr(stmt.compare);
        }
        else {
            check = new bytecode.Constant(true);
        }
        let body_compiler = new Compiler(this.register_context);
        body_compiler.compile_stmt(stmt.body);
        if (stmt.increment) {
            body_compiler.compile_expr(stmt.increment);
        }
        this.instruction(new bytecode.While(stmt.span, check_compiler.instructions, check, body_compiler.instructions));
        this.instruction(new bytecode.EndScope(stmt.for_sp)); // TODO: better span?
    }
    visitIfStmt(stmt) {
        this.make_stmt_marker(stmt);
        let cond = this.compile_expr(stmt.condition);
        let true_compiler = new Compiler(this.register_context);
        true_compiler.compile_stmt(stmt.then_branch);
        let false_compiler;
        if (stmt.else_branch) {
            false_compiler = new Compiler(this.register_context);
            false_compiler.compile_stmt(stmt.else_branch);
        }
        else {
            false_compiler = null;
        }
        this.instruction(new bytecode.If(stmt.span, cond, true_compiler.instructions, false_compiler ? false_compiler.instructions : null));
    }
    visitReturnStmt(stmt) {
        this.make_stmt_marker(stmt);
        let e;
        if (stmt.value) {
            e = this.compile_expr(stmt.value);
        }
        else {
            e = new bytecode.Nil();
        }
        this.instruction(new bytecode.Return(stmt.span, e));
    }
    visitWhileStmt(stmt) {
        this.make_stmt_marker(stmt);
        let check_compiler = new Compiler(this.register_context);
        let check = check_compiler.compile_expr(stmt.condition);
        let body_compiler = new Compiler(this.register_context);
        body_compiler.compile_stmt(stmt.body);
        this.instruction(new bytecode.While(stmt.span, check_compiler.instructions, check, body_compiler.instructions));
    }
    visitBinaryExpr(expr) {
        let l = this.compile_expr(expr.left);
        let r = this.compile_expr(expr.right);
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.BinaryOp(expr.span, l, r, expr.op, reg));
        return reg;
    }
    visitUnaryExpr(expr) {
        let v = this.compile_expr(expr.operand);
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.UnaryOp(expr.span, v, expr.operator, reg));
        return reg;
    }
    visitVarExpr(expr) {
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.ReadVar(expr.span, expr.name, reg));
        return reg;
    }
    visitStringLiteral(expr) {
        return new bytecode.Constant(expr.value);
    }
    visitNumberLiteral(expr) {
        return new bytecode.Constant(expr.value);
    }
    visitBoolLiteral(expr) {
        return new bytecode.Constant(expr.value);
    }
    visitNilLiteral(expr) {
        return new bytecode.Nil();
    }
    visitAssignExpr(expr) {
        let v = this.compile_expr(expr.value);
        this.instruction(new bytecode.Assign(expr.span, expr.name, v));
        return v;
    }
    visitCallExpr(expr) {
        console.log(expr);
        let callee = this.compile_expr(expr.callee);
        let args = [];
        for (let a_ast of expr.args) {
            args.push(this.compile_expr(a_ast));
        }
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.Call(expr.span, callee, args, reg));
        return reg;
    }
    visitLogicalExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    instruction(instr) {
        this.instructions.push(instr);
    }
}
function compile(stmts) {
    let register_context = new RegisterContext();
    let compiler = new Compiler(register_context);
    for (let stmt of stmts) {
        compiler.compile_stmt(stmt);
    }
    return compiler.instructions;
}
exports.compile = compile;
