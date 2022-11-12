import * as ast from './ast';
import * as bytecode from './bytecode';
import * as runtime from './runtime';
import * as diagnostics from './diagnostics';

class RegisterContext {
    register_i: number;

    constructor() {
        this.register_i = 0;
    }

    new_register(): runtime.Register {
        return new runtime.Register(this.register_i++);
    }
}

class Compiler implements ast.StmtVisitor<void>, ast.ExprVisitor<runtime.Value> {
    instructions: bytecode.Instruction[]

    constructor(public register_context: RegisterContext) {
        this.instructions = []
    }

    compile_stmt(stmt: ast.Stmt) {
        stmt.accept(this);
    }

    compile_expr(expr: ast.Expr): runtime.Value {
        return expr.accept(this);
    }

    make_stmt_marker(stmt: ast.Stmt) {
        this.instruction(new bytecode.StmtMarker(stmt.span));
    }

    visitExprStmt(stmt: ast.ExprStmt) {
        this.make_stmt_marker(stmt);
        this.compile_expr(stmt.expr);
    }

    visitPrintStmt(stmt: ast.PrintStmt) {
        this.make_stmt_marker(stmt);
        let e = this.compile_expr(stmt.expr);
        this.instruction(new bytecode.Print(stmt.span, e));
    }

    visitVarStmt(stmt: ast.VarStmt) {
        this.make_stmt_marker(stmt);
        let e;
        if (stmt.initializer) {
            e = this.compile_expr(stmt.initializer);
        } else {
            e = new runtime.Nil();
        }

        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, e));
    }

    visitBlockStmt(stmt: ast.BlockStmt) {
        this.make_stmt_marker(stmt);
        this.instruction(new bytecode.StartScope(stmt.obrace_sp));
        for (let sub_stmt of stmt.stmts) {
            sub_stmt.accept(this);
        }
        this.instruction(new bytecode.EndScope(stmt.cbrace_sp));
    }

    visitFunctionStmt(stmt: ast.FunctionStmt) {
        this.make_stmt_marker(stmt);
        let register_context = new RegisterContext();
        let fn_compiler = new Compiler(register_context);
        fn_compiler.compile_stmt(stmt.body);

        let fn = new runtime.Function(stmt.name, stmt.params, fn_compiler.instructions);
        this.instruction(new bytecode.MakeVar(stmt.span, stmt.name, fn));
    }

    visitForStmt(stmt: ast.ForStmt) {
        this.make_stmt_marker(stmt);
        this.instruction(new bytecode.StartScope(stmt.for_sp));
        if (stmt.initializer) {
            this.compile_stmt(stmt.initializer);
        }

        let check_compiler = new Compiler(this.register_context);
        let check;
        if (stmt.compare) {
            check = check_compiler.compile_expr(stmt.compare);
        } else {
            check = new runtime.Bool(true);
        }

        let body_compiler = new Compiler(this.register_context);
        body_compiler.compile_stmt(stmt.body);

        if (stmt.increment) {
            body_compiler.compile_expr(stmt.increment);
        }

        this.instruction(new bytecode.While(stmt.span, check_compiler.instructions, check, body_compiler.instructions));
        this.instruction(new bytecode.EndScope(stmt.for_sp)); // TODO: better span?
    }

    visitIfStmt(stmt: ast.IfStmt) {
        this.make_stmt_marker(stmt);
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
        this.make_stmt_marker(stmt);
        let e;
        if (stmt.value) {
            e = this.compile_expr(stmt.value);
        } else {
            e = new runtime.Nil();
        }

        this.instruction(new bytecode.Return(stmt.span, e));
    }

    visitWhileStmt(stmt: ast.WhileStmt) {
        this.make_stmt_marker(stmt);
        let check_compiler = new Compiler(this.register_context);
        let check = check_compiler.compile_expr(stmt.condition);

        let body_compiler = new Compiler(this.register_context);
        body_compiler.compile_stmt(stmt.body);

        this.instruction(new bytecode.While(stmt.span, check_compiler.instructions, check, body_compiler.instructions));
    }

    visitBinaryExpr(expr: ast.BinaryExpr): runtime.Value {
        let l = this.compile_expr(expr.left);
        let r = this.compile_expr(expr.right);

        let reg = this.register_context.new_register();

        this.instruction(new bytecode.BinaryOp(expr.span, l, r, expr.op, reg));
        return reg;
    }

    visitUnaryExpr(expr: ast.UnaryExpr): runtime.Value {
        let v = this.compile_expr(expr.operand);
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.UnaryOp(expr.span, v, expr.operator, reg));
        return reg;
    }

    visitVarExpr(expr: ast.VarExpr): runtime.Value {
        let reg = this.register_context.new_register();
        this.instruction(new bytecode.ReadVar(expr.span, expr.name, reg));
        return reg;
    }

    visitStringLiteral(expr: ast.StringLiteral): runtime.Value {
        return new runtime.String(expr.value);
    }

    visitNumberLiteral(expr: ast.NumberLiteral): runtime.Value {
        return new runtime.Number(expr.value);
    }

    visitBoolLiteral(expr: ast.BoolLiteral): runtime.Value {
        return new runtime.Bool(expr.value);
    }

    visitNilLiteral(expr: ast.NilLiteral): runtime.Value {
        return new runtime.Nil();
    }

    visitAssignExpr(expr: ast.AssignExpr): runtime.Value {
        let v = this.compile_expr(expr.value);
        this.instruction(new bytecode.Assign(expr.span, expr.name, v));
        return v;
    }

    visitCallExpr(expr: ast.CallExpr): runtime.Value {
        let callee = this.compile_expr(expr.callee);

        let args = [];
        for (let a_ast of expr.args) {
            args.push(this.compile_expr(a_ast));
        }

        let reg = this.register_context.new_register();
        this.instruction(new bytecode.Call(expr.span, callee, args, reg));
        return reg;
    }

    visitLogicalExpr(expr: ast.LogicalExpr): runtime.Value {
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
