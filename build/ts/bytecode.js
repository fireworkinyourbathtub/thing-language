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
exports.PrettyPrintContext = exports.StmtMarker = exports.UnaryOp = exports.BinaryOp = exports.Call = exports.Assign = exports.ReadVar = exports.EndScope = exports.StartScope = exports.Return = exports.If = exports.While = exports.DefineFun = exports.MakeVar = exports.Print = exports.Constant = exports.Nil = exports.Register = void 0;
const diagnostics = __importStar(require("./diagnostics"));
const ast = __importStar(require("./ast"));
class Register {
    constructor(index) {
        this.index = index;
    }
    pretty_print() { return `%${this.index}`; }
}
exports.Register = Register;
class Nil {
    constructor() { }
    pretty_print() { return `nil`; }
}
exports.Nil = Nil;
class Constant {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return this.x; }
}
exports.Constant = Constant;
class Print {
    constructor(span, expr) {
        this.span = span;
        this.expr = expr;
    }
    pretty_print(ppc) {
        ppc.append(`print ${this.expr.pretty_print()};`, this.span);
    }
}
exports.Print = Print;
class MakeVar {
    constructor(span, name, value) {
        this.span = span;
        this.name = name;
        this.value = value;
    }
    pretty_print(ppc) {
        ppc.append(`make_var ${this.name} = ${this.value.pretty_print()};`, this.span);
    }
}
exports.MakeVar = MakeVar;
class DefineFun {
    constructor(span, name, params, instructions) {
        this.span = span;
        this.name = name;
        this.params = params;
        this.instructions = instructions;
    }
    pretty_print(ppc) {
        let params_str = '';
        ppc.append(`define_function ${this.name}(${this.params.join()}) {`, this.span);
        ppc.indent();
        ppc.pretty_print_instrs(this.instructions);
        ppc.dedent();
        ppc.append_no_span(`}`);
    }
}
exports.DefineFun = DefineFun;
class While {
    constructor(span, check_code, check, body_code) {
        this.span = span;
        this.check_code = check_code;
        this.check = check;
        this.body_code = body_code;
    }
    pretty_print(ppc) {
        ppc.append('while {', this.span);
        ppc.indent();
        ppc.pretty_print_instrs(this.check_code);
        ppc.append_no_span(`check ${this.check.pretty_print()}`);
        ppc.dedent();
        ppc.append_no_span('}');
        ppc.append_no_span('{');
        ppc.indent();
        ppc.pretty_print_instrs(this.body_code);
        ppc.dedent();
        ppc.append_no_span('}');
    }
}
exports.While = While;
class If {
    constructor(span, cond, true_branch, false_branch) {
        this.span = span;
        this.cond = cond;
        this.true_branch = true_branch;
        this.false_branch = false_branch;
    }
    pretty_print(ppc) {
        ppc.append('if ${this.cond.pretty_print()} {', this.span);
        ppc.indent();
        ppc.pretty_print_instrs(this.true_branch);
        ppc.dedent();
        if (this.false_branch) {
            ppc.append_no_span('} else {');
            ppc.indent();
            ppc.pretty_print_instrs(this.false_branch);
            ppc.dedent();
            ppc.append_no_span('}');
        }
        else {
            ppc.append_no_span('}');
        }
    }
}
exports.If = If;
class Return {
    constructor(span, v) {
        this.span = span;
        this.v = v;
    }
    pretty_print(ppc) {
        ppc.append(`return ${this.v.pretty_print()};`, this.span);
    }
}
exports.Return = Return;
class StartScope {
    constructor(span) {
        this.span = span;
    }
    pretty_print(ppc) {
        ppc.append(`start_scope;`, this.span);
    }
}
exports.StartScope = StartScope;
class EndScope {
    constructor(span) {
        this.span = span;
    }
    pretty_print(ppc) {
        ppc.append(`end_scope;`, this.span);
    }
}
exports.EndScope = EndScope;
class ReadVar {
    constructor(span, v, dest) {
        this.span = span;
        this.v = v;
        this.dest = dest;
    }
    pretty_print(ppc) {
        ppc.append(`read_var ${this.v} -> ${this.dest.pretty_print()};`, this.span);
    }
}
exports.ReadVar = ReadVar;
class Assign {
    constructor(span, variable, value) {
        this.span = span;
        this.variable = variable;
        this.value = value;
    }
    pretty_print(ppc) {
        ppc.append(`assign ${this.variable} = ${this.value.pretty_print()};`, this.span);
    }
}
exports.Assign = Assign;
class Call {
    constructor(span, callee, args, dest) {
        this.span = span;
        this.callee = callee;
        this.args = args;
        this.dest = dest;
    }
    pretty_print(ppc) {
        ppc.append(`call ${this.callee.pretty_print()}(${this.args.map(a => a.pretty_print()).join()}) -> ${this.dest.pretty_print()};`, this.span);
    }
}
exports.Call = Call;
class BinaryOp {
    constructor(span, l, r, op, dest) {
        this.span = span;
        this.l = l;
        this.r = r;
        this.op = op;
        this.dest = dest;
    }
    pretty_print(ppc) {
        let op_name;
        switch (this.op) {
            case ast.BinaryOperator.Plus:
                op_name = 'add';
                break;
            case ast.BinaryOperator.Minus:
                op_name = 'sub';
                break;
            case ast.BinaryOperator.Star:
                op_name = 'mul';
                break;
            case ast.BinaryOperator.Slash:
                op_name = 'div';
                break;
            case ast.BinaryOperator.Less:
                op_name = 'cmp<';
                break;
            case ast.BinaryOperator.Greater:
                op_name = 'cmp>';
                break;
            case ast.BinaryOperator.LessEqual:
                op_name = 'cmp<=';
                break;
            case ast.BinaryOperator.EqualEqual:
                op_name = 'cmp==';
                break;
            case ast.BinaryOperator.GreaterEqual:
                op_name = 'cmp>=';
                break;
            case ast.BinaryOperator.BangEqual:
                op_name = 'cmp!=';
                break;
        }
        ppc.append(`${op_name} ${this.l.pretty_print()} ${this.r.pretty_print()} -> ${this.dest.pretty_print()};`, this.span);
    }
}
exports.BinaryOp = BinaryOp;
class UnaryOp {
    constructor(span, v, op, dest) {
        this.span = span;
        this.v = v;
        this.op = op;
        this.dest = dest;
    }
    pretty_print(ppc) {
        let op_name;
        switch (this.op) {
            case ast.UnaryOperator.Minus:
                op_name = 'neg';
                break;
            case ast.UnaryOperator.Bang:
                op_name = 'logic_neg';
                break;
        }
        ppc.append(`${op_name} ${this.v.pretty_print()} -> ${this.dest.pretty_print()};`, this.span);
    }
}
exports.UnaryOp = UnaryOp;
class StmtMarker {
    constructor(span) {
        this.span = span;
    }
    pretty_print(ppc) {
        ppc.append_marker(`// line ${this.span.start_line}: ${diagnostics.get_line(this.span.source, this.span.start_line)}`);
    }
}
exports.StmtMarker = StmtMarker;
class PrettyPrintContext {
    constructor() {
        this.indentation = 0;
        this.result = '';
    }
    indent() {
        ++this.indentation;
    }
    dedent() {
        --this.indentation;
    }
    blank_line() {
        this.result += '\n';
    }
    append(s, sp) {
        let sp_contents = sp.contents;
        let sp_annotation = sp_contents.split('\n').length > 1 ? `${sp_contents.split('\n')[0]}...` : sp_contents;
        this.append_no_span(`${s}${' '.repeat(40 - s.length)}// ${sp_annotation}`);
    }
    append_no_span(s) {
        this.result += `${' '.repeat(this.indentation * 4)}${s}\n`;
    }
    append_marker(s) {
        this.blank_line();
        this.append_no_span(s);
    }
    pretty_print_instrs(instrs) {
        for (let instr of instrs) {
            instr.pretty_print(this);
        }
    }
}
exports.PrettyPrintContext = PrettyPrintContext;
