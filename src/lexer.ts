import * as diagnostics from './diagnostics';

export type Token =
    OParen | CParen | Comma | Dot | Plus | Minus | Star | Slash |
    OBrace | CBrace | Semicolon |
    Less | Equal | Greater | Bang | LessEqual | EqualEqual | GreaterEqual | BangEqual |
    And | Class | Else | For | Fun | If | Nil | Or | Print | Return | Super | This | Var | While |
    Identifier | StringLiteral | NumberLiteral | BoolLiteral |
    EOF;

export type TokenType =
    "'('" | "')'" | "','" | "'.'" | "'+'" | "'-'" | "'*'" | "'/'" |
    "'{'" | "'}'" | "';'" |
    "'<'" | "'='" | "'>'" | "'!'" | "'<='" | "'=='" | "'>='" | "'!='" |
    "'and'" | "'class'" | "'else'" | "'for'" | "'fun'" | "'if'" | "'nil'" | "'or'" | "'print'" | "'return'" | "'super'" | "'this'" | "'var'" | "'while'" |
    "identifier" | "number literal" | "string literal" | "bool literal" |
    "eof";

export type BinaryOperatorTokens = Plus | Minus | Star | Slash | Less | Greater | LessEqual | EqualEqual | GreaterEqual | BangEqual;

export interface OParen { type: "'('"; }
export interface CParen { type: "')'"; }
export interface Comma { type: "','"; }
export interface Dot { type: "'.'"; }
export interface Plus { type: "'+'"; }
export interface Minus { type: "'-'"; }
export interface Star { type: "'*'"; }
export interface Slash { type: "'/'"; }

export interface OBrace { type: "'{'"; }
export interface CBrace { type: "'}'"; }
export interface Semicolon { type: "';'"; }

export interface Less { type: "'<'"; }
export interface Equal { type: "'='"; }
export interface Greater { type: "'>'"; }
export interface Bang { type: "'!'"; }
export interface LessEqual { type: "'<='"; }
export interface EqualEqual { type: "'=='"; }
export interface GreaterEqual { type: "'>='"; }
export interface BangEqual { type: "'!='"; }

export interface And { type: "'and'"; }
export interface Class { type: "'class'"; }
export interface Else { type: "'else'"; }
export interface For { type: "'for'"; }
export interface Fun { type: "'fun'"; }
export interface If { type: "'if'"; }
export interface Nil { type: "'nil'"; }
export interface Or { type: "'or'"; }
export interface Print { type: "'print'"; }
export interface Return { type: "'return'"; }
export interface Super { type: "'super'"; }
export interface This { type: "'this'"; }
export interface Var { type: "'var'"; }
export interface While { type: "'while'"; }

export interface Identifier {
    type: "identifier";
    name: string;
}

export interface StringLiteral {
    type: "string literal";
    str: string;
}
export interface NumberLiteral {
    type: "number literal";
    num: number;
}

export interface BoolLiteral {
    type: "bool literal";
    bool: boolean;
}

export interface EOF { type: "eof"; }

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

        let eof = { ...{ type: "eof" } as const, span: this.span(this.ind) };

        return [tokens, eof];
    }

    lex_single_token(start_ind: number): Token | null {
        let c = this.advance();

        if (c == null) {
            return null;
        }

        switch (c) {
            case '(': return { type: "'('" } as const;
            case ')': return { type: "')'" } as const;
            case ',': return { type: "','" } as const;
            case '.': return { type: "'.'" } as const;
            case '+': return { type: "'+'" } as const;
            case '-': return { type: "'-'" } as const;
            case '*': return { type: "'*'" } as const;
            case '/':
                if (this.match('/')) {
                    while (!this.at_end() && this.peek()! != '\n') { this.advance(); };
                    return null;
                } else {
                    return { type: "'/'" } as const;
                }

            case '{': return { type: "'{'" } as const;
            case '}': return { type: "'}'" } as const;
            case ';': return { type: "';'" } as const;

            case ' ':
            case '\n':
            case '\r':
            case '\t':
                return null;

            case '!': return this.match('=') ? { type: "'!='" } as const : { type: "'!'" } as const;
            case '=': return this.match('=') ? { type: "'=='" } as const : { type: "'='" } as const;
            case '<': return this.match('=') ? { type: "'<='" } as const : { type: "'<'" } as const;
            case '>': return this.match('=') ? { type: "'>='" } as const : { type: "'>'" } as const;

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

        return { type: "string literal", str: value };
    }

    number(): Token | null {
        let start = this.ind - 1;
        while (this.is_digit_(this.peek())) { this.advance(); }

        if (this.peek() == '.' && this.is_digit_(this.double_peek())) {
            this.advance();

            while (this.is_digit_(this.peek())) this.advance();
        }

        return { type: "number literal", num: parseFloat(this.source.substring(start, this.ind)) };
    }

    identifier(): Token | null {
        let start = this.ind - 1;
        while (this.is_alphanumeric_(this.peek())) { this.advance(); }

        let str = this.source.substring(start, this.ind);
        switch (str) {
            case "and": return { type: "'and'" } as const;
            case "class": return { type: "'class'" } as const;
            case "else": return { type: "'else'" } as const;
            case "false": return { type: "bool literal", bool: false } as const;
            case "for": return { type: "'for'" } as const;
            case "fun": return { type: "'fun'" } as const;
            case "if": return { type: "'if'" } as const;
            case "nil": return { type: "'nil'" } as const;
            case "or": return { type: "'or'" } as const;
            case "print": return { type: "'print'" } as const;
            case "return": return { type: "'return'" } as const;
            case "super": return { type: "'super'" } as const;
            case "this": return { type: "'this'" } as const;
            case "true": return { type: "bool literal", bool: true };
            case "var": return { type: "'var'" } as const;
            case "while": return { type: "'while'" } as const;
            default: return { type: "identifier", name: str } as const;
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
