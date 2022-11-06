import * as lexer from './lexer';
import * as diagnostics from './diagnostics';
import * as ast from './ast';
import * as peg from './peg';

let declaration = undefined;

function astify_binary_expr([comp, ops]: [ast.Expr, [lexer.BinaryOperatorTokens, ast.Expr][]]) {
    let cur;
    while (cur = ops.shift()) {
        let [op, right] = cur;

        let op_ast;
        switch (op.type()) {
            case  "'+'": op_ast = ast.BinaryOperator.Plus; break;
            case  "'-'": op_ast = ast.BinaryOperator.Minus; break;
            case  "'*'": op_ast = ast.BinaryOperator.Star; break;
            case  "'/'": op_ast = ast.BinaryOperator.Slash; break;
            case  "'<'": op_ast = ast.BinaryOperator.Less; break;
            case  "'='": op_ast = ast.BinaryOperator.Equal; break;
            case  "'>'": op_ast = ast.BinaryOperator.Greater; break;
            case  "'!'": op_ast = ast.BinaryOperator.Bang; break;
            case  "'<='": op_ast = ast.BinaryOperator.LessEqual; break;
            case  "'=='": op_ast = ast.BinaryOperator.EqualEqual; break;
            case  "'>='": op_ast = ast.BinaryOperator.GreaterEqual; break;
            case  "'!='": op_ast = ast.BinaryOperator.BangEqual; break;

            default: throw Error('unreachable');
        }

        comp = new ast.BinaryExpr(comp, right, op_ast);
    }

    return comp;
}

// hack for recursive expressions
let equality: peg.PEG<ast.Expr>;
// function expression(): peg.PEG<ast.Expr> { return equality; }
let expression: () => peg.PEG<ast.Expr> = () => equality!;

let primary = new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(
    new peg.Map(tok => new ast.Literal(tok.bool), new peg.Token<lexer.BoolLiteral>('bool literal')),
    new peg.Map(tok => new ast.Literal(tok.num), new peg.Token<lexer.NumberLiteral>('number literal'))),
    new peg.Map(tok => new ast.Literal(tok.str), new peg.Token<lexer.StringLiteral>('string literal'))),
    new peg.Map(tok => new ast.Literal(null), new peg.Token<lexer.Nil>("'nil'"))),
    new peg.Map(([[oparen, expr], cparen]) => expr, new peg.Chain(new peg.Chain(
        new peg.Token("'('"),
        expression()),
        new peg.Token("')'"),
    )));

let unary =
    new peg.Choice(
            new peg.Map(([ops, expr]) => {
                let op;
                while (op = ops.shift()) {
                    let op_ast;
                    switch (op.type()) {
                        case "'-'": op_ast = ast.UnaryOperator.Minus; break;
                        case "'!'": op_ast = ast.UnaryOperator.Bang; break;

                        default: throw Error('unreachable');
                    }

                    expr = new ast.UnaryExpr(op_ast, expr);
                }
                return expr;
            },
            new peg.Chain(new peg.OneMore(new peg.Choice(new peg.Token("'-'"), new peg.Token("'!'"))), primary)
        ),
        primary,
    );

let factor =
    new peg.Map(astify_binary_expr,
        new peg.Chain(
            unary,
            new peg.ZeroMore(
                new peg.Chain(
                    new peg.Choice(new peg.Token("'*'"), new peg.Token("'/'")),
                    unary,
                )
            )
        )
    );

let term =
    new peg.Map(astify_binary_expr,
        new peg.Chain(
            factor,
            new peg.ZeroMore(
                new peg.Chain(
                    new peg.Choice(new peg.Token("'+'"), new peg.Token("'-'")),
                    factor,
                )
            )
        )
    );

let comparison =
    new peg.Map(astify_binary_expr,
        new peg.Chain(
            term,
            new peg.ZeroMore(
                new peg.Chain(
                    new peg.Choice(new peg.Choice(new peg.Choice(new peg.Token("'<'"), new peg.Token("'<='")), new peg.Token("'>'")), new peg.Token("'>='")),
                    term,
                )
            )
        )
    );

equality =
    new peg.Map(astify_binary_expr,
        new peg.Chain(
            comparison,
            new peg.ZeroMore(
                new peg.Chain(
                    new peg.Choice(new peg.Token("'=='"), new peg.Token("'!='")),
                    comparison,
                )
            )
        )
    );

let script = new peg.Chain(expression(), new peg.Token("eof")); //new peg.ZeroMore(declaration);

export function parse([tokens, eof]: [diagnostics.Located<lexer.Token>[], diagnostics.Located<lexer.EOF>]): ast.Expr | null {
    let parser = new peg.Parser(tokens, eof, 0);
    return script.parse(parser).cata({
        Ok: ([_, [expr, eof]]) => expr,
        Err: (errs) => {
            let e = errs.reduce((max, err) => err.thing.ind > max.thing.ind ? err : max, errs[0]);
            diagnostics.report(e);
            return null;
        }
    });
}
