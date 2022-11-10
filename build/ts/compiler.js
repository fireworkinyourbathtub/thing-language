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
class StmtCompiler {
    constructor(instructions) {
        this.instructions = instructions;
    }
    visitExprStmt(stmt) {
        compile_expr(this.instructions, stmt.expr);
    }
    visitPrintStmt(stmt) {
        let e = compile_expr(this.instructions, stmt.expr);
        this.instruction(new bytecode.Print(stmt.span, e));
    }
    visitVarStmt(stmt) {
        let e;
        if (stmt.initializer) {
            e = compile_expr(this.instructions, stmt.initializer);
        }
        else {
            e = new bytecode.Nil();
        }
        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, e));
    }
    visitBlockStmt(stmt) {
        for (let sub_stmt of stmt.stmts) {
            sub_stmt.accept(this);
        }
    }
    visitFunctionStmt(stmt) {
        let fn_instructions = [];
        compile_stmt(fn_instructions, stmt.body);
        this.instruction(new bytecode.DefineFun(stmt.span, stmt.name, stmt.params, fn_instructions));
    }
    visitForStmt(stmt) {
        throw new Error("not implemented yet"); // TODO
    }
    visitIfStmt(stmt) {
        throw new Error("not implemented yet"); // TODO
    }
    visitReturnStmt(stmt) {
        throw new Error("not implemented yet"); // TODO
    }
    visitWhileStmt(stmt) {
        throw new Error("not implemented yet"); // TODO
    }
    instruction(instr) {
        this.instructions.push(instr);
    }
}
class ExprCompiler {
    constructor(instructions) {
        this.instructions = instructions;
    }
    visitBinaryExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitUnaryExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitVarExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitStringLiteral(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitNumberLiteral(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitBoolLiteral(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitNilLiteral(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitAssignExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitCallExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitGetExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitLogicalExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitSetExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    visitThisExpr(expr) {
        throw new Error("not implemented yet"); // TODO
    }
    instruction(instr) {
        this.instructions.push(instr);
    }
}
function compile(stmts) {
    let instructions = [];
    for (let stmt of stmts) {
        compile_stmt(instructions, stmt);
    }
    return instructions;
}
exports.compile = compile;
function compile_stmt(instructions, stmt) {
    stmt.accept(new StmtCompiler(instructions));
}
function compile_expr(instructions, expr) {
    return expr.accept(new ExprCompiler(instructions));
}
