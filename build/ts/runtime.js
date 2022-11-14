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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bool = exports.Number = exports.String = exports.Function = exports.Nil = exports.Register = exports.Environment = void 0;
const vm = __importStar(require("./vm"));
class Environment {
    constructor(parent) {
        this.parent = parent;
        this.variables = new Map();
    }
    get_variable(name) {
        if (this.variables.has(name))
            return this.variables.get(name);
        else if (this.parent != null)
            return this.parent.get_variable(name);
        else
            throw new Error(`get variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
    }
    set_variable(name, value) {
        if (this.variables.has(name))
            this.variables.set(name, value);
        else if (this.parent != null)
            this.parent.set_variable(name, value);
        else
            throw new Error(`set variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
    }
    put_variable(name, value) {
        if (this.variables.has(name))
            throw new Error(`redefine variable '${name}'`);
        this.variables.set(name, value);
    }
}
exports.Environment = Environment;
class Register {
    constructor(index) {
        this.index = index;
    }
    pretty_print() { return `%${this.index}`; }
    resolve(registers) {
        return registers[this.index];
    }
}
exports.Register = Register;
class Nil {
    constructor() { }
    pretty_print() { return this.stringify(); }
    resolve() { return this; }
    is_truthy() { return false; }
    type() { return 'nil'; }
    stringify() { return 'nil'; }
}
exports.Nil = Nil;
class Function {
    constructor(name, params, instructions) {
        this.name = name;
        this.params = params;
        this.instructions = instructions;
        this.arity = this.params.length;
    }
    pretty_print() { return `<function>`; }
    resolve() { return this; }
    is_truthy() { return true; }
    type() { return 'function'; }
    stringify() { return `<function '${this.name}'>`; }
    call(globals, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let env = new Environment(globals);
            for (let i = 0; i < this.params.length; ++i) { // should be same size
                env.put_variable(this.params[i], args[i]);
            }
            return yield vm.interpret_(globals, env, this.instructions);
        });
    }
}
exports.Function = Function;
class String {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return `"${this.x}"`; }
    resolve() { return this; }
    is_truthy() { return true; }
    type() { return 'string'; }
    stringify() { return this.x; }
    ;
}
exports.String = String;
class Number {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return this.x.toString(); }
    resolve() { return this; }
    is_truthy() { return true; }
    type() { return 'number'; }
    stringify() { return this.x.toString(); }
}
exports.Number = Number;
class Bool {
    constructor(x) {
        this.x = x;
    }
    pretty_print() { return this.x.toString(); }
    resolve() { return this; }
    is_truthy() { return this.x; }
    type() { return 'bool'; }
    stringify() { return this.x.toString(); }
}
exports.Bool = Bool;
