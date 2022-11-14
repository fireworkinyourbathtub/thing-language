import * as bytecode from './bytecode';
import * as vm from './vm';

export class Environment {
    variables: Map<string, RuntimeValue> = new Map();

    constructor(public parent: Environment | null) {}

    get_variable(name: string): RuntimeValue {
        if (this.variables.has(name)) return this.variables.get(name)!;
        else if (this.parent != null) return this.parent.get_variable(name);
        else throw new Error(`get variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
    }

    set_variable(name: string, value: RuntimeValue)  {
        if (this.variables.has(name)) this.variables.set(name, value);
        else if (this.parent != null) this.parent.set_variable(name, value);
        else throw new Error(`set variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
    }

    put_variable(name: string, value: RuntimeValue) {
        if (this.variables.has(name)) throw new Error(`redefine variable '${name}'`)
        this.variables.set(name, value);
    }
}

export interface Value {
    pretty_print(): string;
    resolve(registers: RuntimeValue[]): RuntimeValue;
}

export interface Callable {
    arity: number;
    call(globals: Environment, args: RuntimeValue[]): Promise<RuntimeValue>;
}

export interface RuntimeValue extends Value {
    is_truthy(): boolean;
    type(): string;
    stringify(): string;
}

export class Register implements Value {
    constructor(public index: number) {}
    pretty_print() { return `%${this.index}`; }

    resolve(registers: RuntimeValue[]) {
        return registers[this.index];
    }
}

export class Nil implements Value, RuntimeValue {
    constructor() {}
    pretty_print() { return this.stringify(); }

    resolve() { return this; }

    is_truthy() { return false; }
    type() { return 'nil'; }
    stringify() { return 'nil'; }
}

export class Function implements Value, RuntimeValue, Callable {
    arity: number;

    constructor(public readonly name: string, public readonly params: string[], public readonly instructions: bytecode.Instruction[]) {
        this.arity = this.params.length;
    }
    pretty_print() { return `<function>`; }

    resolve() { return this; }

    is_truthy() { return true; }
    type() { return 'function'; }
    stringify() { return `<function '${this.name}'>`; }

    async call(globals: Environment, args: RuntimeValue[]) {
        let env = new Environment(globals);
        for (let i = 0; i < this.params.length; ++i) { // should be same size
            env.put_variable(this.params[i], args[i]);
        }

        return await vm.interpret_(globals, env, this.instructions);
    }
}

export class String implements Value, RuntimeValue {
    constructor(public x: string) {}
    pretty_print() { return `"${this.x}"`; }

    resolve() { return this; }

    is_truthy() { return true; }
    type() { return 'string'; }
    stringify() { return this.x; };
}

export class Number implements Value, RuntimeValue {
    constructor(public x: number) {}
    pretty_print() { return this.x.toString(); }

    resolve() { return this; }

    is_truthy() { return true; }
    type() { return 'number'; }
    stringify() { return this.x.toString(); }
}

export class Bool implements Value, RuntimeValue {
    constructor(public x: boolean) {}
    pretty_print() { return this.x.toString(); }

    resolve() { return this; }

    is_truthy() { return this.x; }
    type() { return 'bool'; }
    stringify() { return this.x.toString(); }
}
