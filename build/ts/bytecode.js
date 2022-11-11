"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnaryOp = exports.BinaryOp = exports.Call = exports.Assign = exports.ReadVar = exports.EndScope = exports.StartScope = exports.Return = exports.If = exports.While = exports.DefineFun = exports.MakeVar = exports.Print = exports.Constant = exports.Nil = exports.Register = void 0;
class Register {
    constructor(index) {
        this.index = index;
    }
}
exports.Register = Register;
class Nil {
    constructor() { }
}
exports.Nil = Nil;
class Constant {
    constructor(x) {
        this.x = x;
    }
}
exports.Constant = Constant;
class Print {
    constructor(span, expr) {
        this.span = span;
        this.expr = expr;
    }
    pretty_print() {
        return `print ${this.expr};`;
    }
}
exports.Print = Print;
class MakeVar {
    constructor(span, name, value) {
        this.span = span;
        this.name = name;
        this.value = value;
    }
    pretty_print() {
        return `make_var ${this.name} = ${this.value};`;
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
    pretty_print() {
        return `define_function ${this.name} (${this.params}) { /* TODO */ };`;
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
    pretty_print() {
        return `while ${this.check} { /* TODO */ };`;
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
    pretty_print() {
        return `if ${this.cond} { /* TODO */ };`;
    }
}
exports.If = If;
class Return {
    constructor(span, v) {
        this.span = span;
        this.v = v;
    }
    pretty_print() {
        return `return ${this.v};`;
    }
}
exports.Return = Return;
class StartScope {
    constructor(span) {
        this.span = span;
    }
    pretty_print() {
        return `start_scope;`;
    }
}
exports.StartScope = StartScope;
class EndScope {
    constructor(span) {
        this.span = span;
    }
    pretty_print() {
        return `end_scope;`;
    }
}
exports.EndScope = EndScope;
class ReadVar {
    constructor(span, v, dest) {
        this.span = span;
        this.v = v;
        this.dest = dest;
    }
    pretty_print() {
        return `read_var ${this.v} -> ${this.dest};`;
    }
}
exports.ReadVar = ReadVar;
class Assign {
    constructor(span, variable, value) {
        this.span = span;
        this.variable = variable;
        this.value = value;
    }
    pretty_print() {
        return `assign ${this.variable} = ${this.value};`;
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
    pretty_print() {
        return `call ${this.callee}(${this.args}) -> ${this.dest};`;
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
    pretty_print() {
        // return `call ${this.callee}(${this.args}) -> ${this.dest};`;
        throw new Error("not implemented yet");
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
    pretty_print() {
        // return `call ${this.callee}(${this.args}) -> ${this.dest};`;
        throw new Error("not implemented yet");
    }
}
exports.UnaryOp = UnaryOp;
