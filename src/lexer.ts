import * as diagnostics from './diagnostics';

export type TokenType =
    "'('" | "')'" | "','" | "'.'" | "'+'" | "'-'" | "'*'" | "'/'" |
    "'{'" | "'}'" | "';'" |
    "'<'" | "'='" | "'>'" | "'!'" | "'<='" | "'=='" | "'>='" | "'!='" |
    "'and'" | "'class'" | "'else'" | "'for'" | "'fun'" | "'if'" | "'nil'" | "'or'" | "'print'" | "'return'" | "'super'" | "'this'" | "'var'" | "'while'" |
    "identifier" | "number literal" | "string literal" | "bool literal" |
    "eof";

export type BinaryOperatorTokens = Plus | Minus | Star | Slash | Less | Equal | Greater | Bang | LessEqual | EqualEqual | GreaterEqual | BangEqual;

export abstract class Token {
    abstract readonly type: TokenType;
}

export class OParen extends Token { readonly type: TokenType = "'('"; }
export class CParen extends Token { readonly type: TokenType = "')'"; }
export class Comma extends Token { readonly type: TokenType = "','"; }
export class Dot extends Token { readonly type: TokenType = "'.'"; }
export class Plus extends Token { readonly type: TokenType = "'+'"; }
export class Minus extends Token { readonly type: TokenType = "'-'"; }
export class Star extends Token { readonly type: TokenType = "'*'"; }
export class Slash extends Token { readonly type: TokenType = "'/'"; }

export class OBrace extends Token { readonly type: TokenType = "'{'"; }
export class CBrace extends Token { readonly type: TokenType = "'}'"; }
export class Semicolon extends Token { readonly type: TokenType = "';'"; }

export class Less extends Token { readonly type: TokenType = "'<'"; }
export class Equal extends Token { readonly type: TokenType = "'='"; }
export class Greater extends Token { readonly type: TokenType = "'>'"; }
export class Bang extends Token { readonly type: TokenType = "'!'"; }
export class LessEqual extends Token { readonly type: TokenType = "'<='"; }
export class EqualEqual extends Token { readonly type: TokenType = "'=='"; }
export class GreaterEqual extends Token { readonly type: TokenType = "'>='"; }
export class BangEqual extends Token { readonly type: TokenType = "'!='"; }

export class And extends Token { readonly type: TokenType = "'and'"; }
export class Class extends Token { readonly type: TokenType = "'class'"; }
export class Else extends Token { readonly type: TokenType = "'else'"; }
export class For extends Token { readonly type: TokenType = "'for'"; }
export class Fun extends Token { readonly type: TokenType = "'fun'"; }
export class If extends Token { readonly type: TokenType = "'if'"; }
export class Nil extends Token { readonly type: TokenType = "'nil'"; }
export class Or extends Token { readonly type: TokenType = "'or'"; }
export class Print extends Token { readonly type: TokenType = "'print'"; }
export class Return extends Token { readonly type: TokenType = "'return'"; }
export class Super extends Token { readonly type: TokenType = "'super'"; }
export class This extends Token { readonly type: TokenType = "'this'"; }
export class Var extends Token { readonly type: TokenType = "'var'"; }
export class While extends Token { readonly type: TokenType = "'while'"; }

export class Identifier extends Token {
    constructor(public name: string) { super(); }

    readonly type: TokenType = "identifier";
}

export class StringLiteral extends Token {
    constructor(public str: string) { super(); }

    readonly type: TokenType = "string literal";
}
export class NumberLiteral extends Token {
    constructor(public num: number) { super(); }

    readonly type: TokenType = "number literal";
}

export class BoolLiteral extends Token {
    constructor(public bool: boolean) { super(); }

    readonly type: TokenType = "bool literal";
}

export class EOF extends Token { readonly type: TokenType = "eof"; }

class BadCharacter extends diagnostics.Diagnostic {
    constructor(public ch: string) { super(`bad character: ${ch}`, null); }
}

class UnterminatedString extends diagnostics.Diagnostic {
    constructor() { super("unterminated string", null); }
}

class Lexer {
    ind: number;

    constructor(public source: string) {
        this.source = source;

        this.ind = 0;
    }

    lex(): [diagnostics.Located<Token>[], diagnostics.Located<EOF>] {
        let tokens = [];

        while (!this.at_end()) {
            let tok_start = this.ind;
            let tok = this.lex_single_token(tok_start);
            let tok_end = this.ind;

            if (tok != null) {
                tokens.push(new diagnostics.Located(tok, new diagnostics.Span(this.source, tok_start, tok_end)));
            }
        }

        let eof = new diagnostics.Located(new EOF(), this.span(this.ind));

        return [tokens, eof];
    }

