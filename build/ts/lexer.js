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
exports.lex = exports.EOF = exports.BoolLiteral = exports.NumberLiteral = exports.StringLiteral = exports.Identifier = exports.While = exports.Var = exports.This = exports.Super = exports.Return = exports.Print = exports.Or = exports.Nil = exports.If = exports.Fun = exports.For = exports.Else = exports.Class = exports.And = exports.BangEqual = exports.GreaterEqual = exports.EqualEqual = exports.LessEqual = exports.Bang = exports.Greater = exports.Equal = exports.Less = exports.Semicolon = exports.CBrace = exports.OBrace = exports.Slash = exports.Star = exports.Minus = exports.Plus = exports.Dot = exports.Comma = exports.CParen = exports.OParen = void 0;
const diagnostics = __importStar(require("./diagnostics"));
class OParen {
    constructor() {
        this.type = "'('";
    }
}
exports.OParen = OParen;
class CParen {
    constructor() {
        this.type = "')'";
    }
}
exports.CParen = CParen;
class Comma {
    constructor() {
        this.type = "','";
    }
}
exports.Comma = Comma;
class Dot {
    constructor() {
        this.type = "'.'";
    }
}
exports.Dot = Dot;
class Plus {
    constructor() {
        this.type = "'+'";
    }
}
exports.Plus = Plus;
class Minus {
    constructor() {
        this.type = "'-'";
    }
}
exports.Minus = Minus;
class Star {
    constructor() {
        this.type = "'*'";
    }
}
exports.Star = Star;
class Slash {
    constructor() {
        this.type = "'/'";
    }
}
exports.Slash = Slash;
class OBrace {
    constructor() {
        this.type = "'{'";
    }
}
exports.OBrace = OBrace;
class CBrace {
    constructor() {
        this.type = "'}'";
    }
}
exports.CBrace = CBrace;
class Semicolon {
    constructor() {
        this.type = "';'";
    }
}
exports.Semicolon = Semicolon;
class Less {
    constructor() {
        this.type = "'<'";
    }
}
exports.Less = Less;
class Equal {
    constructor() {
        this.type = "'='";
    }
}
exports.Equal = Equal;
class Greater {
    constructor() {
        this.type = "'>'";
    }
}
exports.Greater = Greater;
class Bang {
    constructor() {
        this.type = "'!'";
    }
}
exports.Bang = Bang;
class LessEqual {
    constructor() {
        this.type = "'<='";
    }
}
exports.LessEqual = LessEqual;
class EqualEqual {
    constructor() {
        this.type = "'=='";
    }
}
exports.EqualEqual = EqualEqual;
class GreaterEqual {
    constructor() {
        this.type = "'>='";
    }
}
exports.GreaterEqual = GreaterEqual;
class BangEqual {
    constructor() {
        this.type = "'!='";
    }
}
exports.BangEqual = BangEqual;
class And {
    constructor() {
        this.type = "'and'";
    }
}
exports.And = And;
class Class {
    constructor() {
        this.type = "'class'";
    }
}
exports.Class = Class;
class Else {
    constructor() {
        this.type = "'else'";
    }
}
exports.Else = Else;
class For {
    constructor() {
        this.type = "'for'";
    }
}
exports.For = For;
class Fun {
    constructor() {
        this.type = "'fun'";
    }
}
exports.Fun = Fun;
class If {
    constructor() {
        this.type = "'if'";
    }
}
exports.If = If;
class Nil {
    constructor() {
        this.type = "'nil'";
    }
}
exports.Nil = Nil;
class Or {
    constructor() {
        this.type = "'or'";
    }
}
exports.Or = Or;
class Print {
    constructor() {
        this.type = "'print'";
    }
}
exports.Print = Print;
class Return {
    constructor() {
        this.type = "'return'";
    }
}
exports.Return = Return;
class Super {
    constructor() {
        this.type = "'super'";
    }
}
exports.Super = Super;
class This {
    constructor() {
        this.type = "'this'";
    }
}
exports.This = This;
class Var {
    constructor() {
        this.type = "'var'";
    }
}
exports.Var = Var;
class While {
    constructor() {
        this.type = "'while'";
    }
}
exports.While = While;
class Identifier {
    constructor(name) {
        this.name = name;
        this.type = "identifier";
    }
}
exports.Identifier = Identifier;
class StringLiteral {
    constructor(str) {
        this.str = str;
        this.type = "string literal";
    }
}
exports.StringLiteral = StringLiteral;
class NumberLiteral {
    constructor(num) {
        this.num = num;
        this.type = "number literal";
    }
}
exports.NumberLiteral = NumberLiteral;
class BoolLiteral {
    constructor(bool) {
        this.bool = bool;
        this.type = "bool literal";
    }
}
exports.BoolLiteral = BoolLiteral;
class EOF {
    constructor() {
        this.type = "eof";
    }
}
exports.EOF = EOF;
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
        let eof = Object.assign(Object.assign({}, new EOF()), { span: this.span(this.ind) });
        return [tokens, eof];
    }
    lex_single_token(start_ind) {
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
