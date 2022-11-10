"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefineFun = exports.MakeVar = exports.Print = exports.Nil = exports.Register = void 0;
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
