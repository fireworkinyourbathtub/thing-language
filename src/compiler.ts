import * as ast from './ast';
import * as bytecode from './bytecode';
import * as diagnostics from './diagnostics';

class RegisterContext {
    register_i: number;

    constructor() {
        this.register_i = 0;
    }

    new_register(): bytecode.Register {
        return new bytecode.Register(this.register_i++);
    }
}

class Compiler implements ast.StmtVisitor<void>, ast.ExprVisitor<bytecode.Value> {
    instructions: bytecode.Instruction[]

    constructor(public register_context: RegisterContext) {
        this.instructions = []
    }

    compile_stmt(stmt: ast.Stmt) {
        stmt.accept(this);
    }

    compile_expr(expr: ast.Expr): bytecode.Value {
        return expr.accept(this);
    }

    visitExprStmt(stmt: ast.ExprStmt) {
        this.compile_expr(stmt.expr);
    }

    visitPrintStmt(stmt: ast.PrintStmt & diagnostics.Located) {
        let e = this.compile_expr(stmt.expr);
        this.instruction(new bytecode.Print(stmt.span, e));
    }

    visitVarStmt(stmt: ast.VarStmt) {
        let e;
        if (stmt.initializer) {
            e = this.compile_expr(stmt.initializer);
        } else {
            e = new bytecode.Nil();
        }

        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, e));
    }

    visitBlockStmt(stmt: ast.BlockStmt) {
        this.instruction(new bytecode.StartScope(stmt.span)); // TODO: better span?
        for (let sub_stmt of stmt.stmts) {
            sub_stmt.accept(this);
        }
        this.instruction(new bytecode.EndScope(stmt.span)); // TODO: better span?
    }

    visitFunctionStmt(stmt: ast.FunctionStmt) {
        let register_context = new RegisterContext();
        let fn_compiler = new Compiler(register_context);
        fn_compiler.compile_stmt(stmt.body);

        this.instruction(new bytecode.DefineFun(stmt.span, stmt.name, stmt.params, fn_compiler.instructions));
    }

    visitForStmt(stmt: ast.ForStmt) {
        this.instruction(new bytecode.StartScope(stmt.span)); // TODO: better span?
        if (stmt.initializer) {
            this.compile_stmt(stmt.initializer);
        }

        let check_compiler = new Compiler(this.register_context);
        let check;
        if (stmt.compare) {
            check = check_compiler.compile_expr(stmt.compare);
        } else {
            check = new bytecode.Constant(true);
        }

        let body_compiler = new Compiler(this.register_context);
        body_compiler.compile_stmt(stmt.body);

        if (stmt.increment) {
            body_compiler.compile_expr(stmt.increment);
        }

        this.instruction(new bytecode.While(stmt.span, check_compiler.instructions, check, body_compiler.instructions));
        this.instruction(new bytecode.EndScope(stmt.span)); // TODO: better span?
    }

    visitIfStmt(stmt: ast.IfStmt) {
        let cond = this.compile_expr(stmt.condition);

        let true_compiler = new Compiler(this.register_context);
        true_compiler.compile_stmt(stmt.then_branch);

        let false_compiler;
        if (stmt.else_branch) {
            false_compiler = new Compiler(this.register_context);
            false_compiler.compile_stmt(stmt.else_branch);
        } else {
            false_compiler = null;
        }

        this.instruction(new bytecode.If(stmt.span, cond, true_compiler.instructions, false_compiler ? false_compiler.instructions : null));
    }

    visitReturnStmt(stmt: ast.ReturnStmt) {
        let e;
        if (stmt.value) {
            e = this.compile_expr(stmt.value);
        } else {
            e = new bytecode.Nil();
        }

        this.instruction(new bytecode.Return(stmt.span, e));
    }

    visitWhileStmt(stmt: ast.WhileStmt) {
        let check_compiler = new Compiler(this.register_context);
        let check = check_compiler.compile_expr(stmt.condition);

        let body_compiler = new Compiler(this.register_context);
        body_compiler.compile_stmt(stmt.body);

        this.instruction(new bytecode.While(stmt.span, check_compiler.instructions, check, body_compiler.instructions));
    }

    visitBinaryExpr(expr: ast.BinaryExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitUnaryExpr(expr: ast.UnaryExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitVarExpr(expr: ast.VarExpr): bytecode.Value {
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.ReadVar(expr.span, expr.name, reg));
        return reg;
    }

    visitStringLiteral(expr: ast.StringLiteral): bytecode.Value {
        return new bytecode.Constant(expr.value);
    }

    visitNumberLiteral(expr: ast.NumberLiteral): bytecode.Value {
        return new bytecode.Constant(expr.value);
    }

    visitBoolLiteral(expr: ast.BoolLiteral): bytecode.Value {
        return new bytecode.Constant(expr.value);
    }

    visitNilLiteral(expr: ast.NilLiteral): bytecode.Value {
        return new bytecode.Nil();
    }

    visitAssignExpr(expr: ast.AssignExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitCallExpr(expr: ast.CallExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    visitLogicalExpr(expr: ast.LogicalExpr): bytecode.Value {
        throw new Error("not implemented yet"); // TODO
    }

    instruction(instr: bytecode.Instruction) {
        this.instructions.push(instr);
    }
}

export function compile(stmts: ast.Stmt[]): bytecode.Instruction[] {
    let register_context = new RegisterContext();
    let compiler = new Compiler(register_context);

    for (let stmt of stmts) {
        compiler.compile_stmt(stmt);
    }

    return compiler.instructions;
}
