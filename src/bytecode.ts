import * as diagnostics from './diagnostics';

export interface Instruction {
    readonly span: diagnostics.Span;
    pretty_print(): string;
}
