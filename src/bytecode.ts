import * as diagnostics from './diagnostics';

export abstract class Instruction {
    abstract readonly span: diagnostics.Span;
    abstract pretty_print(): string;
}
