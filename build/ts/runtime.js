"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bool = exports.Number = exports.String = exports.Function = exports.Nil = exports.Register = exports.Environment = void 0;
class Environment {
    constructor(parent) {
        this.parent = parent;
        this.registers = [];
        this.variables = new Map();
    }
    get_register(index) {
        if (index >= this.registers.length) {
            throw new Error('internal error: get register that doesn\'t exist'); // TODO: new runtime error class to catch
        }
        else {
            return this.registers[index];
        }
    }
    put_register(index, value) {
        this.registers[index] = value;
    }
    get_variable(name) {
        if (!this.variables.has(name))
            throw new Error(`get variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
        else
            return this.variables.get(name);
    }
    set_variable(name, value) {
        if (!this.variables.has(name))
            throw new Error(`set variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
        else
            this.variables.set(name, value);
    }
    put_variable(name, value) {
        this.variables.set(name, value);
    }
}
exports.Environment = Environment;
class Register {
    constructor(index) {
        this.index = index;
    }
    pretty_print() { return `%${this.index}`; }
    to_runtime_value(env) {
        return env.get_register(this.index);
    }
}
exports.Register = Register;
class Nil {
    constructor() { }
    pretty_print() { return 'nil'; }
    to_runtime_value() { return this; }
    is_truthy() { return false; }
}
exports.Nil = Nil;
class Function {
    constructor(name, params, instructions) {
        this.name = name;
        this.params = params;
        this.instructions = instructions;
    }
    pretty_print() { return `<function '${this.name}'>`; }
    to_runtime_value() { return this; }
    is_truthy() { return true; }
}
exports.Function = Function;
class String {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return `"${this.x}"`; }
    to_runtime_value() { return this; }
    is_truthy() { return true; }
}
exports.String = String;
class Number {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return this.x.toString(); }
    to_runtime_value() { return this; }
    is_truthy() { return true; }
}
exports.Number = Number;
class Bool {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return this.x.toString(); }
    to_runtime_value() { return this; }
    is_truthy() { return this.x; }
}
exports.Bool = Bool;
