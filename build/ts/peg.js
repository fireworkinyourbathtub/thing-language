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
exports.Indirect = exports.Apply = exports.OneMore = exports.ZeroMore = exports.Optional = exports.Choice = exports.Chain = exports.Token = exports.PEG = exports.ParseLocation = exports.Parser = void 0;
const diagnostics = __importStar(require("./diagnostics"));
class Parser {
    constructor(tokens, eof) {
        this.tokens = tokens;
        this.eof = eof;
        this.errors = new Map();
    }
    error(ind, expect) {
        if (!this.errors.has(ind)) {
            this.errors.set(ind, []);
        }
        this.errors.get(ind).push(expect);
    }
    report_error() {
        let max_ind = Math.max(...this.errors.keys());
        let got = this.get_tok(max_ind);
        let es = this.errors.get(max_ind);
        let explanation;
        if (es.length == 1) {
            explanation = `expected ${es[0]}, got ${got.thing.type}`;
        }
        else {
            explanation = `expected one of ${es}, got ${got.thing.type}`;
        }
        diagnostics.report(new diagnostics.Located(new diagnostics.Diagnostic(`parse error: ${explanation}`, null), got.span));
    }
    get_tok(ind) {
        if (ind >= this.tokens.length) {
            return this.eof;
        }
        else {
            return this.tokens[ind];
        }
    }
}
exports.Parser = Parser;
class ParseLocation {
    constructor(parser, ind) {
        this.parser = parser;
        this.ind = ind;
    }
    advance() {
        return new ParseLocation(this.parser, this.ind + 1);
    }
    tok() { return this.parser.get_tok(this.ind); }
}
exports.ParseLocation = ParseLocation;
class PEG {
    // convenience methods
    chain(other) {
        return new Chain(this, other);
    }
    choice(other) {
        return new Choice(this, other);
    }
    apply(op) {
        return new Apply(op, this);
    }
}
exports.PEG = PEG;
class Token extends PEG {
    constructor(type) {
        super();
        this.type = type;
    }
    parse(parser, location) {
        let t = location.tok();
        if (t.thing.type == this.type) {
            return [location.advance(), t.thing];
        }
        else {
            parser.error(location.ind, this.type);
            return null;
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
    parse(parser, location) {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            let [location_, a_res] = m_a_res;
            let m_b_res = this.b.parse(parser, location_);
            if (m_b_res) {
                let [location__, b_res] = m_b_res;
                return [location__, [a_res, b_res]];
            }
        }
        return null;
    }
}
exports.Chain = Chain;
class Choice extends PEG {
    constructor(a, b) {
        super();
        this.a = a;
        this.b = b;
    }
    parse(parser, location) {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            return m_a_res;
        }
        else {
            let m_b_res = this.b.parse(parser, location);
            if (m_b_res) {
                return m_b_res;
            }
        }
        return null;
    }
}
exports.Choice = Choice;
class Optional extends PEG {
    constructor(a) {
        super();
        this.a = a;
    }
    parse(parser, location) {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            let [location_, a_res] = m_a_res;
            return [location_, a_res];
        }
        else {
            return [location, null];
        }
    }
}
exports.Optional = Optional;
class ZeroMore extends PEG {
    constructor(a) {
        super();
        this.a = a;
    }
    parse(parser, location) {
        let items = [];
        while (true) {
            let m_res = this.a.parse(parser, location);
            if (m_res) {
                let [location_, item] = m_res;
                location = location_;
                items.push(item);
            }
            else {
                return [location, items];
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
    parse(parser, location) {
        return new Apply(([first, more]) => [first].concat(more), new Chain(this.a, new ZeroMore(this.a))).parse(parser, location);
    }
}
exports.OneMore = OneMore;
class Apply extends PEG {
    constructor(op, a) {
        super();
        this.op = op;
        this.a = a;
    }
    parse(parser, location) {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            let [location_, a_res] = m_a_res;
            let b_res = this.op(a_res);
            return [location_, b_res];
        }
        return null;
    }
}
exports.Apply = Apply;
class Indirect extends PEG {
    constructor(thing) {
        super();
        this.thing = thing;
    }
    parse(parser, location) {
        return this.thing().parse(parser, location);
    }
}
exports.Indirect = Indirect;
