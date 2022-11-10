import * as lexer from './lexer';
import * as diagnostics from './diagnostics';
import * as ast from './ast';
import * as peg from './peg';

function astify_binary_expr([comp, ops]: [ast.Expr, [lexer.BinaryOperatorTokens, ast.Expr][]]) {
    let cur;
    while (cur = ops.shift()) {
        let [op, right] = cur;

        let op_ast;
        switch (op.type) {
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

let block: peg.PEG<ast.BlockStmt>;
let expression: peg.PEG<ast.Expr>;
let expression_indirect = () => expression!;

let args = new peg.Indirect(expression_indirect).chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Indirect(expression_indirect)))).apply(([first, more]) => [first].concat(more.map(x => x[1])));
let params = new peg.Token<lexer.Identifier>("identifier").chain(new peg.ZeroMore(new peg.Token("','").chain(new peg.Token<lexer.Identifier>("identifier")))).apply(([first, more]) => [first].concat(more.map(x => x[1])));
let fn: peg.PEG<[lexer.Identifier, lexer.Identifier[], ast.BlockStmt]> =
    new peg.Token<lexer.Identifier>("identifier").chain(new peg.Token("'('")).chain(new peg.Optional(params)).chain(new peg.Token("')'")).chain(new peg.Indirect(() => block))
    .apply(([[[[identifier, oparen], params], cparen], block]) => [identifier, params ? params : [], block]);

let primary: peg.PEG<ast.Expr> =
    new peg.Token<lexer.BoolLiteral>('bool literal').apply(tok => new ast.BoolLiteral(tok.bool)).choice(
    new peg.Token<lexer.Nil>("'nil'").apply(tok => new ast.NilLiteral())).choice(
    new peg.Token<lexer.NumberLiteral>('number literal').apply(tok => new ast.NumberLiteral(tok.num))).choice(
    new peg.Token<lexer.StringLiteral>('string literal').apply(tok => new ast.StringLiteral(tok.str))).choice(
    new peg.Token<lexer.Identifier>("identifier").apply(ident => new ast.VarExpr(ident.name))).choice(
    new peg.Token("'('").chain(new peg.Indirect(expression_indirect)).chain(new peg.Token("')'")).apply(([[oparen, expr], cparen]) => expr));


let call: peg.PEG<ast.Expr> =
    primary.chain(
        new peg.ZeroMore(new peg.Choice(
            new peg.Token("'('").chain(new peg.Optional(args)).chain(new peg.Token("')'")).apply(([[oparen, args], cparen]) => args),
            new peg.Token("'.'").chain(new peg.Token<lexer.Identifier>("identifier")).apply(([dot, ident]) => ident)
        ))
    ).apply(([expr, ops]) => {
        let cur_op;
        while (cur_op = ops.shift()) {
            if (cur_op instanceof lexer.Identifier) {
                let ident = cur_op;
            } else {
                let args;
                if (cur_op == null) { args = []; }
                else { args = cur_op[1]; }
            }
        }
        return expr;
    });

let unary: peg.PEG<ast.Expr>;
unary =
    (new peg.Token("'-'").choice(new peg.Token("'!'"))).chain(new peg.Indirect(() => unary!)).apply(([op, expr]) => {
        let op_ast;
        switch (op.type) {
            case "'-'": op_ast = ast.UnaryOperator.Minus; break;
            case "'!'": op_ast = ast.UnaryOperator.Bang; break;
            default: throw Error('unreachable');
        }
        return new ast.UnaryExpr(op_ast, expr);
    })
    .choice(call);

let factor: peg.PEG<ast.Expr> =
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

let logic_and = equality.chain(new peg.ZeroMore(new peg.Token("'and'").chain(equality))).apply(astify_binary_expr);

let logic_or = logic_and.chain(new peg.ZeroMore(new peg.Token("'or'").chain(logic_and))).apply(astify_binary_expr);

let assignment: peg.PEG<ast.Expr>;
assignment =
    new peg.Optional(call.chain(new peg.Token("'.'"))).chain(new peg.Token<lexer.Identifier>("identifier")).chain(new peg.Token("'='")).chain(new peg.Indirect(() => assignment))
        .apply(([[[m_call, ident], eq], assignment]) => new ast.AssignExpr(ident.name, assignment))
    .choice(logic_or);

expression = assignment;

let expr_stmt = new peg.Apply(([expr, semi]) => new ast.ExprStmt(expr), new peg.Chain(new peg.Indirect(expression_indirect), new peg.Token("';'")));

let print_stmt = new peg.Apply(([[print, expr], semi]) => new ast.ExprStmt(expr), new peg.Chain(new peg.Chain(new peg.Token("'print'"), new peg.Indirect(expression_indirect)), new peg.Token("';'")));

let var_decl: peg.PEG<ast.VarStmt>;
let statement: peg.PEG<ast.Stmt>;
let statement_indirect = () => statement!;
let declaration: peg.PEG<ast.Stmt>;
let declaration_indirect = () => declaration!;
let for_stmt: peg.PEG<ast.ForStmt> =
    new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
        new peg.Token("'for'"),
        new peg.Token("'('")),
        new peg.Choice(new peg.Choice(new peg.Indirect(() => var_decl!), expr_stmt), new peg.Token("';'"))),
        new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))),
        new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))),
        new peg.Token("')'")),
        new peg.Indirect(statement_indirect))
        .apply(([[[[[[for_, oparen], initializer], cond], inc], cparen], body]) => {
            let initializer_;
            if (initializer instanceof lexer.Token) { initializer_ = null; }
            else { initializer_ = initializer; }

            return new ast.ForStmt(initializer_, cond[0], inc[0], body);
        })

let if_stmt =
    new peg.Apply(
        ([[[[[if_, oparen], cond], cparen], body], m_else]) => new ast.IfStmt(cond, body, m_else ? m_else[1] : null),
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
        ([[return_, m_expr], semi]) => new ast.ReturnStmt(m_expr),
        new peg.Chain(new peg.Chain(new peg.Token("'return'"), new peg.Optional(new peg.Indirect(expression_indirect))), new peg.Token("';'"))
    );

let while_stmt =
    new peg.Apply(
        ([[[[while_, oparen], cond], cparen], body]) => new ast.WhileStmt(cond, body),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
            new peg.Token("'while'"),
            new peg.Token("'('")),
            new peg.Indirect(expression_indirect)),
            new peg.Token("')'")),
            new peg.Indirect(statement_indirect))
    );

block =
    new peg.Apply(
        ([[obrace, decls], cbrace]) => new ast.BlockStmt(decls),
        new peg.Chain(new peg.Chain(
            new peg.Token("'{'"),
            new peg.ZeroMore(new peg.Indirect(declaration_indirect))),
            new peg.Token("'}'")),
    );

statement =
        expr_stmt
        .choice(print_stmt)
        .choice(for_stmt)
        .choice(if_stmt)
        .choice(return_stmt)
        .choice(while_stmt)
        .choice(block);

var_decl =
    new peg.Apply(([[[var_, ident], m_initializer], semi]) => new ast.VarStmt(ident.name, m_initializer ? m_initializer[1] : null),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'var'"), new peg.Token<lexer.Identifier>("identifier")), new peg.Optional(new peg.Chain(new peg.Token("'='"), new peg.Indirect(expression_indirect)))), new peg.Token("';'")));

let fun_decl = new peg.Chain(new peg.Token("'fun'"), fn).apply(([fun, [identifier, params, block]]) => new ast.FunctionStmt(identifier.name, params.map(x => x.name), block));

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
