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
class Token {
}
class OParen extends Token {
}
class CParen extends Token {
}
class Comma extends Token {
}
class Dot extends Token {
}
class Plus extends Token {
}
class Minus extends Token {
}
class Star extends Token {
}
class Slash extends Token {
}
class OBrace extends Token {
}
class CBrace extends Token {
}
class Semicolon extends Token {
}
class Less extends Token {
}
class Equal extends Token {
}
class Greater extends Token {
}
class Bang extends Token {
}
class LessEqual extends Token {
}
class EqualEqual extends Token {
}
class GreaterEqual extends Token {
}
class BangEqual extends Token {
}
class And extends Token {
}
class Class extends Token {
}
class Else extends Token {
}
class False extends Token {
}
class For extends Token {
}
class Fun extends Token {
}
class If extends Token {
}
class Nil extends Token {
}
class Or extends Token {
}
class Print extends Token {
}
class Return extends Token {
}
class Super extends Token {
}
class This extends Token {
}
class True extends Token {
}
class Var extends Token {
}
class While extends Token {
}
class Identifier extends Token {
    constructor(name) {
        super();
        this.name = name;
    }
}
class StringLiteral extends Token {
    constructor(str) {
        super();
        this.str = str;
    }
}
class NumberLiteral extends Token {
    constructor(num) {
        super();
        this.num = num;
    }
}
class BadCharacter extends diagnostics.Diagnostic {
    // TODO: span
    constructor(ch) {
        super();
        this.ch = ch;
    }
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
            let tok = this.lex_single_token();
            let tok_end = this.ind;
            if (tok != null) {
                tokens.push(tok);
            }
        }
        return tokens;
    }
    lex_single_token() {
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
                    while (!this.at_end() && this.peek() != '\n') {
                        this.advance();
                    }
                    ;
                    return null;
                }
                else {
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
            case '"': return this.string();
            default:
                if (this.is_digit(c)) {
                    return this.number();
                }
                else if (this.is_alpha(c)) {
                    return this.identifier();
                }
                else {
                    // TODO: report error return new BadCharacter(c);
                    return null;
                }
        }
    }
    string() {
        let lit_start = this.ind;
        while (!this.at_end() && this.peek() != '"') {
            this.advance();
        }
        if (this.at_end()) {
            // TODO: Lox.error(line, "Unterminated string.");
            return null;
        }
        let lit_end = this.ind;
        this.advance();
        let value = this.source.substring(lit_start, lit_end);
        return new StringLiteral(value);
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
        return new NumberLiteral(parseFloat(this.source.substring(start, this.ind)));
    }
    identifier() {
        let start = this.ind - 1;
        while (this.is_alphanumeric_(this.peek())) {
            this.advance();
        }
        let str = this.source.substring(start, this.ind);
        switch (str) {
            case "and": return new And();
            case "class": return new Class();
            case "else": return new Else();
            case "false": return new False();
            case "for": return new For();
            case "fun": return new Fun();
            case "if": return new If();
            case "nil": return new Nil();
            case "or": return new Or();
            case "print": return new Print();
            case "return": return new Return();
            case "super": return new Super();
            case "this": return new This();
            case "true": return new True();
            case "var": return new Var();
            case "while": return new While();
            default: return new Identifier(str);
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
}
function lex(input) {
    return new Lexer(input).lex();
}
exports.lex = lex;
