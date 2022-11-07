import * as lexer from './lexer';
import * as diagnostics from './diagnostics';
import * as ast from './ast';
import * as peg from './peg';

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

let block: peg.PEG<ast.Stmt[]>;
let expression: peg.PEG<ast.Expr>;
let expression_indirect = () => expression!;

let args = new peg.Indirect(expression_indirect).chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Indirect(expression_indirect))));
let params = new peg.Token("identifier").chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Token("identifier"))));
let fn = new peg.Token("identifier").chain(new peg.Token("'('")).chain(new peg.Optional(params)).chain(new peg.Token("')'")).chain(new peg.Indirect(() => block));

let primary =
    new peg.Token<lexer.BoolLiteral>('bool literal').apply(tok => new ast.Literal(tok.bool)).choice(
    new peg.Token<lexer.Nil>("'nil'").apply(tok => new ast.Literal(null))).choice(
    new peg.Token<lexer.NumberLiteral>('number literal').apply(tok => new ast.Literal(tok.num))).choice(
    new peg.Token<lexer.StringLiteral>('string literal').apply(tok => new ast.Literal(tok.str))).choice(
    new peg.Token<lexer.Identifier>("identifier").apply(ident => new ast.VarExpr(ident.name))).choice(
    new peg.Token("'('").chain(new peg.Indirect(expression_indirect)).chain(new peg.Token("')'")).apply(([[oparen, expr], cparen]) => expr));


let call =
    primary.chain(
        new peg.ZeroMore(new peg.Choice(new peg.Token("'('").chain(new peg.Optional(args)).chain(new peg.Token("')'")), new peg.Token("'.'").chain(new peg.Token("identifier"))))
    );

let unary: peg.PEG<ast.Expr>;
unary =
    (new peg.Token("'-'").choice(new peg.Token("'!'"))).chain(new peg.Indirect(() => unary!)).apply(([op, expr]) => {
        let op_ast;
        switch (op.type()) {
            case "'-'": op_ast = ast.UnaryOperator.Minus; break;
            case "'!'": op_ast = ast.UnaryOperator.Bang; break;
            default: throw Error('unreachable');
        }
        return new ast.UnaryExpr(op_ast, expr);
    })
    .choice(call);

let factor =
    new peg.Apply(astify_binary_expr,
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
    new peg.Apply(astify_binary_expr,
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
    new peg.Apply(astify_binary_expr,
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

let equality =
    new peg.Apply(astify_binary_expr,
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

let logic_and = equality.chain(new peg.ZeroMore(new peg.Token("'and'").chain(equality)));

let logic_or = logic_and.chain(new peg.ZeroMore(new peg.Token("'or'").chain(logic_and)));

let assignment: peg.PEG<ast.Expr>;
assignment =
    new peg.Optional(call.chain(new peg.Token("'.'"))).chain(new peg.Token("identifier")).chain(new peg.Token("'='")).chain(new peg.Indirect(() => assignment))
    .choice(logic_or);

expression = assignment;

let expr_stmt = new peg.Apply(([expr, semi]) => new ast.ExprStmt(expr), new peg.Chain(new peg.Indirect(expression_indirect), new peg.Token("';'")));

let print_stmt = new peg.Apply(([[print, expr], semi]) => new ast.ExprStmt(expr), new peg.Chain(new peg.Chain(new peg.Token("'print'"), new peg.Indirect(expression_indirect)), new peg.Token("';'")));

let var_decl: peg.PEG<ast.VarDecl>;
let statement: peg.PEG<ast.Stmt>;
let statement_indirect = () => statement!;
let declaration: peg.PEG<ast.Stmt>;
let declaration_indirect = () => declaration!;
let for_stmt: peg.PEG<ast.ForStmt> =
    new peg.Apply(
        () => (0),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
            new peg.Token("'for'"),
            new peg.Token("'('")),
            new peg.Choice(new peg.Choice(new peg.Indirect(() => var_decl!), expr_stmt), new peg.Token("';'"))),
            new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))),
            new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))),
            new peg.Token("')'")),
            new peg.Indirect(statement_indirect))
    );

let if_stmt =
    new peg.Apply(
        () => (0),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
            new peg.Token("'if'"),
            new peg.Token("'('")),
            new peg.Indirect(expression_indirect)),
            new peg.Token("')'")),
            new peg.Indirect(statement_indirect)),
            new peg.Optional(new peg.Chain(new peg.Token("'else'"), new peg.Indirect(statement_indirect)))),
    );

let return_stmt =
    new peg.Apply(
        () => 0,
        new peg.Chain(new peg.Chain(new peg.Token("'return'"), new peg.Optional(new peg.Indirect(expression_indirect))), new peg.Token("';'"))
    );

let while_stmt =
    new peg.Apply(
        () => (0),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
            new peg.Token("'while'"),
            new peg.Token("'('")),
            new peg.Indirect(expression_indirect)),
            new peg.Token("')'")),
            new peg.Indirect(statement_indirect))
    );

block =
    new peg.Apply(
        ([[obrace, decls], cbrace]) => decls,
        new peg.Chain(new peg.Chain(
            new peg.Token("'{'"),
            new peg.ZeroMore(new peg.Indirect(declaration_indirect))),
            new peg.Token("'}'")),
    );

statement = new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(new peg.Choice(
        expr_stmt,
        print_stmt),
        for_stmt),
        if_stmt),
        return_stmt),
        while_stmt),
        block);

var_decl =
    new peg.Apply(([[[var_, ident], m_initializer], semi]) => new ast.VarDecl(ident.name, m_initializer ? m_initializer[1] : null),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'var'"), new peg.Token<lexer.Identifier>("identifier")), new peg.Optional(new peg.Chain(new peg.Token("'='"), new peg.Indirect(expression_indirect)))), new peg.Token("';'")));

let fun_decl = new peg.Chain(new peg.Token("'fun'"), fn);

declaration = new peg.Choice(new peg.Choice(fun_decl, var_decl), statement);

let script: peg.PEG<ast.Stmt[]> = new peg.Apply(([stmts, eof]) => stmts, new peg.Chain(new peg.ZeroMore(declaration), new peg.Token("eof")));

export function parse([tokens, eof]: [diagnostics.Located<lexer.Token>[], diagnostics.Located<lexer.EOF>]): ast.Stmt[] | null {
    let parser = new peg.Parser(tokens, eof);
    let location = new peg.ParseLocation(parser, 0);

    let res = script.parse(parser, location);
    if (res) {
        return res[1];
    } else {
        parser.report_error();
        return null;
    }
}
