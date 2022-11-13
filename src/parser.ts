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
            case  "'>'": op_ast = ast.BinaryOperator.Greater; break;
            case  "'<='": op_ast = ast.BinaryOperator.LessEqual; break;
            case  "'=='": op_ast = ast.BinaryOperator.EqualEqual; break;
            case  "'>='": op_ast = ast.BinaryOperator.GreaterEqual; break;
            case  "'!='": op_ast = ast.BinaryOperator.BangEqual; break;

            default: throw Error('unreachable');
        }

        comp = { type: 'BinaryExpr', span: diagnostics.join_spans(comp.span, right.span), left: comp, right, op: op_ast };
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

let primary: peg.PEG<ast.BoolLiteral | ast.NilLiteral | ast.NumberLiteral | ast.StringLiteral | ast.VarExpr | ast.Expr> =
    new peg.Token<lexer.BoolLiteral>('bool literal').apply(tok => ({ type: 'BoolLiteral', span: tok.span, value: tok.bool } as const)).choice(
    new peg.Token<lexer.Nil>("'nil'").apply(tok => ({ type: 'NilLiteral', span: tok.span} as const))).choice(
    new peg.Token<lexer.NumberLiteral>('number literal').apply(tok => ({ type: 'NumberLiteral', span: tok.span, value: tok.num } as const))).choice(
    new peg.Token<lexer.StringLiteral>('string literal').apply(tok => ({ type: 'StringLiteral', span: tok.span, value: tok.str } as const))).choice(
    new peg.Token<lexer.Identifier>("identifier").apply(ident => ({ type: 'VarExpr', span: ident.span, name: ident.name } as const))).choice(
    new peg.Token("'('").chain(new peg.Indirect(expression_indirect)).chain(new peg.Token("')'")).apply(([[oparen, expr], cparen]) => expr)); // TODO: track parenthesized expressions


let call: peg.PEG<ast.Expr> =
    primary.chain(
        new peg.ZeroMore(new peg.Choice(
            new peg.Token("'('").chain(new peg.Optional(args)).chain(new peg.Token("')'")).apply(([[oparen, args], cparen]) => { let x: [ast.Expr[] | null, lexer.Token & diagnostics.Located] = [args, cparen]; return x }),
            new peg.Token("'.'").chain(new peg.Token<lexer.Identifier>("identifier")).apply(([dot, ident]) => ident)
        ))
    ).apply(([expr, ops]) => {
        let cur_op;
        while (cur_op = ops.shift()) {
            if (cur_op instanceof lexer.Identifier) {
                let ident = cur_op;
                // expr =
                throw new Error("not implemented yet"); // TODO
            } else {
                let a: ast.Expr[];
                if (cur_op[0]) { a = cur_op[0] as ast.Expr[]; }
                else { a = []; }
                expr = ({ type: 'CallExpr', span: diagnostics.join_spans(expr.span, cur_op[1].span), callee: expr, args: a } as const);
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
        return ({ type: 'UnaryExpr', span: diagnostics.join_spans(op.span, expr.span), operator: op_ast, operand: expr } as const);
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
        .apply(([[[m_call, ident], eq], assignment]) => ({ type: 'AssignExpr', span: diagnostics.join_spans(m_call ? m_call[0].span : ident.span, assignment.span), name: ident.name, value: assignment } as const))
    .choice(logic_or);

expression = assignment;

let expr_stmt = new peg.Apply(([expr, semi]) => ({ type: 'ExprStmt', span: diagnostics.join_spans(expr.span, semi.span), expr } as const), new peg.Chain(new peg.Indirect(expression_indirect), new peg.Token("';'")));

let print_stmt = new peg.Apply(([[print, expr], semi]) => ({ type: 'PrintStmt', span: diagnostics.join_spans(print.span, semi.span), expr } as const), new peg.Chain(new peg.Chain(new peg.Token("'print'"), new peg.Indirect(expression_indirect)), new peg.Token("';'")));

let var_decl: peg.PEG<ast.VarStmt>;
let statement: peg.PEG<ast.Stmt>;
let statement_indirect = () => statement!;
let declaration: peg.PEG<ast.Stmt>;
let declaration_indirect = () => declaration!;
let for_stmt: peg.PEG<ast.ForStmt> =
    new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
        new peg.Token("'for'"),
        new peg.Token("'('")),
        new peg.Choice(new peg.Choice(new peg.Indirect(() => var_decl!), expr_stmt), new peg.Token("';'").apply(() => null))),
        new peg.Chain(new peg.Optional(new peg.Indirect(expression_indirect)), new peg.Token("';'"))),
        new peg.Optional(new peg.Indirect(expression_indirect))),
        new peg.Token("')'")),
        new peg.Indirect(statement_indirect))
        .apply(([[[[[[for_, oparen], initializer], cond], inc], cparen], body]) => {
            return ({ type: 'ForStmt', span: diagnostics.join_spans(for_.span, body.span), initializer, compare: cond[0], increment: inc, body, for_sp: for_.span } as const);
        })

let if_stmt =
    new peg.Apply(
        ([[[[[if_, oparen], cond], cparen], body], m_else]) => ({ type: 'IfStmt', span: diagnostics.join_spans(if_.span, m_else ? m_else[1].span : body.span), condition: cond, then_branch: body, else_branch: m_else ? m_else[1] : null } as const),
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
        ([[return_, m_expr], semi]) => ({ type: 'ReturnStmt', span: diagnostics.join_spans(return_.span, semi.span), value: m_expr } as const),
        new peg.Chain(new peg.Chain(new peg.Token("'return'"), new peg.Optional(new peg.Indirect(expression_indirect))), new peg.Token("';'"))
    );

let while_stmt =
    new peg.Apply(
        ([[[[while_, oparen], cond], cparen], body]) => ({ type: 'WhileStmt', span: diagnostics.join_spans(while_.span, body.span), condition: cond, body } as const),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Chain(
            new peg.Token("'while'"),
            new peg.Token("'('")),
            new peg.Indirect(expression_indirect)),
            new peg.Token("')'")),
            new peg.Indirect(statement_indirect))
    );

block =
    new peg.Apply(
        ([[obrace, stmts], cbrace]) => ({ type: 'BlockStmt', span: diagnostics.join_spans(obrace.span, cbrace.span), stmts, obrace_sp: obrace.span, cbrace_sp: cbrace.span }),
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
    new peg.Apply(([[[var_, ident], m_initializer], semi]) => ({ type: 'VarStmt', span: diagnostics.join_spans(var_.span, semi.span), name: ident.name, initializer: m_initializer ? m_initializer[1] : null }),
        new peg.Chain(new peg.Chain(new peg.Chain(new peg.Token("'var'"), new peg.Token<lexer.Identifier>("identifier")), new peg.Optional(new peg.Chain(new peg.Token("'='"), new peg.Indirect(expression_indirect)))), new peg.Token("';'")));

let fun_decl = new peg.Chain(new peg.Token("'fun'"), fn).apply(([fun, [identifier, params, block]]) => ({ type: 'FunctionStmt', span: diagnostics.join_spans(fun.span, block.span), name: identifier.name, params: params.map(x => x.name), body: block } as const));

declaration = new peg.Choice(new peg.Choice(fun_decl, var_decl), statement);

let script: peg.PEG<ast.Stmt[]> = new peg.Apply(([stmts, eof]) => stmts, new peg.Chain(new peg.ZeroMore(declaration), new peg.Token("eof")));

export function parse([tokens, eof]: [(lexer.Token & diagnostics.Located)[], lexer.EOF & diagnostics.Located]): ast.Stmt[] | null {
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
