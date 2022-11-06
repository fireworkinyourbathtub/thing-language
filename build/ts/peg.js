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
exports.Map = exports.OneMore = exports.ZeroMore = exports.Choice = exports.Chain = exports.Token = exports.PEG = exports.Expected = exports.ParseError = exports.Parser = void 0;
const diagnostics = __importStar(require("./diagnostics"));
const pratica = __importStar(require("pratica"));
class Parser {
    constructor(tokens, eof, ind) {
        this.tokens = tokens;
        this.eof = eof;
        this.ind = ind;
    }
    advance() {
        return new Parser(this.tokens, this.eof, this.ind + 1);
    }
    cur_tok() {
        if (this.ind >= this.tokens.length) {
            return this.eof;
        }
        else {
            return this.tokens[this.ind];
        }
    }
}
exports.Parser = Parser;
class ParseError extends diagnostics.Diagnostic {
    constructor(parser, message, explanation) {
        super(message, explanation);
        this.ind = parser.ind;
    }
}
exports.ParseError = ParseError;
class Expected extends ParseError {
    constructor(parser, expect, got) {
        super(parser, `expected ${expect}, got ${got.type()}`, null);
        this.expect = expect;
        this.got = got;
    }
}
exports.Expected = Expected;
class PEG {
}
exports.PEG = PEG;
class Token extends PEG {
    constructor(type) {
        super();
        this.type = type;
    }
    parse(parser) {
        let t = parser.cur_tok();
        if (t.thing.type() == this.type) {
            return pratica.Ok([parser.advance(), t.thing]);
        }
        else {
            return pratica.Err([new diagnostics.Located(new Expected(parser, this.type, t.thing), t.span)]);
        }
    }
}
exports.Token = Token;
class Chain extends PEG {
    constructor(a, b) {
        super();
        this.a = a;
        this.b = b;
    }
    parse(parser) {
        return (this.a.parse(parser).chain(([parser_, a_res]) => this.b.parse(parser_).chain(([parser__, b_res]) => pratica.Ok([parser__, [a_res, b_res]]))));
    }
}
exports.Chain = Chain;
class Choice extends PEG {
    constructor(a, b) {
        super();
        this.a = a;
        this.b = b;
    }
    parse(parser) {
        let a_res = this.a.parse(parser);
        return this.a.parse(parser).cata({
            Ok: x => pratica.Ok(x),
            Err: a_e => this.b.parse(parser).cata({
                Ok: x => pratica.Ok(x),
                Err: b_e => pratica.Err(a_e.concat(b_e)),
            }),
        });
    }
}
exports.Choice = Choice;
class ZeroMore extends PEG {
    constructor(a) {
        super();
        this.a = a;
    }
    parse(parser) {
        let items = [];
        while (true) {
            let res = this.a.parse(parser);
            let res_as_ok = res.toMaybe().value();
            if (res_as_ok) {
                let [parser_, item] = res_as_ok;
                parser = parser_;
                items.push(item);
            }
            else {
                return pratica.Ok([parser, items]);
            }
        }
    }
}
exports.ZeroMore = ZeroMore;
class OneMore extends PEG {
    constructor(a) {
        super();
        this.a = a;
    }
    parse(parser) {
        return this.a.parse(parser).chain(([parser_, first_item]) => new ZeroMore(this.a).parse(parser_).map(([parser__, more_items]) => [parser__, [first_item].concat(more_items)]));
    }
}
exports.OneMore = OneMore;
class Map extends PEG {
    constructor(op, a) {
        super();
        this.op = op;
        this.a = a;
    }
    parse(parser) {
        return this.a.parse(parser).map(([parser_, a]) => [parser_, this.op(a)]);
    }
}
exports.Map = Map;
