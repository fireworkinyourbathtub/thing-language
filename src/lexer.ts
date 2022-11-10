import * as diagnostics from './diagnostics';

export type TokenType =
    "'('" | "')'" | "','" | "'.'" | "'+'" | "'-'" | "'*'" | "'/'" |
    "'{'" | "'}'" | "';'" |
    "'<'" | "'='" | "'>'" | "'!'" | "'<='" | "'=='" | "'>='" | "'!='" |
    "'and'" | "'class'" | "'else'" | "'for'" | "'fun'" | "'if'" | "'nil'" | "'or'" | "'print'" | "'return'" | "'super'" | "'this'" | "'var'" | "'while'" |
    "identifier" | "number literal" | "string literal" | "bool literal" |
    "eof";

export type BinaryOperatorTokens = Plus | Minus | Star | Slash | Less | Equal | Greater | Bang | LessEqual | EqualEqual | GreaterEqual | BangEqual;

export interface Token {
    readonly type: TokenType;
}

export class OParen implements Token { readonly type: TokenType = "'('"; }
export class CParen implements Token { readonly type: TokenType = "')'"; }
export class Comma implements Token { readonly type: TokenType = "','"; }
export class Dot implements Token { readonly type: TokenType = "'.'"; }
export class Plus implements Token { readonly type: TokenType = "'+'"; }
export class Minus implements Token { readonly type: TokenType = "'-'"; }
export class Star implements Token { readonly type: TokenType = "'*'"; }
export class Slash implements Token { readonly type: TokenType = "'/'"; }

export class OBrace implements Token { readonly type: TokenType = "'{'"; }
export class CBrace implements Token { readonly type: TokenType = "'}'"; }
export class Semicolon implements Token { readonly type: TokenType = "';'"; }

export class Less implements Token { readonly type: TokenType = "'<'"; }
export class Equal implements Token { readonly type: TokenType = "'='"; }
export class Greater implements Token { readonly type: TokenType = "'>'"; }
export class Bang implements Token { readonly type: TokenType = "'!'"; }
export class LessEqual implements Token { readonly type: TokenType = "'<='"; }
export class EqualEqual implements Token { readonly type: TokenType = "'=='"; }
export class GreaterEqual implements Token { readonly type: TokenType = "'>='"; }
export class BangEqual implements Token { readonly type: TokenType = "'!='"; }

export class And implements Token { readonly type: TokenType = "'and'"; }
export class Class implements Token { readonly type: TokenType = "'class'"; }
export class Else implements Token { readonly type: TokenType = "'else'"; }
export class For implements Token { readonly type: TokenType = "'for'"; }
export class Fun implements Token { readonly type: TokenType = "'fun'"; }
export class If implements Token { readonly type: TokenType = "'if'"; }
export class Nil implements Token { readonly type: TokenType = "'nil'"; }
export class Or implements Token { readonly type: TokenType = "'or'"; }
export class Print implements Token { readonly type: TokenType = "'print'"; }
export class Return implements Token { readonly type: TokenType = "'return'"; }
export class Super implements Token { readonly type: TokenType = "'super'"; }
export class This implements Token { readonly type: TokenType = "'this'"; }
export class Var implements Token { readonly type: TokenType = "'var'"; }
export class While implements Token { readonly type: TokenType = "'while'"; }

export class Identifier implements Token {
    constructor(public name: string) {}

    readonly type: TokenType = "identifier";
}

export class StringLiteral implements Token {
    constructor(public str: string) {}

    readonly type: TokenType = "string literal";
}
export class NumberLiteral implements Token {
    constructor(public num: number) {}

    readonly type: TokenType = "number literal";
}

export class BoolLiteral implements Token {
    constructor(public bool: boolean) {}

    readonly type: TokenType = "bool literal";
}

export class EOF implements Token { readonly type: TokenType = "eof"; }

class BadCharacter implements diagnostics.Diagnostic {
    public message: string;
    public explanation: null;
    constructor(public ch: string) { this.message = `bad character: ${ch}`; this.explanation = null; }
}

class UnterminatedString implements diagnostics.Diagnostic {
    public message: string;
    public explanation: null;
    constructor() { this.message = "unterminated string"; this.explanation = null; }
}

class Lexer {
    ind: number;

    constructor(public source: string) {
        this.source = source;

        this.ind = 0;
    }

    lex(): [(Token & diagnostics.Located)[], EOF & diagnostics.Located] {
        let tokens = [];

        while (!this.at_end()) {
            let tok_start = this.ind;
            let tok = this.lex_single_token(tok_start);
            let tok_end = this.ind;

            if (tok != null) {
                tokens.push({ span: new diagnostics.Span(this.source, tok_start, tok_end), ...tok });
            }
        }

        let eof = { ...new EOF(), span: this.span(this.ind) };

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
                    diagnostics.report({ ...new BadCharacter(c), span: this.span(start_ind)});
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
            diagnostics.report({...new UnterminatedString(), span: this.span(start_ind)});
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

export function lex(input: string): [(Token & diagnostics.Located)[], EOF & diagnostics.Located] {
    return new Lexer(input).lex();
}
