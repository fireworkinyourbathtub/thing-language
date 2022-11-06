import * as lexer from './lexer';
import * as diagnostics from './diagnostics';
import * as pratica from 'pratica';

export class Parser {
    constructor(public readonly tokens: diagnostics.Located<lexer.Token>[], public readonly eof: diagnostics.Located<lexer.EOF>, public readonly ind: number) {}

    advance(): Parser {
        return new Parser(this.tokens, this.eof, this.ind + 1);
    }

    cur_tok(): diagnostics.Located<lexer.Token> {
        if (this.ind >= this.tokens.length) {
            return this.eof;
        } else {
            return this.tokens[this.ind];
        }
    }
}

export abstract class ParseError extends diagnostics.Diagnostic {
    ind: number;

    constructor(parser: Parser, message: string, explanation: string | null) {
        super(message, explanation);
        this.ind = parser.ind;
    }
}

export class Expected<T> extends ParseError {
    constructor(parser: Parser, private expect: lexer.TokenType, private got: lexer.Token) {
        super(parser, `expected ${expect}, got ${got.type()}`, null);
    }
}

export abstract class PEG<T> {
    abstract parse(parser: Parser): pratica.Result<[Parser, T], diagnostics.Located<ParseError>[]>;
}

export class Token<T extends lexer.Token> extends PEG<T> {
    constructor(readonly type: lexer.TokenType) {
        super();
    }
    parse(parser: Parser): pratica.Result<[Parser, T], diagnostics.Located<ParseError>[]> {
        let t = parser.cur_tok();
        if (t.thing.type() == this.type) {
            return pratica.Ok([parser.advance(), t.thing as T]);
        } else {
            return pratica.Err([new diagnostics.Located(new Expected(parser, this.type, t.thing), t.span)]);
        }
    }
}

export class Chain<A, B> extends PEG<[A, B]> {
    constructor(private a: PEG<A>, private b: PEG<B>) { super(); }

    parse(parser: Parser): pratica.Result<[Parser, [A, B]], diagnostics.Located<ParseError>[]> {
        return (
            this.a.parse(parser).chain(([parser_, a_res]) =>
            this.b.parse(parser_).chain(([parser__, b_res]) =>
            pratica.Ok([parser__, [a_res, b_res]]))));
    }
}

export class Choice<A, B> extends PEG<A | B> {
    constructor(private a: PEG<A>, private b: PEG<B>) { super(); }

    parse(parser: Parser): pratica.Result<[Parser, A | B], diagnostics.Located<ParseError>[]> {
        let a_res = this.a.parse(parser);
        return this.a.parse(parser).cata({
            Ok: x => pratica.Ok(x),
            Err: a_e =>
                this.b.parse(parser).cata({
                    Ok: x => pratica.Ok(x),
                    Err: b_e => pratica.Err(a_e.concat(b_e)),
                }),
        });
    }
}

export class ZeroMore<A> extends PEG<A[]> {
    constructor(private a: PEG<A>) { super(); }

    parse(parser: Parser): pratica.Result<[Parser, A[]], diagnostics.Located<ParseError>[]> {
        let items = [];
        while (true) {
            let res = this.a.parse(parser);
            let res_as_ok = res.toMaybe().value();
            if (res_as_ok) {
                let [parser_, item] = res_as_ok;
                parser = parser_;
                items.push(item);
            } else {
                return pratica.Ok([parser, items]);
            }
        }
    }
}

export class OneMore<A> extends PEG<A[]> {
    constructor(private a: PEG<A>) { super(); }

    parse(parser: Parser): pratica.Result<[Parser, A[]], diagnostics.Located<ParseError>[]> {
        return this.a.parse(parser).chain(([parser_, first_item]) =>
            new ZeroMore(this.a).parse(parser_).map(([parser__, more_items]) =>
                [parser__, [first_item].concat(more_items)]
            )
        );
    }
}

export class Map<A, B> extends PEG<B> {
    constructor(private op: (a: A) => B, private a: PEG<A>) { super(); }

    parse(parser: Parser): pratica.Result<[Parser, B], diagnostics.Located<ParseError>[]> {
        return this.a.parse(parser).map(([parser_, a]) => [parser_, this.op(a)]);
    }
}
