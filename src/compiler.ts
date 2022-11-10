import * as ast from './ast';
import * as bytecode from './bytecode';
import * as diagnostics from './diagnostics';

class StmtCompiler implements ast.StmtVisitor<void> {
    constructor(public instructions: bytecode.Instruction[]) {}

    visitExprStmt(stmt: ast.ExprStmt) {
        compile_expr(this.instructions, stmt.expr);
    }

    visitPrintStmt(stmt: ast.PrintStmt & diagnostics.Located) {
        let e = compile_expr(this.instructions, stmt.expr);
        this.instruction(new bytecode.Print(stmt.span, e));
    }

    visitVarStmt(stmt: ast.VarStmt) {
        let e;
        if (stmt.initializer) {
            e = compile_expr(this.instructions, stmt.initializer);
        } else {
            e = new bytecode.Nil();
        }

        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, e));
    }

    visitBlockStmt(stmt: ast.BlockStmt) {
        for (let sub_stmt of stmt.stmts) {
            sub_stmt.accept(this);
        }
    }

    visitFunctionStmt(stmt: ast.FunctionStmt) {
        let fn_instructions: bytecode.Instruction[] = [];
        compile_stmt(fn_instructions, stmt.body);

        this.instruction(new bytecode.DefineFun(stmt.span, stmt.name, stmt.params, fn_instructions));
    }

    visitForStmt(stmt: ast.ForStmt) {
        throw new Error("not implemented yet"); // TODO
    }

    visitIfStmt(stmt: ast.IfStmt) {
        throw new Error("not implemented yet"); // TODO
    }

    visitReturnStmt(stmt: ast.ReturnStmt) {
        throw new Error("not implemented yet"); // TODO
    }

    visitWhileStmt(stmt: ast.WhileStmt) {
        throw new Error("not implemented yet"); // TODO
    }

    instruction(instr: bytecode.Instruction) {
        this.instructions.push(instr);
    }
}

class ExprCompiler implements ast.ExprVisitor<bytecode.Value> {
    constructor(public instructions: bytecode.Instruction[]) {}

    visitBinaryExpr(expr: ast.BinaryExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitUnaryExpr(expr: ast.UnaryExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitVarExpr(expr: ast.VarExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitStringLiteral(expr: ast.StringLiteral): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitNumberLiteral(expr: ast.NumberLiteral): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitBoolLiteral(expr: ast.BoolLiteral): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitNilLiteral(expr: ast.NilLiteral): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitAssignExpr(expr: ast.AssignExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitCallExpr(expr: ast.CallExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitGetExpr(expr: ast.GetExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitLogicalExpr(expr: ast.LogicalExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitSetExpr(expr: ast.SetExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitThisExpr(expr: ast.ThisExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    instruction(instr: bytecode.Instruction) {
        this.instructions.push(instr);
    }
}

export function compile(stmts: ast.Stmt[]): bytecode.Instruction[] {
    let instructions: bytecode.Instruction[] = [];


    for (let stmt of stmts) {
        compile_stmt(instructions, stmt);
    }

    return instructions;
}

function compile_stmt(instructions: bytecode.Instruction[], stmt: ast.Stmt & diagnostics.Located) {
    stmt.accept(new StmtCompiler(instructions));
}

function compile_expr(instructions: bytecode.Instruction[], expr: ast.Expr & diagnostics.Located): bytecode.Value {
    return expr.accept(new ExprCompiler(instructions));
}
