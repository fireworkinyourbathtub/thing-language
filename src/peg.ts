import * as lexer from './lexer';
import * as diagnostics from './diagnostics';

export class Parser {
    errors: Map<number, lexer.TokenType[]>;
    constructor(public readonly tokens: (lexer.Token & diagnostics.Located)[], public readonly eof: lexer.EOF & diagnostics.Located) {
        this.errors = new Map();
    }

    error(ind: number, expect: lexer.TokenType) {
        if (!this.errors.has(ind)) {
            this.errors.set(ind, []);
        }

        this.errors.get(ind)!.push(expect);
    }
    report_error() {
        let max_ind = Math.max(...this.errors.keys());
        let got = this.get_tok(max_ind);
        let es = this.errors.get(max_ind)!;

        let explanation;
        if (es.length == 1) {
            explanation = `expected ${es[0]}, got ${got.type}`;
        } else {
            explanation = `expected one of ${es}, got ${got.type}`;
        }

        diagnostics.report({
            message: `parse error: ${explanation}`,
            explanation: null,
            span: got.span,
        });
    }

    get_tok(ind: number) {
        if (ind >= this.tokens.length) {
            return this.eof;
        } else {
            return this.tokens[ind];
        }
    }
}

export class ParseLocation {
    constructor(public readonly parser: Parser, public readonly ind: number) {}

    advance(): ParseLocation {
        return new ParseLocation(this.parser, this.ind + 1);
    }

    tok(): lexer.Token & diagnostics.Located { return this.parser.get_tok(this.ind); }
}

export abstract class PEG<T> {
    abstract parse(parser: Parser, location: ParseLocation): [ParseLocation, T] | null;

    // convenience methods
    chain<B>(other: PEG<B>): PEG<[T, B]> {
        return new Chain(this, other);
    }

    choice<B>(other: PEG<B>): PEG<T | B> {
        return new Choice(this, other);
    }

    apply<B>(op: (t: T) => B): PEG<B> {
        return new Apply(op, this);
    }
}

export class Token<T extends lexer.Token> extends PEG<T & diagnostics.Located> { // TODO: possibly do something to infer T or type
    constructor(readonly type: lexer.TokenType) {
        super();
    }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, T & diagnostics.Located] | null {
        let t = location.tok();
        if (t.type == this.type) {
            return [location.advance(), t as unknown as T & diagnostics.Located];
        } else {
            parser.error(location.ind, this.type);
            return null;
        }
    }
}

export class Chain<A, B> extends PEG<[A, B]> {
    constructor(private a: PEG<A>, private b: PEG<B>) { super(); }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, [A, B]] | null {
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

export class Choice<A, B> extends PEG<A | B> {
    constructor(private a: PEG<A>, private b: PEG<B>) { super(); }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, A | B] | null {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            return m_a_res;
        } else {
            let m_b_res = this.b.parse(parser, location);
            if (m_b_res) {
                return m_b_res;
            }
        }

        return null;
    }
}

export class Optional<A> extends PEG<A | null> {
    constructor(private a: PEG<A>) { super(); }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, A | null] | null {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            let [location_, a_res] = m_a_res;
            return [location_, a_res];
        } else {
            return [location, null];
        }
    }
}

export class ZeroMore<A> extends PEG<A[]> {
    constructor(private a: PEG<A>) { super(); }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, A[]] | null {
        let items = [];
        while (true) {
            let m_res = this.a.parse(parser, location);
            if (m_res) {
                let [location_, item] = m_res;
                location = location_;
                items.push(item);
            } else {
                return [location, items];
            }
        }
    }
}

export class OneMore<A> extends PEG<A[]> {
    constructor(private a: PEG<A>) { super(); }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, A[]] | null {
        return new Apply(
            ([first, more]) => [first].concat(more),
            new Chain(this.a, new ZeroMore(this.a))
        ).parse(parser, location);
    }
}

export class Apply<A, B> extends PEG<B> {
    constructor(private op: (a: A) => B, private a: PEG<A>) { super(); }

    parse(parser: Parser, location: ParseLocation): [ParseLocation, B] | null {
        let m_a_res = this.a.parse(parser, location);
        if (m_a_res) {
            let [location_, a_res] = m_a_res;
            let b_res = this.op(a_res);
            return [location_, b_res];
        }

        return null;
    }
}

export class Indirect<T> extends PEG<T> {
    constructor(private thing: () => PEG<T>) { super(); }
    parse(parser: Parser, location: ParseLocation): [ParseLocation, T] | null {
        return this.thing().parse(parser, location);
    }
}