    lex_single_token(start_ind: number): Token | null {
        let c = this.advance();

        if (c == null) {
            return null;
        }

        switch (c) {
            case '(': return new OParen();
            case ')': return new CParen();
            case ',': return new Comma();
            case '.': return new Dot();
            case '+': return new Plus();
            case '-': return new Minus();
            case '*': return new Star();
            case '/':
                if (this.match('/')) {
                    while (!this.at_end() && this.peek()! != '\n') { this.advance(); };
                    return null;
                } else {
                    return new Slash();
                }

            case '{': return new OBrace();
            case '}': return new CBrace();
            case ';': return new Semicolon();

            case ' ':
            case '\n':
            case '\r':
            case '\t':
                return null;

            case '!': return this.match('=') ? new BangEqual() : new Bang();
            case '=': return this.match('=') ? new EqualEqual() : new Equal();
            case '<': return this.match('=') ? new LessEqual() : new Less();
            case '>': return this.match('=') ? new GreaterEqual() : new Greater();

            case '"': return this.string(start_ind);

            default:
                if (this.is_digit(c)) {
                    return this.number();
                } else if (this.is_alpha(c)) {
                    return this.identifier();
                } else {
                    diagnostics.report(new diagnostics.Located(new BadCharacter(c), this.span(start_ind)));
                    return null;
                }
        }
    }

    string(start_ind: number): Token | null {
        let lit_start = this.ind;
        while (!this.at_end() && this.peek()! != '"') {
            this.advance();
        }

        if (this.at_end()) {
            diagnostics.report(new diagnostics.Located(new UnterminatedString(), this.span(start_ind)));
            return null;
        }

        let lit_end = this.ind;

        this.advance();

        let value = this.source.substring(lit_start, lit_end);

        return new StringLiteral(value);
    }

    number(): Token | null {
        let start = this.ind - 1;
        while (this.is_digit_(this.peek())) { this.advance(); }

        if (this.peek() == '.' && this.is_digit_(this.double_peek())) {
            this.advance();

            while (this.is_digit_(this.peek())) this.advance();
        }

        return new NumberLiteral(parseFloat(this.source.substring(start, this.ind)));
    }

    identifier(): Token | null {
        let start = this.ind - 1;
        while (this.is_alphanumeric_(this.peek())) { this.advance(); }

        let str = this.source.substring(start, this.ind);
        switch (str) {
            case "and": return new And();
            case "class": return new Class();
            case "else": return new Else();
            case "false": return new BoolLiteral(false);
            case "for": return new For();
            case "fun": return new Fun();
            case "if": return new If();
            case "nil": return new Nil();
            case "or": return new Or();
            case "print": return new Print();
            case "return": return new Return();
            case "super": return new Super();
            case "this": return new This();
            case "true": return new BoolLiteral(true);
            case "var": return new Var();
            case "while": return new While();
            default: return new Identifier(str);
        }
    }

    is_digit(x: string): boolean {
        return /\d/.test(x);
    }
    is_digit_(x: string | null): boolean {
        if (x == null) { return false; }
        return /\d/.test(x);
    }

    is_alpha(x: string): boolean {
        return /[a-zA-Z]/.test(x);
    }

    is_alphanumeric(x: string): boolean {
        return this.is_digit(x) || this.is_alpha(x);
    }

    is_alphanumeric_(x: string | null): boolean {
        if (x == null) { return false; }
        return this.is_digit(x) || this.is_alpha(x);
    }

    at_end(): boolean {
        return this.ind >= this.source.length;
    }

    peek(): string | null {
        if (this.at_end()) {
            return null;
        } else {
            return this.source[this.ind];
        }
    }

    double_peek(): string | null {
        if (this.ind + 1 >= this.source.length) {
            return null;
        } else {
            return this.source[this.ind + 1];
        }
    }

    advance(): string | null {
        if (this.at_end()) {
            return null;
        } else {
            return this.source[this.ind++];
        }
    }

    match(x: string): boolean {
        if (this.peek() == x) {
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    span(start: number): diagnostics.Span {
        return new diagnostics.Span(this.source, start, this.ind);
    }
}

export function lex(input: string): [diagnostics.Located<Token>[], diagnostics.Located<EOF>] {
    return new Lexer(input).lex();
}
