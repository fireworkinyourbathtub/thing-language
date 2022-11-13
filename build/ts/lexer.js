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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lex = void 0;
const diagnostics = __importStar(require("./diagnostics"));
class BadCharacter {
    constructor(ch) {
        this.ch = ch;
        this.message = `bad character: ${ch}`;
        this.explanation = null;
    }
}
class UnterminatedString {
    constructor() { this.message = "unterminated string"; this.explanation = null; }
}
class Lexer {
    constructor(source) {
        this.source = source;
        this.source = source;
        this.ind = 0;
    }
    lex() {
        let tokens = [];
        while (!this.at_end()) {
            let tok_start = this.ind;
            let tok = this.lex_single_token(tok_start);
            let tok_end = this.ind;
            if (tok != null) {
                tokens.push(Object.assign({ span: new diagnostics.Span(this.source, tok_start, tok_end) }, tok));
            }
        }
        let eof = Object.assign(Object.assign({}, { type: "eof" }), { span: this.span(this.ind) });
        return [tokens, eof];
    }
    lex_single_token(start_ind) {
        let c = this.advance();
        if (c == null) {
            return null;
        }
        switch (c) {
            case '(': return { type: "'('" };
            case ')': return { type: "')'" };
            case ',': return { type: "','" };
            case '.': return { type: "'.'" };
            case '+': return { type: "'+'" };
            case '-': return { type: "'-'" };
            case '*': return { type: "'*'" };
            case '/':
                if (this.match('/')) {
                    while (!this.at_end() && this.peek() != '\n') {
                        this.advance();
                    }
                    ;
                    return null;
                }
                else {
                    return { type: "'/'" };
                }
            case '{': return { type: "'{'" };
            case '}': return { type: "'}'" };
            case ';': return { type: "';'" };
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                return null;
            case '!': return this.match('=') ? { type: "'!='" } : { type: "'!'" };
            case '=': return this.match('=') ? { type: "'=='" } : { type: "'='" };
            case '<': return this.match('=') ? { type: "'<='" } : { type: "'<'" };
            case '>': return this.match('=') ? { type: "'>='" } : { type: "'>'" };
            case '"': return this.string(start_ind);
            default:
                if (this.is_digit(c)) {
                    return this.number();
                }
                else if (this.is_alpha(c)) {
                    return this.identifier();
                }
                else {
                    diagnostics.report(Object.assign(Object.assign({}, new BadCharacter(c)), { span: this.span(start_ind) }));
                    return null;
                }
        }
    }
    string(start_ind) {
        let lit_start = this.ind;
        while (!this.at_end() && this.peek() != '"') {
            this.advance();
        }
        if (this.at_end()) {
            diagnostics.report(Object.assign(Object.assign({}, new UnterminatedString()), { span: this.span(start_ind) }));
            return null;
        }
        let lit_end = this.ind;
        this.advance();
        let value = this.source.substring(lit_start, lit_end);
        return { type: "string literal", str: value };
    }
    number() {
        let start = this.ind - 1;
        while (this.is_digit_(this.peek())) {
            this.advance();
        }
        if (this.peek() == '.' && this.is_digit_(this.double_peek())) {
            this.advance();
            while (this.is_digit_(this.peek()))
                this.advance();
        }
        return { type: "number literal", num: parseFloat(this.source.substring(start, this.ind)) };
    }
    identifier() {
        let start = this.ind - 1;
        while (this.is_alphanumeric_(this.peek())) {
            this.advance();
        }
        let str = this.source.substring(start, this.ind);
        switch (str) {
            case "and": return { type: "'and'" };
            case "class": return { type: "'class'" };
            case "else": return { type: "'else'" };
            case "false": return { type: "bool literal", bool: false };
            case "for": return { type: "'for'" };
            case "fun": return { type: "'fun'" };
            case "if": return { type: "'if'" };
            case "nil": return { type: "'nil'" };
            case "or": return { type: "'or'" };
            case "print": return { type: "'print'" };
            case "return": return { type: "'return'" };
            case "super": return { type: "'super'" };
            case "this": return { type: "'this'" };
            case "true": return { type: "bool literal", bool: true };
            case "var": return { type: "'var'" };
            case "while": return { type: "'while'" };
            default: return { type: "identifier", name: str };
        }
    }
    is_digit(x) {
        return /\d/.test(x);
    }
    is_digit_(x) {
        if (x == null) {
            return false;
        }
        return /\d/.test(x);
    }
    is_alpha(x) {
        return /[a-zA-Z]/.test(x);
    }
    is_alphanumeric(x) {
        return this.is_digit(x) || this.is_alpha(x);
    }
    is_alphanumeric_(x) {
        if (x == null) {
            return false;
        }
        return this.is_digit(x) || this.is_alpha(x);
    }
    at_end() {
        return this.ind >= this.source.length;
    }
    peek() {
        if (this.at_end()) {
            return null;
        }
        else {
            return this.source[this.ind];
        }
    }
    double_peek() {
        if (this.ind + 1 >= this.source.length) {
            return null;
        }
        else {
            return this.source[this.ind + 1];
        }
    }
    advance() {
        if (this.at_end()) {
            return null;
        }
        else {
            return this.source[this.ind++];
        }
    }
    match(x) {
        if (this.peek() == x) {
            this.advance();
            return true;
        }
        else {
            return false;
        }
    }
    span(start) {
        return new diagnostics.Span(this.source, start, this.ind);
    }
}
function lex(input) {
    return new Lexer(input).lex();
}
exports.lex = lex;
