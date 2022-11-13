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

function make_stmt_marker(stmt: ast.Stmt) {
    return { type: 'StmtMarker', span: stmt.span} as const;
}

export function compile(stmts: ast.Stmt[]): bytecode.Instruction[] {
    let register_context = new RegisterContext();
    let instructions: bytecode.Instruction[] = []

    for (let stmt of stmts) {
        compile_stmt(stmt, instructions, register_context);
    }

    return instructions;
}

function compile_stmt(stmt: ast.Stmt, instructions: bytecode.Instruction[], register_context: RegisterContext) {
    instructions.push(make_stmt_marker(stmt));

    switch (stmt.type) {
        case 'ExprStmt': {
            compile_expr(stmt.expr, instructions, register_context);
            break;
        }

        case 'PrintStmt': {
            let e = compile_expr(stmt.expr, instructions, register_context);
            instructions.push({ type: 'Print', span: stmt.span, value: e} as const);
            break;
        }

        case 'VarStmt': {
            let e;
            if (stmt.initializer) {
                e = compile_expr(stmt.initializer, instructions, register_context);
            } else {
                e = new runtime.Nil();
            }

            instructions.push({ type: 'MakeVar', span: stmt.span, name: stmt.name, value: e} as const);
            break;
        }

        case 'BlockStmt': {
            instructions.push({ type: 'StartScope', span: stmt.obrace_sp} as const);
            for (let sub_stmt of stmt.stmts) {
                compile_stmt(sub_stmt, instructions, register_context);
            }
            instructions.push({ type: 'EndScope', span: stmt.cbrace_sp} as const);
            break;
        }

        case 'FunctionStmt': {
            let register_context = new RegisterContext();
            let instrs: bytecode.Instruction[] = [];
            compile_stmt(stmt.body, instrs, register_context);

            let fn = new runtime.Function(stmt.name, stmt.params, instrs);
            instructions.push({ type: 'MakeVar', span: stmt.span, name: stmt.name, value: fn} as const);
            break;
        }

        case 'ForStmt': {
            instructions.push({ type: 'StartScope', span: stmt.for_sp} as const);
            if (stmt.initializer) {
                compile_stmt(stmt.initializer, instructions, register_context);
            }

            let check_code: bytecode.Instruction[] = [];
            let check;
            if (stmt.compare) {
                check = compile_expr(stmt.compare, check_code, register_context);
            } else {
                check = new runtime.Bool(true);
            }

            let body_code: bytecode.Instruction[] = [];
            compile_stmt(stmt.body, body_code, register_context);

            if (stmt.increment) {
                compile_expr(stmt.increment, body_code, register_context);
            }

            instructions.push({ type: 'While', span: stmt.span, check_code, check, body_code} as const);
            instructions.push({ type: 'EndScope', span: stmt.for_sp} as const); // TODO: better span?
            break;
        }

        case 'IfStmt': {
            let cond = compile_expr(stmt.condition, instructions, register_context);

            let true_code: bytecode.Instruction[] = [];
            compile_stmt(stmt.then_branch, true_code, register_context);

            let false_code: bytecode.Instruction[] | null;
            if (stmt.else_branch) {
                false_code = [];
                compile_stmt(stmt.else_branch, false_code, register_context);
            } else {
                false_code = null;
            }

            instructions.push({ type: 'If', span: stmt.span, cond, true_branch: true_code, false_branch: false_code} as const);
            break;
        }

        case 'ReturnStmt': {
            let e;
            if (stmt.value) {
                e = compile_expr(stmt.value, instructions, register_context);
            } else {
                e = new runtime.Nil();
            }

            instructions.push({ type: 'Return', span: stmt.span, value: e} as const);
            break;
        }

        case 'WhileStmt': {
            let check_code: bytecode.Instruction[] = [];
            let check = compile_expr(stmt.condition, check_code, register_context);

            let body_code: bytecode.Instruction[] = [];
            compile_stmt(stmt.body, body_code, register_context);

            instructions.push({ type: 'While', span: stmt.span, check_code, check, body_code} as const);
            break;
        }

    }
}

function compile_expr(expr: ast.Expr, instructions: bytecode.Instruction[], register_context: RegisterContext): runtime.Value {
    switch (expr.type) {
        case 'BinaryExpr': {
            let l = compile_expr(expr.left, instructions, register_context);
            let r = compile_expr(expr.right, instructions, register_context);

            let reg = register_context.new_register();

            instructions.push({ type: 'BinaryOp', span: expr.span, l, r, op: expr.op, dest: reg} as const);
            return reg;
        }

        case 'UnaryExpr': {
            let v = compile_expr(expr.operand, instructions, register_context);
            let reg = register_context.new_register();
            instructions.push({ type: 'UnaryOp', span: expr.span, v, op: expr.operator, dest: reg} as const);
            return reg;
        }

        case 'VarExpr': {
            let reg = register_context.new_register();
            instructions.push({ type: 'ReadVar', span: expr.span, name: expr.name, dest: reg} as const);
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
            let value = compile_expr(expr.value, instructions, register_context);
            instructions.push({ type: 'Assign', span: expr.span, name: expr.name, value} as const);
            return value;
        }

        case 'CallExpr': {
            let callee = compile_expr(expr.callee, instructions, register_context);

            let args = [];
            for (let a_ast of expr.args) {
                args.push(compile_expr(a_ast, instructions, register_context));
            }

            let reg = register_context.new_register();
            instructions.push({ type: 'Call', span: expr.span, callee, args, dest: reg} as const);
            return reg;
        }

        case 'LogicalExpr': {
            throw new Error("not implemented yet"); // TODO
        }
    }
}
