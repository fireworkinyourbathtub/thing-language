import * as bytecode from './bytecode';

export class Environment {
    registers: RuntimeValue[] = [];
    variables: Map<string, RuntimeValue> = new Map();

    constructor(public parent: Environment | null) {}

    get_register(index: number) {
        if (index >= this.registers.length) {
            throw new Error('internal error: get register that doesn\'t exist'); // TODO: new runtime error class to catch
        } else {
            return this.registers[index];
        }
    }

    put_register(index: number, value: RuntimeValue) {
        this.registers[index] = value;
    }

    get_variable(name: string): RuntimeValue {
        if (!this.variables.has(name))
            throw new Error(`get variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
        else
            return this.variables.get(name)!;
    }

    set_variable(name: string, value: RuntimeValue)  {
        if (!this.variables.has(name))
            throw new Error(`set variable that does not exist: '${name}'`); // TODO: new runtime error class to catch
        else
            this.variables.set(name, value);
    }

    put_variable(name: string, value: RuntimeValue) {
        this.variables.set(name, value);
    }
}

export interface Value {
    pretty_print(): string;
    to_runtime_value(env: Environment): RuntimeValue;
}

export interface RuntimeValue {
    is_truthy(): boolean;
}

export class Register implements Value {
    constructor(public index: number) {}
    pretty_print() { return `%${this.index}`; }

    to_runtime_value(env: Environment) {
        return env.get_register(this.index);
    }
}

export class Nil implements Value, RuntimeValue {
    constructor() {}
    pretty_print() { return 'nil'; }

    to_runtime_value() { return this; }

    is_truthy() { return false; }
}

export class Function implements Value, RuntimeValue {
    constructor(public readonly name: string, public readonly params: string[], public readonly instructions: bytecode.Instruction[]) {}
    pretty_print() { return `<function '${this.name}'>`; }

    to_runtime_value() { return this; }

    is_truthy() { return true; }
}

export class String implements Value, RuntimeValue {
    constructor(public x: string) {}
    pretty_print() { return `"${this.x}"`; }

    to_runtime_value() { return this; }

    is_truthy() { return true; }
}

export class Number implements Value, RuntimeValue {
    constructor(public x: number) {}
    pretty_print() { return this.x.toString(); }

    to_runtime_value() { return this; }

    is_truthy() { return true; }
}

export class Bool implements Value, RuntimeValue {
    constructor(public x: boolean) {}
    pretty_print() { return this.x.toString(); }

    to_runtime_value() { return this; }

    is_truthy() { return this.x; }
}

